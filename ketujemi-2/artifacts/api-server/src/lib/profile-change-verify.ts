import { randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, profileChangeChallengesTable, profileChangeTokensTable, type User } from "@workspace/db";
import { resolveProfileEditSecondFactor, type AuthChannel } from "./auth-identity";
import { normalizePhone } from "./phone-prefixes";

const CHALLENGE_TTL_MS = 15 * 60 * 1000;
export const PROFILE_EDIT_SESSION_TTL_MS = 10 * 60 * 1000;

export type { AuthChannel, AuthIdentity, CredentialChannel, OAuthProviderId } from "./auth-identity";
export {
  OAUTH_PROVIDER_REGISTRY,
  resolveAuthChannel,
  resolveAuthIdentity,
  resolveLinkedOAuthProviders,
  resolveProfileEditSecondFactor,
  resolveMissingSecondMethod,
  userNeedsSellerBootstrap,
  hasTrustedEmail,
  hasVerifiedPhone,
  isPhoneLoginAnchor,
  isOAuthAuthChannel,
} from "./auth-identity";

export function profilePatchNeedsVerification(
  user: User,
): { required: boolean; channel: "sms" | "email" | null } {
  const channel = resolveProfileEditSecondFactor(user);
  if (!channel) {
    return { required: true, channel: null };
  }
  return { required: true, channel };
}

export function userSmsPhoneForProfile(user: User, bodyPhone?: unknown): string | null {
  const fromBody = normalizePhone(bodyPhone);
  if (fromBody) return fromBody;
  return user.phone_e164_digits ?? user.contact_phone?.replace(/\D/g, "") ?? null;
}

export async function clearExpiredProfileChangeRows(): Promise<void> {
  const now = new Date();
  await db.delete(profileChangeChallengesTable).where(lt(profileChangeChallengesTable.expires_at, now));
  await db.delete(profileChangeTokensTable).where(lt(profileChangeTokensTable.expires_at, now));
}

export async function storeSmsProfileChallenge(
  userId: number,
  phone: string,
  requestId: string,
): Promise<void> {
  await clearExpiredProfileChangeRows();
  await db.delete(profileChangeChallengesTable).where(eq(profileChangeChallengesTable.user_id, userId));
  await db.insert(profileChangeChallengesTable).values({
    user_id: userId,
    channel: "sms",
    phone_e164_digits: phone,
    request_id: requestId,
    expires_at: new Date(Date.now() + CHALLENGE_TTL_MS),
  });
}

export async function storeEmailProfileChallenge(
  userId: number,
  email: string,
  code: string,
): Promise<void> {
  await clearExpiredProfileChangeRows();
  await db.delete(profileChangeChallengesTable).where(eq(profileChangeChallengesTable.user_id, userId));
  await db.insert(profileChangeChallengesTable).values({
    user_id: userId,
    channel: "email",
    email,
    code,
    expires_at: new Date(Date.now() + CHALLENGE_TTL_MS),
  });
}

export async function getActiveProfileChallenge(userId: number, channel: "sms" | "email") {
  const [row] = await db
    .select()
    .from(profileChangeChallengesTable)
    .where(
      and(
        eq(profileChangeChallengesTable.user_id, userId),
        eq(profileChangeChallengesTable.channel, channel),
        gt(profileChangeChallengesTable.expires_at, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function issueProfileChangeToken(
  userId: number,
  channel: "sms" | "email",
): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await db.delete(profileChangeTokensTable).where(eq(profileChangeTokensTable.user_id, userId));
  await db.insert(profileChangeTokensTable).values({
    user_id: userId,
    token,
    channel,
    expires_at: new Date(Date.now() + PROFILE_EDIT_SESSION_TTL_MS),
  });
  return token;
}

export async function getActiveProfileEditSession(userId: number): Promise<{
  token: string;
  channel: "sms" | "email";
  expires_at: Date;
} | null> {
  await clearExpiredProfileChangeRows();
  const [row] = await db
    .select()
    .from(profileChangeTokensTable)
    .where(
      and(
        eq(profileChangeTokensTable.user_id, userId),
        gt(profileChangeTokensTable.expires_at, new Date()),
      ),
    )
    .limit(1);
  if (!row) return null;
  return {
    token: row.token,
    channel: row.channel as "sms" | "email",
    expires_at: row.expires_at,
  };
}

/** Validates token without consuming it — session stays active until expiry (10 min). */
export async function validateProfileChangeToken(
  userId: number,
  token: string,
  expectedChannel: "sms" | "email",
): Promise<boolean> {
  await clearExpiredProfileChangeRows();
  const [row] = await db
    .select()
    .from(profileChangeTokensTable)
    .where(
      and(
        eq(profileChangeTokensTable.user_id, userId),
        eq(profileChangeTokensTable.token, token),
        eq(profileChangeTokensTable.channel, expectedChannel),
        gt(profileChangeTokensTable.expires_at, new Date()),
      ),
    )
    .limit(1);
  return Boolean(row);
}
