/**
 * Set VONAGE_API_KEY and VONAGE_API_SECRET on Railway from ketujemi-2/.env
 *
 * Prereqs (one of):
 *   - `npx @railway/cli login` and linked project in ketujemi-2/
 *   - RAILWAY_TOKEN or RAILWAY_API_TOKEN in environment or .env
 *
 * Usage: pnpm run railway:env:vonage
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
const apiKey = process.env.VONAGE_API_KEY ?? fileEnv.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET ?? fileEnv.VONAGE_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error(
    "[railway:env:vonage] Missing VONAGE_API_KEY or VONAGE_API_SECRET in .env or environment.",
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
  if (result.status !== 0) {
    const err = `${result.stderr ?? ""}${result.stdout ?? ""}`;
    if (/unauthorized/i.test(err)) {
      console.error(
        [
          "[railway:env:vonage] Railway CLI is not authenticated.",
          "",
          "Do one of the following, then run: pnpm run railway:env:vonage",
          "  1. npx @railway/cli login",
          "  2. Add RAILWAY_TOKEN to ketujemi-2/.env (https://railway.com/account/tokens)",
          "",
          "Optional (if not linked to a project): also set in .env",
          "  RAILWAY_PROJECT_ID, RAILWAY_ENVIRONMENT_ID, RAILWAY_SERVICE_ID",
          "  (Cmd+K in Railway dashboard → copy IDs)",
        ].join("\n"),
      );
    }
    process.exit(result.status ?? 1);
  }
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
      "[railway:env:vonage] Railway CLI is not authenticated.",
      "",
      "Run in your terminal:",
      "  cd ketujemi-2",
      "  npx @railway/cli login",
      "  pnpm run railway:env:vonage",
      "",
      "Or add RAILWAY_TOKEN to .env and re-run this script.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("[railway:env:vonage] Setting VONAGE_API_KEY and VONAGE_API_SECRET…");

railway([`VONAGE_API_KEY=${apiKey}`, "--skip-deploys"]);
railway(["VONAGE_API_SECRET", "--stdin", "--skip-deploys"], { stdin: apiSecret });

console.log("[railway:env:vonage] Done. Redeploy if SMS still fails on the old build.");
