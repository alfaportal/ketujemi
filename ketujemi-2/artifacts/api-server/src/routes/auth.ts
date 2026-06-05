import { randomInt, randomUUID } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq, desc, and, lt, gt } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  usersTable,
  phoneVerifyChallengesTable,
  emailVerifyChallengesTable,
  type User,
} from "@workspace/db";
import { vonageVerifyRequest, vonageVerifyCheck } from "../lib/vonage-verify";
import { sendEmailVerification, sendPasswordResetEmail } from "../lib/send-email";
import {
  setUserSessionCookie,
  clearUserSessionCookie,
  publicUser,
} from "../lib/user-session";
import { normalizePhone } from "../lib/phone-prefixes";
import { assertSmsStartAllowed, clientIp } from "../lib/sms-rate-limit";
import { authLoginRegisterLimiter } from "../lib/express-rate-limiters";
import { hasEmailDeliveryConfigured, isEmailVerificationRequired } from "../lib/email-auth";
import { isSmsAuthEnabled, SMS_AUTH_DISABLED_MESSAGE } from "../lib/sms-auth";
import { isRecaptchaRequired, verifyRecaptchaToken } from "../lib/recaptcha-verify";
import { assertAccountActive, isUserBanned } from "../lib/user-ban";
import { getBusinessQuotaStatus } from "../lib/business-quota";
import { isBusinessAccount } from "../lib/business-rules";
import {
  isBusinessPartnerActive,
  normalizePartnerLink,
  serializePartnerBannerUrls,
  type PartnerLinkType,
} from "../lib/business-partner";

const router = Router();

const CHALLENGE_TTL_MS = 1000 * 60 * 15;
const MIN_PASSWORD = 6;

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

async function sendEmailCodeChallenge(
  req: { get: (name: string) => string | undefined },
  email: string,
  passwordHash: string,
): Promise<void> {
  await db
    .delete(emailVerifyChallengesTable)
    .where(eq(emailVerifyChallengesTable.email, email));

  const code = sixDigitCode();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

  await db.insert(emailVerifyChallengesTable).values({
    email,
    password_hash: passwordHash,
    code,
    token,
    expires_at: expiresAt,
  });

  const verifyUrl = `${appOrigin(req)}/api/auth/verify/email/link?token=${encodeURIComponent(token)}`;
  await sendEmailVerification({ to: email, code, verifyUrl });
}

async function loginExistingEmailUser(
  res: Parameters<typeof setUserSessionCookie>[0],
  existing: User,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; status: number; body: Record<string, string> }> {
  if (isUserBanned(existing)) {
    return { ok: false, status: 403, body: { error: "Account suspended" } };
  }
  if (existing.password_hash) {
    const match = await bcrypt.compare(password, existing.password_hash);
    if (!match) {
      return {
        ok: false,
        status: 401,
        body: { error: "INVALID_CREDENTIALS", message: "Fjalëkalim i gabuar." },
      };
    }
    setUserSessionCookie(res, existing.id);
    return { ok: true, user: existing };
  }
  const hash = await bcrypt.hash(password, 10);
  const [updated] = await db
    .update(usersTable)
    .set({
      password_hash: hash,
      email_verified_at: existing.email_verified_at ?? new Date(),
    })
    .where(eq(usersTable.id, existing.id))
    .returning();
  const loggedIn = updated ?? existing;
  setUserSessionCookie(res, loggedIn.id);
  return { ok: true, user: loggedIn };
}

