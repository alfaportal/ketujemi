/**
 * Run FB + IG scheduled-post crons with Railway production variables (not local PAGE_ACCESS_TOKEN).
 *
 * Prereq: npx @railway/cli login  OR  RAILWAY_TOKEN in ketujemi-2/.env
 *
 * Usage: pnpm run run:social-scheduled-posts:railway
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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
const railwayToken =
  process.env.RAILWAY_TOKEN ??
  process.env.RAILWAY_API_TOKEN ??
  fileEnv.RAILWAY_TOKEN ??
  fileEnv.RAILWAY_API_TOKEN;

const projectId = process.env.RAILWAY_PROJECT_ID ?? fileEnv.RAILWAY_PROJECT_ID;
const environmentId = process.env.RAILWAY_ENVIRONMENT_ID ?? fileEnv.RAILWAY_ENVIRONMENT_ID;
const serviceId = process.env.RAILWAY_SERVICE_ID ?? fileEnv.RAILWAY_SERVICE_ID;

const cliEnv = { ...process.env, USE_RAILWAY_ENV: "1" };
if (railwayToken) cliEnv.RAILWAY_TOKEN = railwayToken;

const railwayArgs = ["run"];
if (projectId) railwayArgs.push("-p", projectId);
if (environmentId) railwayArgs.push("-e", environmentId);
if (serviceId) railwayArgs.push("-s", serviceId);
railwayArgs.push("--", "pnpm", "run", "run:social-scheduled-posts");

console.log("[run:social-scheduled-posts:railway] Using Railway variables (not local PAGE_ACCESS_TOKEN)…");

const result = spawnSync("npx", ["--yes", "@railway/cli", ...railwayArgs], {
  cwd: root,
  env: cliEnv,
  stdio: "inherit",
  encoding: "utf8",
});

if (result.status !== 0) {
  const err = `${result.stderr ?? ""}${result.stdout ?? ""}`;
  if (/unauthorized/i.test(err)) {
    console.error(
      [
        "",
        "Railway CLI is not authenticated. Run:",
        "  cd ketujemi-2",
        "  npx @railway/cli login",
        "  pnpm run run:social-scheduled-posts:railway",
        "",
        "Or add RAILWAY_TOKEN to ketujemi-2/.env",
      ].join("\n"),
    );
  }
  process.exit(result.status ?? 1);
}
