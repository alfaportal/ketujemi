import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Owner-only panel password (set ADMIN_PANEL_PASSWORD in env). */
export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PANEL_PASSWORD;
  if (!expected || typeof password !== "string" || !password) return false;
  return safeEqual(password, expected);
}

export function getAdminBearerToken(): string | null {
  const token = process.env.ADMIN_PANEL_TOKEN;
  return token && token.length >= 16 ? token : null;
}

export function verifyAdminBearer(authHeader: string | undefined): boolean {
  const token = getAdminBearerToken();
  if (!token) return false;
  if (!authHeader?.startsWith("Bearer ")) return false;
  return safeEqual(authHeader.slice(7), token);
}

export function adminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PANEL_PASSWORD && getAdminBearerToken());
}
