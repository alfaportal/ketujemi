/**
 * Railway preDeploy — base tables (SQL) then incremental SQL migrations (best-effort, never blocks deploy).
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidDatabaseUrl, normalizeDatabaseUrl } from "./database-url.mjs";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);

console.log("[railway-predeploy] monorepo root:", monorepoRoot);
console.log("[railway-predeploy] app root:", appRoot);

/** Ensure pg is resolvable (preDeploy can run after build; pnpm hoists to workspace root). */
function ensureNodeModules() {
  try {
    createRequire(path.join(appRoot, "lib", "db", "package.json"))("pg");
    console.log("[railway-predeploy] node_modules OK (pg resolvable)");
    return;
  } catch {
    /* install below */
  }

  console.log("[railway-predeploy] node_modules missing — running pnpm install …");
  const result = spawnSync(
    "pnpm",
    ["install", "--no-frozen-lockfile"],
    {
      cwd: monorepoRoot,
      env: {
        ...process.env,
        NODE_ENV: "development",
        NPM_CONFIG_PRODUCTION: "false",
        CI: "true",
      },
      stdio: "inherit",
      shell: false,
    },
  );

  if (result.status !== 0) {
    console.warn(
      `[railway-predeploy] pnpm install failed (exit ${result.status ?? 1}) — skipping SQL migrations.`,
    );
    process.exit(0);
  }
}

ensureNodeModules();

const rawUrl = process.env.DATABASE_URL?.trim();
if (!rawUrl) {
  console.warn(
    "[railway-predeploy] DATABASE_URL not set — skipping SQL migrations. Deploy continues.",
  );
  process.exit(0);
}

let databaseUrl;
try {
  databaseUrl = assertValidDatabaseUrl(normalizeDatabaseUrl(rawUrl)).url;
  process.env.DATABASE_URL = databaseUrl;
} catch (err) {
  console.warn(
    `[railway-predeploy] ${err instanceof Error ? err.message : err} — skipping migrations. Deploy continues.`,
  );
  process.exit(0);
}

console.log(
  "[railway-predeploy] DATABASE_URL host:",
  assertValidDatabaseUrl(databaseUrl).host,
);

function runCreateBaseTables() {
  const createScript = path.join(scriptsDir, "create-base-tables.mjs");
  console.log("[railway-predeploy] Creating base tables (CREATE TABLE IF NOT EXISTS) …");
  const pushResult = spawnSync(process.execPath, [createScript], {
    cwd: monorepoRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
    shell: false,
  });
  if (pushResult.status !== 0) {
    console.warn(
      `[railway-predeploy] create-base-tables exited ${pushResult.status ?? 1} — SQL migrations may fail on empty DB.`,
    );
  } else {
    console.log("[railway-predeploy] Base tables ready.");
  }
}

runCreateBaseTables();

console.log("[railway-predeploy] Applying SQL migrations (best-effort, non-blocking) …");

const allSqlRunner = path.join(scriptsDir, "run-all-db-sql.mjs");
const result = spawnSync(process.execPath, [allSqlRunner, "--soft"], {
  cwd: monorepoRoot,
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: "inherit",
  shell: false,
});

if (result.status !== 0) {
  console.warn(
    `[railway-predeploy] SQL migrations exited ${result.status ?? 1} — deploy continues.`,
  );
} else {
  console.log("[railway-predeploy] SQL migrations completed.");
}

console.log("[railway-predeploy] done");
process.exit(0);
