import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { MetaOAuthProvider } from "./meta-oauth-config";

export type OAuthStatePayload = {
  provider: MetaOAuthProvider;
  returnTo: string;
  nonce: string;
};

function oauthStateSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET required for OAuth state");
  }
  return secret;
}

export function createOAuthState(payload: Omit<OAuthStatePayload, "nonce">): string {
  const full: OAuthStatePayload = {
    ...payload,
    nonce: randomBytes(16).toString("hex"),
  };
  const data = Buffer.from(JSON.stringify(full), "utf8").toString("base64url");
  const sig = createHmac("sha256", oauthStateSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyOAuthState(state: string): OAuthStatePayload | null {
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const data = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = createHmac("sha256", oauthStateSecret()).update(data).digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as OAuthStatePayload;
    if (payload.provider !== "facebook" && payload.provider !== "instagram") return null;
    if (typeof payload.returnTo !== "string" || typeof payload.nonce !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

/** Only allow same-site relative return paths. */
export function sanitizeOAuthReturnTo(raw: string | undefined | null): string {
  const fallback = "/";
  if (!raw?.trim()) return fallback;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("://")) return fallback;
  return path;
}
