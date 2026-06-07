import { randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, profileChangeChallengesTable, profileChangeTokensTable, type User } from "@workspace/db";
import {
  hasTrustedEmail,
  isPhoneLoginAnchor,
  resolveAuthChannel,
  resolveAuthIdentity,
  type AuthChannel,
} from "./auth-identity";
import { normalizePhone } from "./phone-prefixes";

const CHALLENGE_TTL_MS = 15 * 60 * 1000;
const TOKEN_TTL_MS = 10 * 60 * 1000;

export type { AuthChannel, AuthIdentity, CredentialChannel, OAuthProviderId } from "./auth-identity";
export {
  OAUTH_PROVIDER_REGISTRY,
  resolveAuthChannel,
  resolveAuthIdentity,
  resolveLinkedOAuthProviders,
  hasTrustedEmail,
  hasVerifiedPhone,
  isPhoneLoginAnchor,
  isOAuthAuthChannel,
} from "./auth-identity";

function digitsOnly(s: string | null | undefined): string {
  return (s ?? "").replace(/\D/g, "");
}

export function profilePatchNeedsVerification(
  user: User,
  patch: { contact_phone?: string | null },
): { required: boolean; channel: "sms" | "email" | null } {
  const identity = resolveAuthIdentity(user);

  if (identity.profile_edit_requires_sms) {
    return { required: true, channel: "sms" };
  }

  if (patch.contact_phone !== undefined) {
    const newDigits = digitsOnly(patch.contact_phone);
    const oldDigits = digitsOnly(user.contact_phone ?? user.phone_e164_digits);
    if (newDigits.length >= 8 && newDigits !== oldDigits && identity.phone_change_requires_email) {
      return { required: true, channel: "email" };
    }
  }

  return { required: false, channel: null };
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
    expires_at: new Date(Date.now() + TOKEN_TTL_MS),
  });
  return token;
}

export async function consumeProfileChangeToken(
  userId: number,
  token: string,
  expectedChannel: "sms" | "email",
): Promise<boolean> {
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

  if (!row) return false;
  await db.delete(profileChangeTokensTable).where(eq(profileChangeTokensTable.id, row.id));
  return true;
}
