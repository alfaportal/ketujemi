import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** Meta / social posting — must come from Railway when running `railway run`. */
const SOCIAL_ENV_KEYS = new Set([
  "PAGE_ACCESS_TOKEN",
  "FB_PAGE_ACCESS_TOKEN",
  "FB_PAGE_ID",
  "PAGE_ID",
  "FACEBOOK_PAGE_ID",
  "INSTAGRAM_BUSINESS_ACCOUNT_ID",
  "IG_BUSINESS_ACCOUNT_ID",
  "FACEBOOK_APP_ID",
  "FACEBOOK_APP_SECRET",
  "META_APP_ID",
  "META_APP_SECRET",
]);

export function isRailwayInjectedEnv(): boolean {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT?.trim() ||
      process.env.RAILWAY_SERVICE_ID?.trim() ||
      process.env.RAILWAY_PROJECT_ID?.trim() ||
      process.env.USE_RAILWAY_ENV?.trim(),
  );
}

function shouldSkipSocialKey(key: string): boolean {
  if (!SOCIAL_ENV_KEYS.has(key)) return false;
  if (isRailwayInjectedEnv()) return true;
  // Never let stale PAGE_ACCESS_TOKEN override Railway-injected FB_PAGE_ACCESS_TOKEN.
  if (key === "PAGE_ACCESS_TOKEN" && process.env.FB_PAGE_ACCESS_TOKEN?.trim()) {
    return true;
  }
  return false;
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (shouldSkipSocialKey(key)) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = val;
    }
  }
}

/** Load ketujemi-2/.env.staging + .env without clobbering Railway social credentials. */
export function loadCliEnvFiles(ketujemi2Root: string): void {
  loadEnvFile(path.join(ketujemi2Root, ".env.staging"));
  loadEnvFile(path.join(ketujemi2Root, ".env"));
}
