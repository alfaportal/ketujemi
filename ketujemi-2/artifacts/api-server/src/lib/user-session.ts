import type { CookieOptions, Response } from "express";
import type { User } from "@workspace/db";
import { sellerFirstName } from "./contact-mask";
import { resolveAuthIdentity } from "./auth-identity";
import { walletSummary } from "./wallet";

const COOKIE = "kj_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function sessionCookieBase(): CookieOptions {
  const opts: CookieOptions = {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
  const domain =
    process.env.COOKIE_DOMAIN?.trim() ??
    (process.env.NODE_ENV === "production" ? ".ketujemi.com" : undefined);
  if (domain) opts.domain = domain;
  return opts;
}

export function setUserSessionCookie(res: Response, userId: number): void {
  res.cookie(COOKIE, String(userId), {
    ...sessionCookieBase(),
    maxAge: MAX_AGE_MS,
  });
}

export function clearUserSessionCookie(res: Response): void {
  res.clearCookie(COOKIE, sessionCookieBase());
}

export function publicUser(u: User, opts?: { self?: boolean }) {
  const rawName = u.display_name?.trim() ?? "";
  const display_name = rawName
    ? opts?.self
      ? rawName
      : sellerFirstName(rawName)
    : null;
  const base = {
    id: u.id,
    email: u.email,
    phone_e164_digits: u.phone_e164_digits,
    display_name,
    contact_phone: u.contact_phone ?? null,
    profile_photo_url: u.profile_photo_url ?? null,
    city: u.city ?? null,
    about_me: u.about_me ?? null,
  };

  if (!opts?.self) return base;

  return {
    ...base,
    account_type: u.account_type ?? "private",
    business_name: u.business_name ?? null,
    partner_logo_url: u.partner_logo_url ?? null,
    business_tier: u.business_tier ?? null,
    business_status: u.business_status ?? null,
    partner_link_url: u.partner_link_url ?? null,
    partner_link_type: u.partner_link_type ?? null,
    partner_banner_urls: u.partner_banner_urls ?? null,
    partner_activation_code: u.partner_activation_code ?? null,
    vip_expires_at: u.vip_expires_at ? u.vip_expires_at.toISOString() : null,
    email_verified: u.email_verified_at != null,
    has_password: Boolean(u.password_hash),
    strike_count: u.strike_count ?? 0,
    wallet: walletSummary(u.wallet_balance_cents ?? 0),
    first_listing_posted: u.first_listing_posted ?? false,
    social_follow_notif_sent: u.social_follow_notif_sent ?? false,
    social_follow_notif_preference: u.social_follow_notif_preference ?? "pending",
    created_at: u.created_at.toISOString(),
    ...(() => {
      const identity = resolveAuthIdentity(u);
      return {
        auth_channel: identity.auth_channel,
        credential_channel: identity.credential_channel,
        oauth_providers: identity.oauth_providers,
        has_trusted_email: identity.has_trusted_email,
        profile_edit_requires_sms: identity.profile_edit_requires_sms,
        phone_change_requires_email: identity.phone_change_requires_email,
        can_add_phone: identity.can_add_phone,
        can_add_email: identity.can_add_email,
        phone_verified: identity.has_verified_phone,
      };
    })(),
  };
}

/** True when account was created within the last few seconds (OAuth / redirect flows). */
export function isNewlyRegisteredUser(u: User): boolean {
  const ageMs = Date.now() - new Date(u.created_at).getTime();
  return ageMs >= 0 && ageMs < 8000;
}
