/** Meta (Facebook / Instagram) OAuth — env & redirect helpers. */

import { resolveAppOrigin } from "./canonical-host.js";

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

/**
 * Instagram Login credentials — MUST be the Instagram App ID/Secret from
 * Meta Dashboard → Instagram → API setup with Instagram login → Business login settings.
 * Do NOT reuse FACEBOOK_APP_ID (causes "Invalid platform app").
 */
export function instagramAppId(): string | null {
  return cleanMetaEnv("INSTAGRAM_APP_ID");
}

export function instagramAppSecret(): string | null {
  return cleanMetaEnv("INSTAGRAM_APP_SECRET");
}

/** True when Instagram OAuth env uses the Facebook App ID by mistake. */
export function isInstagramOAuthMisconfigured(): boolean {
  const igId = instagramAppId();
  const fbId = facebookAppId();
  return Boolean(igId && fbId && igId === fbId);
}

export function isFacebookOAuthEnabled(): boolean {
  const flag = cleanMetaEnv("FACEBOOK_OAUTH_ENABLED")?.toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(facebookAppId() && facebookAppSecret());
}

export function isInstagramOAuthEnabled(): boolean {
  const flag = cleanMetaEnv("INSTAGRAM_OAUTH_ENABLED")?.toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  if (!instagramAppId() || !instagramAppSecret()) return false;
  if (isInstagramOAuthMisconfigured()) return false;
  return true;
}

export function instagramOAuthCallbackUrlForOrigin(origin: string): string {
  return oauthCallbackUrl(origin, "instagram");
}

/**
 * Public Facebook Page URL (footer) — not OAuth.
 * Emri i faqes në Meta (p.sh. "KetuJemi.com") ≠ URL publike; vendos linkun e saktë në env.
 */
export function facebookPageUrl(): string | null {
  const direct =
    cleanMetaEnv("FACEBOOK_PAGE_URL") ?? cleanMetaEnv("VITE_FACEBOOK_PAGE_URL");
  if (direct) return direct;

  const pageId = cleanMetaEnv("FACEBOOK_PAGE_ID");
  if (pageId) return `https://www.facebook.com/profile.php?id=${encodeURIComponent(pageId)}`;

  return null;
}

export function instagramProfileUrl(): string {
  return (
    cleanMetaEnv("INSTAGRAM_PROFILE_URL") ??
    cleanMetaEnv("VITE_INSTAGRAM_PROFILE_URL") ??
    "https://www.instagram.com/jemi.ketu"
  );
}

export function oauthCallbackUrl(
  origin: string,
  provider: MetaOAuthProvider,
): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/auth/oauth/${provider}/callback`;
}

/** Matches Meta app redirect URI — Facebook login button. */
export function facebookPublicOAuthCallbackUrl(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/auth/facebook/callback`;
}

export function appOriginFromRequest(req: {
  get: (name: string) => string | undefined;
}): string {
  return resolveAppOrigin(req);
}
