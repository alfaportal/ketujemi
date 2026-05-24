/**
 * Run wallet-migration.sql using Railway production DATABASE_URL.
 *
 * Prereqs (one of):
 *   - `npx @railway/cli login` and linked project in ketujemi-2/
 *   - RAILWAY_TOKEN in environment or ketujemi-2/.env
 *
 * Usage: pnpm run railway:migrate:wallet
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = process.platform === "win32";

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

const fileEnv = parseEnvFile(path.join(root, ".env"));
const cliEnv = { ...process.env };
const railwayToken =
  process.env.RAILWAY_TOKEN ??
  process.env.RAILWAY_API_TOKEN ??
  fileEnv.RAILWAY_TOKEN ??
  fileEnv.RAILWAY_API_TOKEN;
if (railwayToken) cliEnv.RAILWAY_TOKEN = railwayToken;

const projectId = process.env.RAILWAY_PROJECT_ID ?? fileEnv.RAILWAY_PROJECT_ID;
const environmentId =
  process.env.RAILWAY_ENVIRONMENT_ID ?? fileEnv.RAILWAY_ENVIRONMENT_ID;
const serviceId = process.env.RAILWAY_SERVICE_ID ?? fileEnv.RAILWAY_SERVICE_ID;

const runArgs = [
  "--yes",
  "@railway/cli",
  "run",
  ...(projectId ? ["-p", projectId] : []),
  ...(environmentId ? ["-e", environmentId] : []),
  ...(serviceId ? ["-s", serviceId] : []),
  "--",
  "pnpm",
  "--filter",
  "@workspace/db",
  "sql:run",
  "wallet-migration.sql",
];

console.log("[railway:migrate:wallet] Running wallet-migration.sql with Railway DATABASE_URL …");

const result = spawnSync("npx", runArgs, {
  cwd: root,
  env: cliEnv,
  stdio: "inherit",
  shell,
});

process.exit(result.status ?? 1);
