/** Meta (Facebook / Instagram) OAuth — env & redirect helpers. */

export type MetaOAuthProvider = "facebook" | "instagram";

const GRAPH_VERSION = "v21.0";

export function metaGraphVersion(): string {
  return GRAPH_VERSION;
}

export function cleanMetaEnv(name: string): string | null {
  const raw = process.env[name];
  if (raw == null) return null;
  let v = raw.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v || null;
}

export function facebookAppId(): string | null {
  return cleanMetaEnv("FACEBOOK_APP_ID") ?? cleanMetaEnv("META_APP_ID");
}

export function facebookAppSecret(): string | null {
  return cleanMetaEnv("FACEBOOK_APP_SECRET") ?? cleanMetaEnv("META_APP_SECRET");
}

/** Instagram Login uses the same Meta app by default. */
export function instagramAppId(): string | null {
  return cleanMetaEnv("INSTAGRAM_APP_ID") ?? facebookAppId();
}

export function instagramAppSecret(): string | null {
  return cleanMetaEnv("INSTAGRAM_APP_SECRET") ?? facebookAppSecret();
}

export function isFacebookOAuthEnabled(): boolean {
  const flag = cleanMetaEnv("FACEBOOK_OAUTH_ENABLED")?.toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(facebookAppId() && facebookAppSecret());
}

export function isInstagramOAuthEnabled(): boolean {
  const flag = cleanMetaEnv("INSTAGRAM_OAUTH_ENABLED")?.toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(instagramAppId() && instagramAppSecret());
}

export function oauthCallbackUrl(
  origin: string,
  provider: MetaOAuthProvider,
): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/auth/oauth/${provider}/callback`;
}

export function appOriginFromRequest(req: {
  get: (name: string) => string | undefined;
}): string {
  const fromEnv = cleanMetaEnv("PUBLIC_APP_ORIGIN");
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const proto = req.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:5173";
}
