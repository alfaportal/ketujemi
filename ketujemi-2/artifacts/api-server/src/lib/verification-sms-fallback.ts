import { randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  db,
  emailVerifyChallengesTable,
  phoneVerifyChallengesTable,
  profileChangeChallengesTable,
  type User,
} from "@workspace/db";
import { hasTrustedEmail } from "./auth-identity";
import { sendProfileChangeCodeEmail } from "./send-email";
import { sendLoginSmsFallbackCodeEmail } from "./send-email";
import { maskEmailForDisplay } from "./platform-admin";
import { storeEmailProfileChallenge } from "./profile-change-verify";

export const SMS_VERIFY_FAIL_THRESHOLD = 2;

export const SMS_FALLBACK_MESSAGE_SQ =
  "SMS nuk funksionoi — ta dërgojmë kodin në email?";

function sixDigitCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export async function incrementProfileSmsFailCount(userId: number): Promise<number> {
  const { getActiveProfileChallenge } = await import("./profile-change-verify.js");
  const challenge = await getActiveProfileChallenge(userId, "sms");
  if (!challenge) return 0;
  const next = (challenge.fail_count ?? 0) + 1;
  await db
    .update(profileChangeChallengesTable)
    .set({ fail_count: next })
    .where(eq(profileChangeChallengesTable.id, challenge.id));
  return next;
}

export async function incrementPhoneLoginSmsFailCount(challengeId: number): Promise<number> {
  const [row] = await db
    .select()
    .from(phoneVerifyChallengesTable)
    .where(eq(phoneVerifyChallengesTable.id, challengeId))
    .limit(1);
  if (!row) return 0;
  const next = (row.fail_count ?? 0) + 1;
  await db
    .update(phoneVerifyChallengesTable)
    .set({ fail_count: next })
    .where(eq(phoneVerifyChallengesTable.id, challengeId));
  return next;
}

/** Profile edit: after repeated SMS failures, send email code instead. */
export async function triggerProfileSmsEmailFallback(
  user: User,
): Promise<{ ok: true; masked_email: string } | { ok: false; reason: string }> {
  const email = user.email?.trim();
  if (!email || !hasTrustedEmail(user)) {
    return { ok: false, reason: "no_verified_email" };
  }

  const code = sixDigitCode();
  await storeEmailProfileChallenge(user.id, email, code);
  await sendProfileChangeCodeEmail({ to: email, code });

  await db
    .delete(profileChangeChallengesTable)
    .where(eq(profileChangeChallengesTable.user_id, user.id));

  return { ok: true, masked_email: maskEmailForDisplay(email) };
}

const SMS_LOGIN_FALLBACK_MARKER = "__sms_fallback_login__:";

/** Phone login: after repeated SMS failures, send email code to linked account. */
export async function triggerPhoneLoginSmsEmailFallback(
  phone: string,
  user: User,
): Promise<{ ok: true; masked_email: string } | { ok: false; reason: string }> {
  const email = user.email?.trim();
  if (!email || !hasTrustedEmail(user)) {
    return { ok: false, reason: "no_verified_email" };
  }

  const code = sixDigitCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.delete(emailVerifyChallengesTable).where(eq(emailVerifyChallengesTable.email, email));

  const { randomUUID } = await import("node:crypto");
  await db.insert(emailVerifyChallengesTable).values({
    email,
    code,
    token: randomUUID(),
    password_hash: `${SMS_LOGIN_FALLBACK_MARKER}${phone}`,
    expires_at: expiresAt,
  });

  await sendLoginSmsFallbackCodeEmail({ to: email, code });

  return { ok: true, masked_email: maskEmailForDisplay(email) };
}

export function isSmsLoginFallbackPasswordHash(hash: string): boolean {
  return hash.startsWith(SMS_LOGIN_FALLBACK_MARKER);
}

export function phoneFromSmsLoginFallbackHash(hash: string): string | null {
  if (!isSmsLoginFallbackPasswordHash(hash)) return null;
  const phone = hash.slice(SMS_LOGIN_FALLBACK_MARKER.length).trim();
  return phone.length >= 8 ? phone : null;
}
