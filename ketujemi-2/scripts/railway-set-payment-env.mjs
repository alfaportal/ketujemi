/**
 * Sync Stripe + Kosovo payment flags on Railway.
 *
 * Usage:
 *   npx @railway/cli login && npx @railway/cli link
 *   # Optional: STRIPE_* in ketujemi-2/.env
 *   pnpm run railway:env:payments
 *
 * Check only: pnpm run railway:env:payments -- --check
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const railwayToken =
  process.env.RAILWAY_TOKEN ??
  process.env.RAILWAY_API_TOKEN ??
  fileEnv.RAILWAY_TOKEN ??
  fileEnv.RAILWAY_API_TOKEN;

const projectId = process.env.RAILWAY_PROJECT_ID ?? fileEnv.RAILWAY_PROJECT_ID;
const environmentId =
  process.env.RAILWAY_ENVIRONMENT_ID ?? fileEnv.RAILWAY_ENVIRONMENT_ID;
const serviceId = process.env.RAILWAY_SERVICE_ID ?? fileEnv.RAILWAY_SERVICE_ID;

const stripeSecret =
  process.env.STRIPE_SECRET_KEY ?? fileEnv.STRIPE_SECRET_KEY;
const stripePublishable =
  process.env.STRIPE_PUBLISHABLE_KEY ??
  fileEnv.STRIPE_PUBLISHABLE_KEY ??
  process.env.VITE_STRIPE_PUBLISHABLE_KEY ??
  fileEnv.VITE_STRIPE_PUBLISHABLE_KEY;
const stripeWebhook =
  process.env.STRIPE_WEBHOOK_SECRET ?? fileEnv.STRIPE_WEBHOOK_SECRET;

const cliEnv = { ...process.env };
if (railwayToken) cliEnv.RAILWAY_TOKEN = railwayToken;

function railway(args, { stdin } = {}) {
  const result = spawnSync("npx", ["--yes", "@railway/cli", ...args], {
    cwd: root,
    env: cliEnv,
    encoding: "utf8",
    stdio: stdin ? ["pipe", "pipe", "pipe"] : "pipe",
    input: stdin,
  });
  const out = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) {
    console.error(out || `railway exited ${result.status}`);
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

function setVar(name, value) {
  const args = ["variable", "set", name, "--stdin"];
  if (projectId) args.push("-p", projectId);
  if (environmentId) args.push("-e", environmentId);
  if (serviceId) args.push("-s", serviceId);
  railway(args, { stdin: value });
}

function deleteVar(name) {
  const args = ["variable", "delete", name];
  if (projectId) args.push("-p", projectId);
  if (environmentId) args.push("-e", environmentId);
  if (serviceId) args.push("-s", serviceId);
  railway(args);
}

function mask(val) {
  if (!val) return "(missing)";
  if (val.length < 12) return "(set, short)";
  return `${val.slice(0, 8)}…${val.slice(-4)}`;
}

function parseKv(output) {
  const map = new Map();
  for (const line of output.split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    map.set(line.slice(0, eq), line.slice(eq + 1));
  }
  return map;
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
      "[railway:env:payments] Railway CLI is not authenticated.",
      "",
      "Run:  npx @railway/cli login",
      "Then: pnpm run railway:env:payments",
      "",
      "Or add RAILWAY_TOKEN to ketujemi-2/.env (https://railway.com/account/tokens).",
    ].join("\n"),
  );
  process.exit(1);
}

const vars = parseKv(railway(listArgs()));

console.log("[railway:env:payments] Stripe on Railway:");
console.log("  STRIPE_SECRET_KEY:", mask(vars.get("STRIPE_SECRET_KEY")));
console.log("  STRIPE_PUBLISHABLE_KEY:", mask(vars.get("STRIPE_PUBLISHABLE_KEY")));
console.log(
  "  VITE_STRIPE_PUBLISHABLE_KEY:",
  mask(vars.get("VITE_STRIPE_PUBLISHABLE_KEY")),
);
console.log("  STRIPE_WEBHOOK_SECRET:", mask(vars.get("STRIPE_WEBHOOK_SECRET")));
console.log("[railway:env:payments] Kosovo flags:");
console.log("  KOSOVO_STRIPE_ENABLED:", vars.get("KOSOVO_STRIPE_ENABLED") ?? "(not set)");
console.log("  KOSOVO_WALLET_USE_BANK:", vars.get("KOSOVO_WALLET_USE_BANK") ?? "(not set)");

const issues = [];
if (!vars.get("STRIPE_SECRET_KEY")?.startsWith("sk_")) {
  issues.push("STRIPE_SECRET_KEY missing or invalid on Railway");
}
const pub =
  vars.get("STRIPE_PUBLISHABLE_KEY") ?? vars.get("VITE_STRIPE_PUBLISHABLE_KEY");
if (!pub?.startsWith("pk_")) {
  issues.push("STRIPE_PUBLISHABLE_KEY / VITE_STRIPE_PUBLISHABLE_KEY missing on Railway");
}
if (!vars.get("STRIPE_WEBHOOK_SECRET")?.startsWith("whsec_")) {
  issues.push("STRIPE_WEBHOOK_SECRET missing or invalid on Railway");
}
if (vars.get("KOSOVO_STRIPE_ENABLED")?.toLowerCase() === "false") {
  issues.push("KOSOVO_STRIPE_ENABLED=false blocks Kosovo — should be removed");
}
if (vars.get("KOSOVO_WALLET_USE_BANK")?.toLowerCase() === "true") {
  issues.push("KOSOVO_WALLET_USE_BANK=true forces bank instead of Stripe");
}

if (checkOnly) {
  if (issues.length) {
    console.error("\n[railway:env:payments] Issues:\n- " + issues.join("\n- "));
    process.exit(1);
  }
  console.log("\n[railway:env:payments] OK — payment variables look correct.");
  process.exit(0);
}

let changed = false;

if (vars.get("KOSOVO_STRIPE_ENABLED")?.toLowerCase() === "false") {
  console.log("[railway:env:payments] Deleting KOSOVO_STRIPE_ENABLED=false …");
  deleteVar("KOSOVO_STRIPE_ENABLED");
  changed = true;
}

if (vars.get("KOSOVO_WALLET_USE_BANK") !== "false") {
  console.log("[railway:env:payments] Setting KOSOVO_WALLET_USE_BANK=false …");
  setVar("KOSOVO_WALLET_USE_BANK", "false");
  changed = true;
}

if (stripeSecret?.startsWith("sk_") && vars.get("STRIPE_SECRET_KEY") !== stripeSecret) {
  console.log("[railway:env:payments] Setting STRIPE_SECRET_KEY from .env …");
  setVar("STRIPE_SECRET_KEY", stripeSecret);
  changed = true;
}

if (stripePublishable?.startsWith("pk_")) {
  if (vars.get("STRIPE_PUBLISHABLE_KEY") !== stripePublishable) {
    console.log("[railway:env:payments] Setting STRIPE_PUBLISHABLE_KEY from .env …");
    setVar("STRIPE_PUBLISHABLE_KEY", stripePublishable);
    changed = true;
  }
  if (vars.get("VITE_STRIPE_PUBLISHABLE_KEY") !== stripePublishable) {
    console.log("[railway:env:payments] Setting VITE_STRIPE_PUBLISHABLE_KEY from .env …");
    setVar("VITE_STRIPE_PUBLISHABLE_KEY", stripePublishable);
    changed = true;
  }
}

if (stripeWebhook?.startsWith("whsec_") && vars.get("STRIPE_WEBHOOK_SECRET") !== stripeWebhook) {
  console.log("[railway:env:payments] Setting STRIPE_WEBHOOK_SECRET from .env …");
  setVar("STRIPE_WEBHOOK_SECRET", stripeWebhook);
  changed = true;
}

const after = parseKv(railway(listArgs()));
if (!after.get("STRIPE_SECRET_KEY")?.startsWith("sk_")) {
  issues.push("STRIPE_SECRET_KEY still missing — add in Railway dashboard or ketujemi-2/.env");
}
const pubAfter =
  after.get("STRIPE_PUBLISHABLE_KEY") ?? after.get("VITE_STRIPE_PUBLISHABLE_KEY");
if (!pubAfter?.startsWith("pk_")) {
  issues.push("Publishable key still missing on Railway");
}
if (!after.get("STRIPE_WEBHOOK_SECRET")?.startsWith("whsec_")) {
  issues.push("STRIPE_WEBHOOK_SECRET still missing on Railway");
}

if (issues.length) {
  console.warn("\n[railway:env:payments] Remaining issues:\n- " + issues.join("\n- "));
}

if (changed) {
  console.log("\n[railway:env:payments] Variables updated. Railway will redeploy on change.");
} else {
  console.log("\n[railway:env:payments] No variable writes needed.");
}

process.exit(issues.length ? 1 : 0);
