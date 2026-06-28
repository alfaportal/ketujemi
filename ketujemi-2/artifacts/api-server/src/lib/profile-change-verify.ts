import { randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, profileChangeChallengesTable, profileChangeTokensTable, type User } from "@workspace/db";
import { resolveMissingSecondMethod, resolveProfileEditSecondFactor, type AuthChannel } from "./auth-identity";
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

export type ProfileChangeEnforceResult =
  | { ok: true }
  | { ok: false; status: number; body: Record<string, unknown> };

/** Shared gate for profile and shop mutations — requires active second-factor session. */
export async function enforceProfileChangeToken(
  user: User,
  body: Record<string, unknown>,
): Promise<ProfileChangeEnforceResult> {
  const verifyNeed = profilePatchNeedsVerification(user);
  if (verifyNeed.required && !verifyNeed.channel) {
    const missing = resolveMissingSecondMethod(user);
    return {
      ok: false,
      status: 403,
      body: {
        error: "SECOND_METHOD_REQUIRED",
        missing_method: missing,
        message:
          missing === "email"
            ? "Shtoni dhe verifikoni një email para se të vazhdoni."
            : "Shtoni një email në llogari para se të vazhdoni.",
      },
    };
  }
  if (verifyNeed.required && verifyNeed.channel) {
    const token =
      typeof body.profile_change_token === "string" ? body.profile_change_token.trim() : "";
    if (!token) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "VERIFICATION_REQUIRED",
          channel: verifyNeed.channel,
          message: "Konfirmoni me email para se të vazhdoni.",
        },
      };
    }
    const valid = await validateProfileChangeToken(user.id, token, verifyNeed.channel);
    if (!valid) {
      return {
        ok: false,
        status: 403,
        body: {
          error: "VERIFICATION_INVALID",
          message: "Verifikimi ka skaduar. Provoni përsëri.",
        },
      };
    }
  }
  return { ok: true };
}
