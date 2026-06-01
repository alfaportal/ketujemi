import { resolveAppOrigin } from "./canonical-host.js";

export function cleanGoogleEnv(name: string): string | null {
  const raw = process.env[name];
  if (raw == null) return null;
  let v = raw.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v || null;
}

export function googleClientId(): string | null {
  return cleanGoogleEnv("GOOGLE_CLIENT_ID");
}

export function googleClientSecret(): string | null {
  return cleanGoogleEnv("GOOGLE_CLIENT_SECRET");
}

export function isGoogleOAuthEnabled(): boolean {
  const flag = cleanGoogleEnv("GOOGLE_OAUTH_ENABLED")?.toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return Boolean(googleClientId() && googleClientSecret());
}

/** Matches Google Cloud Console redirect URI (no /api prefix). */
export function googleOAuthCallbackUrl(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/auth/google/callback`;
}

export function appOriginFromRequest(req: {
  get: (name: string) => string | undefined;
}): string {
  return resolveAppOrigin(req);
}
