/**
 * Set Facebook Page auto-post variables on Railway.
 *
 * Prereqs: FB_PAGE_ACCESS_TOKEN in ketujemi-2/.env (or env), Railway CLI auth.
 *
 * Usage:
 *   pnpm run railway:env:facebook
 */
import { spawnSync } from "node:child_process";
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
const pageToken =
  process.env.FB_PAGE_ACCESS_TOKEN ??
  process.env.PAGE_ACCESS_TOKEN ??
  fileEnv.FB_PAGE_ACCESS_TOKEN ??
  fileEnv.PAGE_ACCESS_TOKEN;
const pageId =
  process.env.FB_PAGE_ID ??
  process.env.PAGE_ID ??
  fileEnv.FB_PAGE_ID ??
  fileEnv.PAGE_ID ??
  "1112756445260808";
const igId =
  process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ?? fileEnv.INSTAGRAM_BUSINESS_ACCOUNT_ID;

if (!pageToken) {
  console.error(
    "[railway:env:facebook] Missing FB_PAGE_ACCESS_TOKEN (or PAGE_ACCESS_TOKEN) in .env or environment.",
  );
  process.exit(1);
}

const railwayToken =
  process.env.RAILWAY_TOKEN ??
  process.env.RAILWAY_API_TOKEN ??
  fileEnv.RAILWAY_TOKEN ??
  fileEnv.RAILWAY_API_TOKEN;

const projectId = process.env.RAILWAY_PROJECT_ID ?? fileEnv.RAILWAY_PROJECT_ID;
const environmentId = process.env.RAILWAY_ENVIRONMENT_ID ?? fileEnv.RAILWAY_ENVIRONMENT_ID;
const serviceId = process.env.RAILWAY_SERVICE_ID ?? fileEnv.RAILWAY_SERVICE_ID;

const cliEnv = { ...process.env };
if (railwayToken) cliEnv.RAILWAY_TOKEN = railwayToken;

function railway(args, { stdin } = {}) {
  const base = ["variable", "set", ...args];
  if (projectId) base.push("-p", projectId);
  if (environmentId) base.push("-e", environmentId);
  if (serviceId) base.push("-s", serviceId);

  const result = spawnSync("npx", ["--yes", "@railway/cli", ...base], {
    cwd: root,
    env: cliEnv,
    stdio: stdin ? ["pipe", "inherit", "inherit"] : "inherit",
    input: stdin,
    encoding: "utf8",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const whoami = spawnSync("npx", ["--yes", "@railway/cli", "whoami"], {
  cwd: root,
  env: cliEnv,
  encoding: "utf8",
});
if (
  whoami.status !== 0 ||
  /unauthorized/i.test(`${whoami.stderr ?? ""}${whoami.stdout ?? ""}`)
) {
  console.error(
    [
      "[railway:env:facebook] Railway CLI is not authenticated.",
      "",
      "Run:",
      "  cd ketujemi-2",
      "  npx @railway/cli login",
      "  pnpm run railway:env:facebook",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("[railway:env:facebook] Setting FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN…");
railway([`FB_PAGE_ID=${pageId}`, "--skip-deploys"]);
railway(["FB_PAGE_ACCESS_TOKEN", "--stdin", "--skip-deploys"], { stdin: pageToken });
railway(["PAGE_ACCESS_TOKEN", "--stdin", "--skip-deploys"], { stdin: "" });
if (igId) {
  railway([`INSTAGRAM_BUSINESS_ACCOUNT_ID=${igId}`, "--skip-deploys"]);
}

console.log(
  [
    "[railway:env:facebook] Done.",
    "Redeploy API on Railway, then run:",
    "  pnpm run run:social-scheduled-posts",
    "Or use Admin → Social posts → Run FB + IG crons.",
  ].join("\n"),
);