async function completeEmailChallengeLogin(
  res: Parameters<typeof setUserSessionCookie>[0],
  challenge: { id: number; email: string; password_hash: string },
  existing: User,
) {
  let user = existing;
  if (!existing.password_hash) {
    const [updated] = await db
      .update(usersTable)
      .set({
        password_hash: challenge.password_hash,
        email_verified_at: existing.email_verified_at ?? new Date(),
      })
      .where(eq(usersTable.id, existing.id))
      .returning();
    user = updated ?? existing;
  }

  if (isUserBanned(user)) {
    return { banned: true as const };
  }

  await db
    .delete(emailVerifyChallengesTable)
    .where(eq(emailVerifyChallengesTable.id, challenge.id));

  setUserSessionCookie(res, user.id);
  return { banned: false as const, user };
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
router.post("/auth/register/email", authLoginRegisterLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || password.length < MIN_PASSWORD) {
      res.status(400).json({ error: `Invalid email or password (min ${MIN_PASSWORD} chars)` });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      const loginResult = await loginExistingEmailUser(res, existing, password);
      if (!loginResult.ok) {
        res.status(loginResult.status).json(loginResult.body);
        return;
      }
      res.json({
        ok: true,
        needsVerification: false,
        existingAccount: true,
        user: publicUser(loginResult.user, { self: true }),
      });
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    async function createUserNow() {
      const [row] = await db
        .insert(usersTable)
        .values({
          email,
          password_hash: hash,
          email_verified_at: new Date(),
        })
        .returning();
      setUserSessionCookie(res, row.id);
      return row;
    }

    if (!isEmailVerificationRequired()) {
      const row = await createUserNow();
      res.status(201).json({
        ok: true,
        needsVerification: false,
        user: publicUser(row, { self: true }),
      });
      return;
    }

    if (!hasEmailDeliveryConfigured()) {
      res.status(503).json({
        error: "EMAIL_NOT_CONFIGURED",
        message:
          "Verifikimi me email nuk është i konfiguruar. Vendosni RESEND_API_KEY + EMAIL_FROM në server.",
      });
      return;
    }

    await db
      .delete(emailVerifyChallengesTable)
      .where(lt(emailVerifyChallengesTable.expires_at, new Date()));

    await sendEmailCodeChallenge(req, email, hash);
    res.status(201).json({ ok: true, needsVerification: true });
  } catch (err) {
    req.log?.error({ err }, "register email");
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Email send failed")) {
      res.status(502).json({
        error: "EMAIL_SEND_FAILED",
        message: "Nuk u dërgua emaili i verifikimit. Provo përsëri ose kontrollo adresën.",
      });
      return;
    }
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
      if (email && code.length >= 4) {
        const [active] = await db
          .select({ id: emailVerifyChallengesTable.id })
          .from(emailVerifyChallengesTable)
          .where(
            and(
              eq(emailVerifyChallengesTable.email, email),
              gt(emailVerifyChallengesTable.expires_at, new Date()),
            ),
          )
          .orderBy(desc(emailVerifyChallengesTable.created_at))
          .limit(1);
        if (active) {
          res.status(400).json({
            error: "INVALID_CODE",
            message:
              "Kodi është i gabuar. Shiko emailin dhe provo përsëri, ose dërgo kod të ri më poshtë.",
          });
          return;
        }
      }
      res.status(400).json({
        error: "CODE_EXPIRED",
        message:
          "Kodi ka skaduar ose nuk ekziston. Kthehu mbrapa, shkruaj email + fjalëkalim dhe merr kod të ri.",
      });
      return;
    }

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, challenge.email))
      .limit(1);

    if (existing) {
      const result = await completeEmailChallengeLogin(res, challenge, existing);
      if (result.banned) {
        res.status(403).json({ error: "Account suspended" });
        return;
      }
      res.json({ user: publicUser(result.user, { self: true }) });
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
    res.json({ user: publicUser(row, { self: true }) });
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
    } else {
      const result = await completeEmailChallengeLogin(res, challenge, existing);
      if (result.banned) {
        res.redirect(302, `${appOrigin(req)}/login?error=suspended`);
        return;
      }
      user = result.user;
      res.redirect(302, `${appOrigin(req)}${returnTo}`);
      return;
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

// ─── POST /auth/login/email/start — instant login (no code) for existing email ─
router.post("/auth/login/email/start", authLoginRegisterLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || password.length < MIN_PASSWORD) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(404).json({
        error: "NOT_REGISTERED",
        message: "Ky email nuk është regjistruar.",
      });
      return;
    }
    const loginResult = await loginExistingEmailUser(res, user, password);
    if (!loginResult.ok) {
      res.status(loginResult.status).json(loginResult.body);
      return;
    }
    res.json({ ok: true, needsVerification: false, user: publicUser(loginResult.user, { self: true }) });
  } catch (err) {
    req.log?.error({ err }, "login email start");
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── POST /auth/login/email — instant login when email codes are off ────────
router.post("/auth/login/email", authLoginRegisterLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Email ose fjalëkalim i gabuar.",
      });
      return;
    }

    if (!user.password_hash) {
      if (password.length < MIN_PASSWORD) {
        res.status(401).json({
          error: "INVALID_CREDENTIALS",
          message: "Email ose fjalëkalim i gabuar.",
        });
        return;
      }
      const hash = await bcrypt.hash(password, 10);
      const [updated] = await db
        .update(usersTable)
        .set({
          password_hash: hash,
          email_verified_at: user.email_verified_at ?? new Date(),
        })
        .where(eq(usersTable.id, user.id))
        .returning();
      const loggedIn = updated ?? user;
      if (isUserBanned(loggedIn)) {
        res.status(403).json({ error: "Account suspended" });
        return;
      }
      setUserSessionCookie(res, loggedIn.id);
      res.json({ user: publicUser(loggedIn, { self: true }) });
      return;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Email ose fjalëkalim i gabuar.",
      });
      return;
    }

    if (isUserBanned(user)) {
      res.status(403).json({ error: "Account suspended" });
      return;
    }

    setUserSessionCookie(res, user.id);
    res.json({ user: publicUser(user, { self: true }) });
  } catch (err) {
    req.log?.error({ err }, "login email");
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── POST /auth/password/forgot — send reset code (no password needed) ────────
router.post("/auth/password/forgot", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      res.status(400).json({ error: "Email required" });
      return;
    }

    const genericOk = {
      ok: true,
      message: "Nëse ky email është i regjistruar, do të marrësh një kod.",
    };

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.json(genericOk);
      return;
    }

    if (!hasEmailDeliveryConfigured()) {
      res.status(503).json({
        error: "EMAIL_NOT_CONFIGURED",
        message:
          "Emaili nuk është i konfiguruar. Vendosni RESEND_API_KEY + EMAIL_FROM në server.",
      });
      return;
    }

    await db.delete(emailVerifyChallengesTable).where(eq(emailVerifyChallengesTable.email, email));

    const code = sixDigitCode();
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
    const placeholderHash = await bcrypt.hash(randomUUID(), 10);

    await db.insert(emailVerifyChallengesTable).values({
      email,
      password_hash: placeholderHash,
      code,
      token,
      expires_at: expiresAt,
    });

    await sendPasswordResetEmail({ to: email, code, verifyUrl: "" });
    res.json(genericOk);
  } catch (err) {
    req.log?.error({ err }, "password forgot");
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Email send failed")) {
      res.status(502).json({ error: "EMAIL_SEND_FAILED", message: "Nuk u dërgua emaili." });
      return;
    }
    res.status(500).json({ error: "Forgot password failed" });
  }
});

