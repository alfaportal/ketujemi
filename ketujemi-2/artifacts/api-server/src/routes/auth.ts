import { randomInt, randomUUID } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq, desc, and, lt, gt } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  usersTable,
  phoneVerifyChallengesTable,
  emailVerifyChallengesTable,
} from "@workspace/db";
import { vonageVerifyRequest, vonageVerifyCheck } from "../lib/vonage-verify";
import { sendEmailVerification } from "../lib/send-email";
import {
  setUserSessionCookie,
  clearUserSessionCookie,
  publicUser,
} from "../lib/user-session";

const router = Router();

const CHALLENGE_TTL_MS = 1000 * 60 * 15;
const MIN_PASSWORD = 6;

function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const d = input.replace(/\D/g, "");
  if (d.length < 8 || d.length > 15) return null;
  return d;
}

function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const e = input.trim().toLowerCase();
  if (e.length < 5 || e.length > 254 || !e.includes("@")) return null;
  return e;
}

function appOrigin(req: { get: (name: string) => string | undefined }): string {
  const env = process.env["PUBLIC_APP_ORIGIN"]?.replace(/\/$/, "");
  if (env) return env;
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const proto = req.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:5173";
}

function sixDigitCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

async function sessionUserId(req: {
  signedCookies?: Record<string, string | undefined>;
}): Promise<number | null> {
  const raw = req.signedCookies?.kj_session;
  const id = raw != null ? Number(raw) : NaN;
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

// ─── POST /auth/register/email ────────────────────────────────────────────────
router.post("/auth/register/email", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || password.length < MIN_PASSWORD) {
      res.status(400).json({ error: `Invalid email or password (min ${MIN_PASSWORD} chars)` });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    await db
      .delete(emailVerifyChallengesTable)
      .where(lt(emailVerifyChallengesTable.expires_at, new Date()));

    const hash = await bcrypt.hash(password, 10);
    const code = sixDigitCode();
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

    await db.insert(emailVerifyChallengesTable).values({
      email,
      password_hash: hash,
      code,
      token,
      expires_at: expiresAt,
    });

    const verifyUrl = `${appOrigin(req)}/api/auth/verify/email/link?token=${encodeURIComponent(token)}`;
    await sendEmailVerification({ to: email, code, verifyUrl });

    res.status(201).json({ ok: true, needsVerification: true });
  } catch (err) {
    req.log?.error({ err }, "register email");
    res.status(500).json({ error: "Registration failed" });
  }
});

// ─── POST /auth/verify/email ──────────────────────────────────────────────────
router.post("/auth/verify/email", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";

    let challenge;
    if (token) {
      [challenge] = await db
        .select()
        .from(emailVerifyChallengesTable)
        .where(
          and(
            eq(emailVerifyChallengesTable.token, token),
            gt(emailVerifyChallengesTable.expires_at, new Date()),
          ),
        )
        .limit(1);
    } else if (email && code.length >= 4) {
      [challenge] = await db
        .select()
        .from(emailVerifyChallengesTable)
        .where(
          and(
            eq(emailVerifyChallengesTable.email, email),
            eq(emailVerifyChallengesTable.code, code),
            gt(emailVerifyChallengesTable.expires_at, new Date()),
          ),
        )
        .orderBy(desc(emailVerifyChallengesTable.created_at))
        .limit(1);
    } else {
      res.status(400).json({ error: "Email and code, or token required" });
      return;
    }

    if (!challenge) {
      res.status(400).json({ error: "Invalid or expired verification" });
      return;
    }

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, challenge.email))
      .limit(1);
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const [row] = await db
      .insert(usersTable)
      .values({
        email: challenge.email,
        password_hash: challenge.password_hash,
        email_verified_at: new Date(),
      })
      .returning();

    await db
      .delete(emailVerifyChallengesTable)
      .where(eq(emailVerifyChallengesTable.id, challenge.id));

    setUserSessionCookie(res, row.id);
    res.json({ user: publicUser(row) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    req.log?.error({ err }, "verify email");
    res.status(400).json({ error: "Verification failed" });
  }
});

// ─── GET /auth/verify/email/link ──────────────────────────────────────────────
router.get("/auth/verify/email/link", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token.trim() : "";
  const returnTo =
    typeof req.query.return === "string" && req.query.return.startsWith("/")
      ? req.query.return
      : "/";

  if (!token) {
    res.redirect(302, `${appOrigin(req)}/login?error=verify`);
    return;
  }

  try {
    const [challenge] = await db
      .select()
      .from(emailVerifyChallengesTable)
      .where(
        and(
          eq(emailVerifyChallengesTable.token, token),
          gt(emailVerifyChallengesTable.expires_at, new Date()),
        ),
      )
      .limit(1);

    if (!challenge) {
      res.redirect(302, `${appOrigin(req)}/login?error=verify`);
      return;
    }

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, challenge.email))
      .limit(1);

    let user = existing;
    if (!user) {
      const [created] = await db
        .insert(usersTable)
        .values({
          email: challenge.email,
          password_hash: challenge.password_hash,
          email_verified_at: new Date(),
        })
        .returning();
      user = created;
    }

    await db
      .delete(emailVerifyChallengesTable)
      .where(eq(emailVerifyChallengesTable.id, challenge.id));

    setUserSessionCookie(res, user.id);
    res.redirect(302, `${appOrigin(req)}${returnTo}`);
  } catch (err) {
    req.log?.error({ err }, "verify email link");
    res.redirect(302, `${appOrigin(req)}/login?error=verify`);
  }
});

