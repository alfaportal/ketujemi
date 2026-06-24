import { randomInt, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, emailVerifyChallengesTable } from "@workspace/db";
import { hasEmailDeliveryConfigured } from "./email-auth";
import { sendPasswordResetEmail } from "./send-email";

/** Pas kaq përpjekjeve të gabuara të fjalëkalimit → kod rivendosjeje në email. */
export const EMAIL_PASSWORD_FAIL_THRESHOLD = 2;

const FAIL_WINDOW_MS = 15 * 60 * 1000;
const CHALLENGE_TTL_MS = 15 * 60 * 1000;

const failCounts = new Map<string, { count: number; expiresAt: number }>();

function sixDigitCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export function incrementEmailPasswordFailCount(email: string): number {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  const row = failCounts.get(key);
  if (!row || row.expiresAt < now) {
    failCounts.set(key, { count: 1, expiresAt: now + FAIL_WINDOW_MS });
    return 1;
  }
  row.count += 1;
  return row.count;
}

export function clearEmailPasswordFailCount(email: string): void {
  failCounts.delete(email.trim().toLowerCase());
}

/** Dërgon kod rivendosjeje (jo verifikim regjistrimi). */
export async function sendPasswordResetChallengeForEmail(email: string): Promise<void> {
  if (!hasEmailDeliveryConfigured()) return;

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
}

export async function handleExistingUserWrongPassword(
  email: string,
  hasPassword: boolean,
): Promise<{
  error: "INVALID_CREDENTIALS";
  message: string;
  fail_count: number;
  password_reset_sent?: boolean;
}> {
  const failCount = incrementEmailPasswordFailCount(email);

  if (
    failCount >= EMAIL_PASSWORD_FAIL_THRESHOLD &&
    hasPassword &&
    hasEmailDeliveryConfigured()
  ) {
    await sendPasswordResetChallengeForEmail(email);
    return {
      error: "INVALID_CREDENTIALS",
      password_reset_sent: true,
      fail_count: failCount,
      message:
        "Fjalëkalim i gabuar. Ta dërguam një kod për rivendosje fjalëkalimi në email — vendoseni më poshtë.",
    };
  }

  const remaining = EMAIL_PASSWORD_FAIL_THRESHOLD - failCount;
  const message =
    remaining > 0
      ? `Fjalëkalim i gabuar. Pas ${remaining} përpjekje${remaining === 1 ? "je" : "sh"} të tjera do ta dërgojmë kodin e rivendosjes në email.`
      : "Fjalëkalim i gabuar.";

  return {
    error: "INVALID_CREDENTIALS",
    fail_count: failCount,
    message,
  };
}
