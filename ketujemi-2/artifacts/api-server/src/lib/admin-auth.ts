import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_PREFIX = "adm.";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function signingSecret(): string | null {
  const token = process.env.ADMIN_PANEL_TOKEN?.trim();
  return token && token.length >= 16 ? token : null;
}

/** Owner-only panel password (set ADMIN_PANEL_PASSWORD in env). */
export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PANEL_PASSWORD;
  if (!expected || typeof password !== "string" || !password) return false;
  return safeEqual(password, expected);
}

/** @deprecated Static env token — only for server scripts; login issues signed sessions. */
export function getAdminBearerToken(): string | null {
  return signingSecret();
}

export type AdminSessionInfo = {
  token: string;
  expires_at: string;
  remember_me: boolean;
};

/** Issue a signed, time-limited session token (not the raw env secret). */
export function createAdminSession(rememberMe = false): AdminSessionInfo | null {
  const secret = signingSecret();
  if (!secret) return null;

  const ttl = rememberMe ? REMEMBER_TTL_MS : SESSION_TTL_MS;
  const expiresAt = new Date(Date.now() + ttl);
  const exp = String(expiresAt.getTime());
  const nonce = randomBytes(18).toString("base64url");
  const payload = `${exp}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  const token = `${SESSION_PREFIX}${payload}.${sig}`;

  return {
    token,
    expires_at: expiresAt.toISOString(),
    remember_me: rememberMe,
  };
}

function verifySignedSessionToken(token: string): boolean {
  if (!token.startsWith(SESSION_PREFIX)) return false;
  const secret = signingSecret();
  if (!secret) return false;

  const body = token.slice(SESSION_PREFIX.length);
  const sigIdx = body.lastIndexOf(".");
  if (sigIdx <= 0) return false;

  const payload = body.slice(0, sigIdx);
  const sig = body.slice(sigIdx + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (!safeEqual(sig, expected)) return false;

  const expStr = payload.split(".")[0];
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  return true;
}

export function verifyAdminBearer(authHeader: string | undefined): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7).trim();
  if (!token) return false;

  if (verifySignedSessionToken(token)) return true;

  const legacy = signingSecret();
  if (legacy && safeEqual(token, legacy)) return true;

  return false;
}

export function adminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PANEL_PASSWORD?.trim() && signingSecret());
}
