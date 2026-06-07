/**
 * Verify Facebook OAuth env + print Meta Developer Portal checklist.
 *
 * Usage (from ketujemi-2/):
 *   pnpm run check:facebook-oauth
 *
 * Reads FACEBOOK_APP_ID / FACEBOOK_APP_SECRET from .env or environment.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");

function parseEnvFile(filePath) {
  const out = {};
  if (!existsSync(filePath)) return out;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const fileEnv = parseEnvFile(envPath);
const appId = process.env.FACEBOOK_APP_ID ?? process.env.META_APP_ID ?? fileEnv.FACEBOOK_APP_ID ?? fileEnv.META_APP_ID;
const secret =
  process.env.FACEBOOK_APP_SECRET ?? process.env.META_APP_SECRET ?? fileEnv.FACEBOOK_APP_SECRET ?? fileEnv.META_APP_SECRET;
const origin = (process.env.PUBLIC_APP_ORIGIN ?? fileEnv.PUBLIC_APP_ORIGIN ?? "https://ketujemi.com").replace(/\/$/, "");
const version = "v21.0";
const redirectUri = `${origin}/api/auth/facebook/callback`;

console.log("\n=== KetuJemi Facebook OAuth check ===\n");

if (!appId || !secret) {
  console.error("Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET (.env or environment).");
  process.exit(1);
}

console.log(`App ID: ${appId}`);
console.log(`Redirect URI (prod): ${redirectUri}`);
console.log(`Local dev URI: http://localhost:5173/api/auth/facebook/callback\n`);

const tokenRes = await fetch(
  `https://graph.facebook.com/${version}/oauth/access_token?${new URLSearchParams({
    client_id: appId,
    client_secret: secret,
    grant_type: "client_credentials",
  })}`,
);
const tokenData = await tokenRes.json();
if (!tokenRes.ok || !tokenData.access_token) {
  console.error("Credential check FAILED:", tokenData.error?.message ?? tokenData);
  process.exit(1);
}
console.log("Credential check: OK (app id + secret valid)\n");

const appRes = await fetch(
  `https://graph.facebook.com/${version}/${appId}?${new URLSearchParams({
    fields: "name,category",
    access_token: tokenData.access_token,
  })}`,
);
const appData = await appRes.json();
if (appRes.ok && appData.name) {
  console.log(`Meta app name: ${appData.name}`);
  if (appData.category) console.log(`Category: ${appData.category}`);
  console.log();
}

console.log("If users see «not released» / «development mode»:");
console.log("  → Meta app is NOT Live. Only Admin/Developer/Tester roles can log in.\n");
console.log("Fix in https://developers.facebook.com/apps/ :");
console.log("  1. Settings → Basic: Privacy Policy + Terms URLs");
console.log("  2. Facebook Login → Settings: enable Client + Web OAuth Login");
console.log(`  3. Valid OAuth Redirect URIs: ${redirectUri}`);
console.log("  4. App Review / Use cases: switch Development → Live (public)");
console.log("  5. Optional until Live: Roles → Testers (invite must be accepted)");
console.log("  6. Permissions: request Advanced Access for `email` if needed\n");

const startUrl = `${origin}/api/auth/facebook/start?return=/`;
console.log(`Test start URL: ${startUrl}\n`);
