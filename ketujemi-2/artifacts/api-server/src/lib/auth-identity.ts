import type { User } from "@workspace/db";

/**
 * OAuth provider registry — add a new provider here only (column must exist on `users`).
 * No other auth/profile code should hardcode provider ids.
 */
export const OAUTH_PROVIDER_REGISTRY = {
  facebook: { userIdColumn: "facebook_user_id" as const },
  google: { userIdColumn: "google_user_id" as const },
  tiktok: { userIdColumn: "tiktok_user_id" as const },
  instagram: { userIdColumn: "instagram_user_id" as const },
} satisfies Record<string, { userIdColumn: keyof User }>;

export type OAuthProviderId = keyof typeof OAUTH_PROVIDER_REGISTRY;

export type CredentialChannel = "email" | "phone" | "both" | "none";

/** Primary login channel: credential-based or `oauth:<provider>`. */
export type AuthChannel = CredentialChannel | `oauth:${OAuthProviderId}`;

export type AuthIdentity = {
  auth_channel: AuthChannel;
  credential_channel: CredentialChannel;
  oauth_providers: OAuthProviderId[];
  has_trusted_email: boolean;
  has_verified_phone: boolean;
  /** Any profile field edit needs SMS verification first. */
  profile_edit_requires_sms: boolean;
  /** Changing contact phone needs email verification (phone-login accounts). */
  phone_change_requires_email: boolean;
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

export function resolveAuthIdentity(u: User): AuthIdentity {
  const oauth_providers = resolveLinkedOAuthProviders(u);
  const credential_channel = resolveCredentialChannel(u);
  const auth_channel = resolveAuthChannel(u);
  const has_trusted_email = hasTrustedEmail(u);
  const has_verified_phone = hasVerifiedPhone(u);

  const profile_edit_requires_sms =
    has_trusted_email ||
    (Boolean(u.email?.trim()) && !has_verified_phone) ||
    (oauth_providers.length > 0 && !has_verified_phone);

  const phone_change_requires_email = isPhoneLoginAnchor(u);

  return {
    auth_channel,
    credential_channel,
    oauth_providers,
    has_trusted_email,
    has_verified_phone,
    profile_edit_requires_sms,
    phone_change_requires_email,
    can_add_phone: !has_verified_phone,
    can_add_email: !has_trusted_email,
  };
}

export function isOAuthAuthChannel(channel: AuthChannel): channel is `oauth:${OAuthProviderId}` {
  return channel.startsWith("oauth:");
}