// ─── POST /auth/password/reset — code + new password ────────────────────────
router.post("/auth/password/reset", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    const newPassword = typeof req.body?.new_password === "string" ? req.body.new_password : "";
    if (!email || code.length < 4 || newPassword.length < MIN_PASSWORD) {
      res.status(400).json({
        error: "INVALID_INPUT",
        message: `Email, kodi dhe fjalëkalimi i ri (min ${MIN_PASSWORD} karaktere) kërkohen.`,
      });
      return;
    }

    const [challenge] = await db
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

    if (!challenge) {
      const [active] = await db
        .select({ id: emailVerifyChallengesTable.id })
        .from(emailVerifyChallengesTable)
        .where(
          and(
            eq(emailVerifyChallengesTable.email, email),
            gt(emailVerifyChallengesTable.expires_at, new Date()),
          ),
        )
        .limit(1);
      res.status(400).json({
        error: active ? "INVALID_CODE" : "CODE_EXPIRED",
        message: active
          ? "Kodi është i gabuar. Provo përsëri."
          : "Kodi ka skaduar. Kërko kod të ri.",
      });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(404).json({ error: "NOT_REGISTERED" });
      return;
    }
    if (isUserBanned(user)) {
      res.status(403).json({ error: "Account suspended" });
      return;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const [updated] = await db
      .update(usersTable)
      .set({
        password_hash: hash,
        email_verified_at: user.email_verified_at ?? new Date(),
      })
      .where(eq(usersTable.id, user.id))
      .returning();

    await db
      .delete(emailVerifyChallengesTable)
      .where(eq(emailVerifyChallengesTable.id, challenge.id));

    setUserSessionCookie(res, updated!.id);
    res.json({ ok: true, user: publicUser(updated!, { self: true }) });
  } catch (err) {
    req.log?.error({ err }, "password reset");
    res.status(500).json({ error: "Password reset failed" });
  }
});

