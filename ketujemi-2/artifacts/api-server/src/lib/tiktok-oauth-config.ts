import { resolveAppOrigin } from "./canonical-host.js";

export function cleanTikTokEnv(name: string): string | null {
  const raw = process.env[name];
  if (raw == null) return null;
  let v = raw.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v || null;
}

export function tiktokClientKey(): string | null {
  return cleanTikTokEnv("TIKTOK_CLIENT_KEY");
}

export function tiktokClientSecret(): string | null {
  return cleanTikTokEnv("TIKTOK_CLIENT_SECRET");
}

export function isTikTokOAuthEnabled(): boolean {
  const flag = cleanTikTokEnv("TIKTOK_OAUTH_ENABLED")?.toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(tiktokClientKey() && tiktokClientSecret());
}

/** Matches TikTok Developer Portal redirect URI (no /api prefix). */
export function tiktokOAuthCallbackUrl(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/auth/tiktok/callback`;
}

export function appOriginFromRequest(req: {
  get: (name: string) => string | undefined;
}): string {
  return resolveAppOrigin(req);
}
