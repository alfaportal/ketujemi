/**
 * Railway preDeploy — drizzle push (base schema) then SQL migrations (best-effort, never blocks deploy).
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidDatabaseUrl, normalizeDatabaseUrl } from "./database-url.mjs";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);
const dbDir = path.join(appRoot, "lib", "db");
const requireDb = createRequire(path.join(dbDir, "package.json"));

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

function resolvePackageBin(pkgName) {
  const pkgJsonPath = requireDb.resolve(`${pkgName}/package.json`);
  const pkgRoot = path.dirname(pkgJsonPath);
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  const binField = pkgJson.bin;
  const rel =
    typeof binField === "string"
      ? binField
      : binField?.[pkgName] ?? Object.values(binField ?? {})[0];
  if (!rel) {
    throw new Error(`Cannot resolve CLI entry for package: ${pkgName}`);
  }
  return path.join(pkgRoot, rel);
}

function runDrizzlePush() {
  const drizzleKitBin = resolvePackageBin("drizzle-kit");
  console.log("[railway-predeploy] Running drizzle-kit push --force (base schema) …");
  const pushResult = spawnSync(
    process.execPath,
    [drizzleKitBin, "push", "--config", "./drizzle.config.ts", "--force"],
    {
      cwd: dbDir,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "inherit",
      shell: false,
    },
  );
  if (pushResult.status !== 0) {
    console.warn(
      `[railway-predeploy] drizzle-kit push exited ${pushResult.status ?? 1} — SQL migrations may fail on empty DB.`,
    );
  } else {
    console.log("[railway-predeploy] drizzle-kit push completed.");
  }
}

runDrizzlePush();

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
