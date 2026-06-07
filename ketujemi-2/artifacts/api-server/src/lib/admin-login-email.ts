import { randomInt } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, adminLoginChallengesTable } from "@workspace/db";
import { getAdminEmail } from "./admin-monitor-email.js";
import { hasEmailDeliveryConfigured } from "./email-auth";
import { sendAdminLoginCodeEmail } from "./send-email";

const CHALLENGE_TTL_MS = 15 * 60 * 1000;

function sixDigitCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export async function startAdminEmailLoginChallenge(): Promise<{ ok: true } | { ok: false; reason: string }> {
  const email = getAdminEmail();
  if (!email) return { ok: false, reason: "EMAIL_ADMIN_NOT_CONFIGURED" };
  if (!hasEmailDeliveryConfigured()) return { ok: false, reason: "EMAIL_NOT_CONFIGURED" };

  const code = sixDigitCode();
  const now = new Date();
  await db.delete(adminLoginChallengesTable).where(lt(adminLoginChallengesTable.expires_at, now));
  await db.delete(adminLoginChallengesTable).where(eq(adminLoginChallengesTable.email, email));

  await db.insert(adminLoginChallengesTable).values({
    email,
    code,
    expires_at: new Date(Date.now() + CHALLENGE_TTL_MS),
  });

  await sendAdminLoginCodeEmail({ to: email, code });
  return { ok: true };
}

export async function verifyAdminEmailLoginCode(code: string): Promise<boolean> {
  const email = getAdminEmail();
  if (!email) return false;
  const trimmed = code.trim();
  if (trimmed.length < 4) return false;

  const [row] = await db
    .select()
    .from(adminLoginChallengesTable)
    .where(
      and(
        eq(adminLoginChallengesTable.email, email),
        eq(adminLoginChallengesTable.code, trimmed),
        gt(adminLoginChallengesTable.expires_at, new Date()),
      ),
    )
    .limit(1);

  if (!row) return false;
  await db.delete(adminLoginChallengesTable).where(eq(adminLoginChallengesTable.id, row.id));
  return true;
}
