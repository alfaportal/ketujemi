import type { Response } from "express";
import type { User } from "@workspace/db";
import { sellerFirstName } from "./contact-mask";

const COOKIE = "kj_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function setUserSessionCookie(res: Response, userId: number): void {
  res.cookie(COOKIE, String(userId), {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_MS,
  });
}

export function clearUserSessionCookie(res: Response): void {
  res.clearCookie(COOKIE, { path: "/", signed: true });
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
    vip_expires_at: u.vip_expires_at ? u.vip_expires_at.toISOString() : null,
    email_verified: u.email_verified_at != null,
    strike_count: u.strike_count ?? 0,
  };
}