// ─── POST /auth/password/change ─────────────────────────────────────────────
router.post("/auth/password/change", async (req, res) => {
  try {
    const id = await sessionUserId(req);
    if (id == null) {
      res.status(401).json({ error: "Not logged in" });
      return;
    }

    const currentPassword =
      typeof req.body?.current_password === "string" ? req.body.current_password : "";
    const newPassword = typeof req.body?.new_password === "string" ? req.body.new_password : "";
    if (newPassword.length < MIN_PASSWORD) {
      res.status(400).json({
        error: "WEAK_PASSWORD",
        message: `Fjalëkalimi i ri duhet të ketë të paktën ${MIN_PASSWORD} karaktere.`,
      });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user?.email) {
      res.status(400).json({
        error: "NO_EMAIL_ACCOUNT",
        message: "Ndryshimi i fjalëkalimit vlen vetëm për llogaritë me email.",
      });
      return;
    }

    if (user.password_hash) {
      if (!currentPassword) {
        res.status(400).json({
          error: "CURRENT_PASSWORD_REQUIRED",
          message: "Shkruaj fjalëkalimin aktual.",
        });
        return;
      }
      const ok = await bcrypt.compare(currentPassword, user.password_hash);
      if (!ok) {
        res.status(401).json({
          error: "WRONG_PASSWORD",
          message: "Fjalëkalimi aktual është i gabuar.",
        });
        return;
      }
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const [updated] = await db
      .update(usersTable)
      .set({ password_hash: hash })
      .where(eq(usersTable.id, user.id))
      .returning();

    if (!updated) {
      res.status(500).json({ error: "Update failed" });
      return;
    }

    setUserSessionCookie(res, updated.id);
    res.json({ ok: true, user: publicUser(updated, { self: true }) });
  } catch (err) {
    req.log?.error({ err }, "password change");
    res.status(500).json({ error: "Password change failed" });
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

  if (isUserBanned(user)) {
    clearUserSessionCookie(res);
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  res.json({ user: publicUser(user, { self: true }) });
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
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (typeof body.partner_logo_url === "string") {
    if (!isBusinessPartnerActive(existing)) {
      res.status(403).json({
        error: "BUSINESS_NOT_ACTIVE",
        message: "Logo partner mund të ndryshohet vetëm pas aktivizimit nga administratori.",
      });
      return;
    }
    const v = body.partner_logo_url.trim();
    patch.partner_logo_url = v.length ? v.slice(0, 2048) : null;
  }

  if (body.partner_link != null && isBusinessAccount(existing)) {
    if (!isBusinessPartnerActive(existing)) {
      res.status(403).json({
        error: "BUSINESS_NOT_ACTIVE",
        message: "Linku mund të shtohet vetëm pas aktivizimit nga administratori.",
      });
      return;
    }
    const type = String((body.partner_link as { type?: string })?.type ?? "").trim() as PartnerLinkType;
    const url = String((body.partner_link as { url?: string })?.url ?? "").trim();
    if (!["website", "instagram", "facebook"].includes(type)) {
      res.status(400).json({ error: "Invalid partner_link.type" });
      return;
    }
    const norm = normalizePartnerLink(type, url);
    if (!norm.ok) {
      res.status(400).json({ error: norm.message });
      return;
    }
    patch.partner_link_type = norm.type;
    patch.partner_link_url = norm.url;
  }

  if (Array.isArray(body.partner_banner_urls) && isBusinessAccount(existing)) {
    if (!isBusinessPartnerActive(existing)) {
      res.status(403).json({
        error: "BUSINESS_NOT_ACTIVE",
        message: "Bannerët mund të shtohen vetëm pas aktivizimit.",
      });
      return;
    }
    if (existing.business_tier !== "vip") {
      res.status(403).json({ error: "VIP_REQUIRED", message: "Bannerët lëvizës janë vetëm për VIP Partner." });
      return;
    }
    patch.partner_banner_urls = serializePartnerBannerUrls(
      body.partner_banner_urls.map((u: unknown) => String(u ?? "")),
    );
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

  res.json({ user: publicUser(row!, { self: true }) });
});

// ─── POST /auth/account/business — disabled; use /partner application form
router.post("/auth/account/business", async (_req, res) => {
  res.status(410).json({
    error: "PARTNER_APPLY_ON_WEB",
    message:
      "Aplikimet për Partner/VIP Partner bëhen vetëm në faqen /partner — pa pagesë online.",
  });
});

// ─── GET /auth/account/business-quota
router.get("/auth/account/business-quota", async (req, res) => {
  const id = await sessionUserId(req);
  if (id == null) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user || !isBusinessAccount(user)) {
    res.status(400).json({ error: "Not a business account" });
    return;
  }

  const quota = await getBusinessQuotaStatus(user);
  res.json({ quota });
});

// ─── POST /auth/sms/start ───────────────────────────────────────────────────
router.post("/auth/sms/start", authLoginRegisterLimiter, async (req, res) => {
  if (!isSmsAuthEnabled()) {
    res.status(503).json({
      error: "SMS_AUTH_DISABLED",
      message: SMS_AUTH_DISABLED_MESSAGE,
    });
    return;
  }

  try {
    const phone = normalizePhone(req.body?.phone);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const isRegister = req.body?.intent === "register";

    if (!phone) {
      res.status(400).json({
        error: "Invalid phone number",
        message: "Numri i telefonit nuk është i vlefshëm.",
      });
      return;
    }

    const recaptchaToken =
      typeof req.body?.recaptcha_token === "string" ? req.body.recaptcha_token : "";

    if (isRecaptchaRequired()) {
      const captchaOk = await verifyRecaptchaToken(recaptchaToken, clientIp(req));
      if (!captchaOk) {
        res.status(400).json({
          error: "CAPTCHA_FAILED",
          message: "Plotësoni verifikimin «Nuk jam robot» para se të dërgoni SMS.",
        });
        return;
      }
    }

    try {
      await assertSmsStartAllowed(req, phone);
    } catch (err: unknown) {
      if (err instanceof Error && "publicMessage" in err) {
        const e = err as Error & { publicMessage: string };
        res.status(429).json({ error: err.message, message: e.publicMessage });
        return;
      }
      throw err;
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
    const authHint = /authenticate|bad credentials|20003/i.test(msg);
    res.status(502).json({
      error: authHint ? "SMS_PROVIDER_AUTH_FAILED" : "SMS_START_FAILED",
      message: authHint
        ? "Konfigurimi Vonage SMS nuk u pranua. Kontrollo VONAGE_API_KEY dhe VONAGE_API_SECRET në Railway Variables."
        : msg,
    });
  }
});

// ─── POST /auth/sms/verify ──────────────────────────────────────────────────
router.post("/auth/sms/verify", authLoginRegisterLimiter, async (req, res) => {
  if (!isSmsAuthEnabled()) {
    res.status(503).json({
      error: "SMS_AUTH_DISABLED",
      message: SMS_AUTH_DISABLED_MESSAGE,
    });
    return;
  }

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

    await vonageVerifyCheck(challenge.request_id, code, phone);

    try {
      await assertAccountActive(null, phone);
    } catch {
      res.status(403).json({ error: "Account suspended" });
      return;
    }

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

    if (isUserBanned(user)) {
      res.status(403).json({ error: "Account suspended" });
      return;
    }

    setUserSessionCookie(res, user.id);
    res.json({ user: publicUser(user, { self: true }) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    req.log?.error({ err }, "sms verify");
    res.status(400).json({ error: msg });
  }
});

export default router;
