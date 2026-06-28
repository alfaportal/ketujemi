import type { User } from "@workspace/db";
import { isPlatformAdminUser } from "./platform-admin.js";

/**
 * OAuth login provider registry — add providers here (column must exist on `users`).
 * Instagram Login is not supported; `instagram_user_id` may remain for legacy data only.
 */
export const OAUTH_PROVIDER_REGISTRY = {
  facebook: { userIdColumn: "facebook_user_id" as const },
  google: { userIdColumn: "google_user_id" as const },
  tiktok: { userIdColumn: "tiktok_user_id" as const },
} satisfies Record<string, { userIdColumn: keyof User }>;

export type OAuthProviderId = keyof typeof OAUTH_PROVIDER_REGISTRY;

export type CredentialChannel = "email" | "phone" | "both" | "none";

/** Primary login channel: credential-based or `oauth:<provider>`. */
export type AuthChannel = CredentialChannel | `oauth:${OAuthProviderId}`;

export type ProfileEditSecondFactor = "sms" | "email";

export type AuthIdentity = {
  auth_channel: AuthChannel;
  credential_channel: CredentialChannel;
  oauth_providers: OAuthProviderId[];
  has_trusted_email: boolean;
  has_verified_phone: boolean;
  identity_verified: boolean;
  identity_verified_via: string | null;
  /** Second-factor channel before profile edit; null = user must add a second method first. */
  profile_edit_second_factor: ProfileEditSecondFactor | null;
  profile_edit_needs_second_method: boolean;
  missing_second_method: "email" | "phone" | null;
  can_add_phone: boolean;
  can_add_email: boolean;
};

export function resolveLinkedOAuthProviders(u: User): OAuthProviderId[] {
  return (Object.keys(OAUTH_PROVIDER_REGISTRY) as OAuthProviderId[]).filter((provider) => {
    const col = OAUTH_PROVIDER_REGISTRY[provider].userIdColumn;
    const val = u[col];
    return typeof val === "string" && val.trim().length > 0;
  });
}

export function resolveCredentialChannel(u: User): CredentialChannel {
  const hasEmail = Boolean(u.email?.trim());
  const hasPhone = Boolean(u.phone_e164_digits?.trim());
  if (hasEmail && hasPhone) return "both";
  if (hasEmail) return "email";
  if (hasPhone) return "phone";
  return "none";
}

function usesCredentialLogin(u: User): boolean {
  return Boolean(u.password_hash || u.phone_e164_digits?.trim());
}

/** Extensible primary `auth_channel` exposed to clients. */
export function resolveAuthChannel(u: User): AuthChannel {
  const oauth = resolveLinkedOAuthProviders(u);
  const credential = resolveCredentialChannel(u);

  if (usesCredentialLogin(u) && credential !== "none") {
    return credential;
  }

  if (oauth.length > 0) {
    return `oauth:${oauth[0]}`;
  }

  return credential;
}

export function hasTrustedEmail(u: User): boolean {
  return Boolean(u.email?.trim() && u.email_verified_at);
}

export function hasVerifiedPhone(u: User): boolean {
  return Boolean(u.phone_e164_digits?.trim());
}

/** Phone is the primary login anchor (SMS signup) without a trusted email. */
export function isPhoneLoginAnchor(u: User): boolean {
  return Boolean(u.phone_e164_digits?.trim() && !hasTrustedEmail(u));
}

/**
 * Second factor for profile / shop edits — email code only (no SMS).
 * Any account with an email on file can receive a verification code.
 */
export function resolveProfileEditSecondFactor(u: User): ProfileEditSecondFactor | null {
  if (u.email?.trim()) return "email";
  return null;
}

/** What the user must add before profile edit is possible. */
export function resolveMissingSecondMethod(u: User): "email" | "phone" | null {
  if (resolveProfileEditSecondFactor(u) !== null) return null;
  return "email";
}

export function userNeedsSellerBootstrap(u: User): boolean {
  const name = u.display_name?.trim() ?? "";
  const phoneDigits = (u.contact_phone ?? u.phone_e164_digits ?? "").replace(/\D/g, "");
  return name.length < 2 || phoneDigits.length < 8;
}

export function resolveAuthIdentity(u: User): AuthIdentity {
  const oauth_providers = resolveLinkedOAuthProviders(u);
  const credential_channel = resolveCredentialChannel(u);
  const auth_channel = resolveAuthChannel(u);
  const has_trusted_email = hasTrustedEmail(u);
  const has_verified_phone = hasVerifiedPhone(u);
  const profile_edit_second_factor = resolveProfileEditSecondFactor(u);
  const missing_second_method = resolveMissingSecondMethod(u);

  return {
    auth_channel,
    credential_channel,
    oauth_providers,
    has_trusted_email,
    has_verified_phone,
    identity_verified: Boolean(u.identity_verified),
    identity_verified_via: u.identity_verified_via?.trim() || null,
    profile_edit_second_factor,
    profile_edit_needs_second_method: profile_edit_second_factor === null,
    missing_second_method,
    can_add_phone: isPlatformAdminUser(u) ? false : !has_verified_phone,
    can_add_email: !has_trusted_email,
  };
}

export function isOAuthAuthChannel(channel: AuthChannel): channel is `oauth:${OAuthProviderId}` {
  return channel.startsWith("oauth:");
}
