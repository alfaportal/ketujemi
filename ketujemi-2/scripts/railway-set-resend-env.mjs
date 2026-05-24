/**
 * Set RESEND_API_KEY on Railway from ketujemi-2/.env (or env).
 *
 * Usage:
 *   Add RESEND_API_KEY=re_... to ketujemi-2/.env
 *   npx @railway/cli login && npx @railway/cli link
 *   pnpm run railway:env:resend
 *
 * Check only (no write): pnpm run railway:env:resend -- --check
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_PREFIX = "re_RCR1M3kf";
const checkOnly = process.argv.includes("--check");

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
const resendKey = process.env.RESEND_API_KEY ?? fileEnv.RESEND_API_KEY;

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
          "[railway:env:resend] Railway CLI is not authenticated.",
          "",
          "Run:  npx @railway/cli login",
          "Then: pnpm run railway:env:resend",
        ].join("\n"),
      );
    } else {
      console.error(out || `railway exited ${result.status}`);
    }
    process.exit(result.status ?? 1);
  }
  return out;
}

function listArgs() {
  const args = ["variable", "list", "--kv"];
  if (projectId) args.push("-p", projectId);
  if (environmentId) args.push("-e", environmentId);
  if (serviceId) args.push("-s", serviceId);
  return args;
}

function maskKey(key) {
  if (!key || key.length < 12) return "(missing or too short)";
  return `${key.slice(0, 12)}…${key.slice(-4)}`;
}

const whoami = spawnSync("npx", ["--yes", "@railway/cli", "whoami"], {
  cwd: root,
  env: cliEnv,
  encoding: "utf8",
});
const whoOut = `${whoami.stdout ?? ""}${whoami.stderr ?? ""}`;
if (whoami.status !== 0 || /unauthorized/i.test(whoOut)) {
  console.error("[railway:env:resend] Railway CLI is not authenticated. Run: npx @railway/cli login");
  process.exit(1);
}

const kv = railway(listArgs());
const currentLine = kv
  .split(/\r?\n/)
  .find((line) => line.startsWith("RESEND_API_KEY="));
const currentValue = currentLine?.slice("RESEND_API_KEY=".length) ?? "";

console.log("[railway:env:resend] Railway RESEND_API_KEY:", maskKey(currentValue));
console.log(
  "[railway:env:resend] Starts with expected prefix?",
  currentValue.startsWith(EXPECTED_PREFIX) ? "YES" : "NO",
);

if (checkOnly) {
  process.exit(currentValue.startsWith(EXPECTED_PREFIX) ? 0 : 1);
}

if (!resendKey?.startsWith("re_")) {
  console.error(
    [
      "[railway:env:resend] Missing RESEND_API_KEY in ketujemi-2/.env.",
      "",
      `Add the full key from https://resend.com/api-keys (should start with ${EXPECTED_PREFIX}).`,
      "Then run: pnpm run railway:env:resend",
    ].join("\n"),
  );
  process.exit(1);
}

if (!resendKey.startsWith(EXPECTED_PREFIX)) {
  console.warn(
    `[railway:env:resend] Warning: .env key prefix is ${resendKey.slice(0, 12)}… (expected ${EXPECTED_PREFIX}…)`,
  );
}

if (currentValue === resendKey) {
  console.log("[railway:env:resend] Already up to date — no change.");
  process.exit(0);
}

console.log("[railway:env:resend] Setting RESEND_API_KEY from .env …");

const setArgs = ["variable", "set", "RESEND_API_KEY", "--stdin"];
if (projectId) setArgs.push("-p", projectId);
if (environmentId) setArgs.push("-e", environmentId);
if (serviceId) setArgs.push("-s", serviceId);

railway(setArgs, { stdin: resendKey });

console.log("[railway:env:resend] Done. Redeploy triggered — test registration after deploy.");
