/**
 * Set DATABASE_URL on Railway (Neon) without &channel_binding — fixes ENOTFOUND "base".
 *
 * Prereqs:
 *   npx @railway/cli login   OR   RAILWAY_TOKEN in ketujemi-2/.env
 *
 * Usage: pnpm run railway:env:database-url
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(root, "..");
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

function normalizeDatabaseUrl(raw) {
  let url = String(raw ?? "").trim();
  if (!url) return "";
  url = url.replace(/[&?]channel_binding=[^&]*/gi, "");
  url = url.replace(/\?&/, "?").replace(/&&/g, "&").replace(/[?&]$/, "");
  if (url.startsWith("postgres") && !/[?&]sslmode=/.test(url)) {
    url += url.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }
  return url;
}

function databaseHost(url) {
  try {
    const normalized = url
      .replace(/^postgresql:/, "https:")
      .replace(/^postgres:/, "https:");
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

const fileEnv = parseEnvFile(envPath);
const rawUrl = process.env.DATABASE_URL ?? fileEnv.DATABASE_URL;
const databaseUrl = normalizeDatabaseUrl(rawUrl);

if (!databaseUrl) {
  console.error(
    "[railway:env:database-url] Missing DATABASE_URL in ketujemi-2/.env or environment.",
  );
  process.exit(1);
}

const host = databaseHost(databaseUrl);
if (!host || !host.includes(".") || host === "base") {
  console.error(
    `[railway:env:database-url] Invalid DATABASE_URL host "${host ?? "?"}". Fix .env first.`,
  );
  process.exit(1);
}

const railwayToken =
  process.env.RAILWAY_TOKEN ??
  process.env.RAILWAY_API_TOKEN ??
  fileEnv.RAILWAY_TOKEN ??
  fileEnv.RAILWAY_API_TOKEN;

const projectId =
  process.env.RAILWAY_PROJECT_ID ?? fileEnv.RAILWAY_PROJECT_ID;
const environmentId =
  process.env.RAILWAY_ENVIRONMENT_ID ?? fileEnv.RAILWAY_ENVIRONMENT_ID;
const serviceId =
  process.env.RAILWAY_SERVICE_ID ?? fileEnv.RAILWAY_SERVICE_ID;

const cliEnv = { ...process.env };
if (railwayToken) {
  cliEnv.RAILWAY_TOKEN = railwayToken;
}

function railway(args, { cwd = root, stdin } = {}) {
  const result = spawnSync("npx", ["--yes", "@railway/cli", ...args], {
    cwd,
    env: cliEnv,
    encoding: "utf8",
    stdio: stdin ? ["pipe", "pipe", "pipe"] : "pipe",
    input: stdin,
  });
  const out = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) {
    if (/unauthorized/i.test(out)) {
      console.error(
        [
          "[railway:env:database-url] Railway CLI is not authenticated.",
          "",
          "Run:",
          "  cd ketujemi-2",
          "  npx @railway/cli login",
          "  pnpm run railway:env:database-url",
          "",
          "Or add RAILWAY_TOKEN to .env (https://railway.com/account/tokens).",
        ].join("\n"),
      );
    } else {
      console.error(out || `railway exited ${result.status}`);
    }
    process.exit(result.status ?? 1);
  }
  return out;
}

const whoami = spawnSync("npx", ["--yes", "@railway/cli", "whoami"], {
  cwd: root,
  env: cliEnv,
  encoding: "utf8",
});
const whoOut = `${whoami.stdout ?? ""}${whoami.stderr ?? ""}`;
if (whoami.status !== 0 || /unauthorized/i.test(whoOut)) {
  console.error(
    [
      "[railway:env:database-url] Railway CLI is not authenticated.",
      "",
      "Run:  npx @railway/cli login",
      "Then: pnpm run railway:env:database-url",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`[railway:env:database-url] Setting DATABASE_URL (host ${host})…`);

const setArgs = ["variable", "set", "DATABASE_URL", "--stdin"];
if (projectId) setArgs.push("-p", projectId);
if (environmentId) setArgs.push("-e", environmentId);
if (serviceId) setArgs.push("-s", serviceId);

railway(setArgs, { stdin: databaseUrl });

console.log("[railway:env:database-url] Triggering redeploy…");

const redeployArgs = ["redeploy", "--yes"];
if (serviceId) redeployArgs.push("-s", serviceId);
if (environmentId) redeployArgs.push("-e", environmentId);
if (projectId) redeployArgs.push("-p", projectId);

try {
  railway(redeployArgs, { cwd: repoRoot });
} catch {
  railway(["up", "--detach"], { cwd: repoRoot });
}

console.log("[railway:env:database-url] Done. Wait for deploy, then test login at https://www.ketujemi.com");
