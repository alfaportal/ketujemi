import type { Response } from "express";
import type { User } from "@workspace/db";

const COOKIE = "kj_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function setUserSessionCookie(res: Response, userId: number): void {
  res.cookie(COOKIE, String(userId), {
    signed: true,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_MS,
  });
}

export function clearUserSessionCookie(res: Response): void {
  res.clearCookie(COOKIE, { path: "/", signed: true });
}

export function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    phone_e164_digits: u.phone_e164_digits,
    display_name: u.display_name ?? null,
    contact_phone: u.contact_phone ?? null,
    profile_photo_url: u.profile_photo_url ?? null,
    city: u.city ?? null,
    about_me: u.about_me ?? null,
  };
}