// ─── POST /auth/login/email ─────────────────────────────────────────────────
router.post("/auth/login/email", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user?.password_hash) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    setUserSessionCookie(res, user.id);
    res.json({ user: publicUser(user) });
  } catch (err) {
    req.log?.error({ err }, "login email");
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── POST /auth/logout ──────────────────────────────────────────────────────
router.post("/auth/logout", (_req, res) => {
  clearUserSessionCookie(res);
  res.json({ ok: true });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/auth/me", async (req, res) => {
  const id = await sessionUserId(req);
  if (id == null) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) {
    clearUserSessionCookie(res);
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  res.json({ user: publicUser(user) });
});

// ─── PATCH /auth/profile ──────────────────────────────────────────────────────
router.patch("/auth/profile", async (req, res) => {
  const id = await sessionUserId(req);
  if (id == null) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  const body = req.body ?? {};
  const patch: Partial<typeof usersTable.$inferInsert> = {};

  if (typeof body.display_name === "string") {
    const v = body.display_name.trim();
    patch.display_name = v.length ? v.slice(0, 120) : null;
  }
  if (typeof body.contact_phone === "string") {
    const digits = body.contact_phone.replace(/\D/g, "");
    patch.contact_phone = digits.length >= 8 ? digits.slice(0, 20) : null;
  }
  if (typeof body.profile_photo_url === "string") {
    const v = body.profile_photo_url.trim();
    patch.profile_photo_url = v.length ? v.slice(0, 2048) : null;
  }
  if (typeof body.city === "string") {
    const v = body.city.trim();
    patch.city = v.length ? v.slice(0, 120) : null;
  }
  if (typeof body.about_me === "string") {
    const v = body.about_me.trim();
    patch.about_me = v.length ? v.slice(0, 2000) : null;
  }

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: "No valid fields" });
    return;
  }

  const [row] = await db
    .update(usersTable)
    .set(patch)
    .where(eq(usersTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user: publicUser(row) });
});

// ─── POST /auth/sms/start ───────────────────────────────────────────────────
router.post("/auth/sms/start", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const isRegister = req.body?.intent === "register";

    if (!phone) {
      res.status(400).json({ error: "Invalid phone number" });
      return;
    }

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone_e164_digits, phone))
      .limit(1);

    if (isRegister) {
      if (existing) {
        res.status(409).json({ error: "Phone already registered" });
        return;
      }
      if (password.length < MIN_PASSWORD) {
        res.status(400).json({ error: `Password required (min ${MIN_PASSWORD} chars)` });
        return;
      }
    }

    let passwordHash: string | null = null;
    if (isRegister && password.length >= MIN_PASSWORD) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    await db
      .delete(phoneVerifyChallengesTable)
      .where(lt(phoneVerifyChallengesTable.expires_at, new Date()));

    const requestId = await vonageVerifyRequest(phone);
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

    await db.insert(phoneVerifyChallengesTable).values({
      phone_e164_digits: phone,
      request_id: requestId,
      password_hash: passwordHash,
      expires_at: expiresAt,
    });

    res.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "SMS start failed";
    req.log?.error({ err }, "sms start");
    res.status(502).json({ error: msg });
  }
});

// ─── POST /auth/sms/verify ──────────────────────────────────────────────────
router.post("/auth/sms/verify", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    if (!phone || code.length < 4) {
      res.status(400).json({ error: "Phone and verification code required" });
      return;
    }

    const [challenge] = await db
      .select()
      .from(phoneVerifyChallengesTable)
      .where(
        and(
          eq(phoneVerifyChallengesTable.phone_e164_digits, phone),
          gt(phoneVerifyChallengesTable.expires_at, new Date()),
        ),
      )
      .orderBy(desc(phoneVerifyChallengesTable.created_at))
      .limit(1);

    if (!challenge) {
      res.status(400).json({ error: "No active verification for this number. Request a new code." });
      return;
    }

    await vonageVerifyCheck(challenge.request_id, code);

    await db
      .delete(phoneVerifyChallengesTable)
      .where(eq(phoneVerifyChallengesTable.id, challenge.id));

    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone_e164_digits, phone))
      .limit(1);

    if (!user) {
      const [created] = await db
        .insert(usersTable)
        .values({
          phone_e164_digits: phone,
          password_hash: challenge.password_hash ?? null,
          contact_phone: phone,
        })
        .returning();
      user = created;
    } else if (challenge.password_hash && !user.password_hash) {
      const [updated] = await db
        .update(usersTable)
        .set({ password_hash: challenge.password_hash })
        .where(eq(usersTable.id, user.id))
        .returning();
      user = updated;
    }

    setUserSessionCookie(res, user.id);
    res.json({ user: publicUser(user) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    req.log?.error({ err }, "sms verify");
    res.status(400).json({ error: msg });
  }
});

export default router;
