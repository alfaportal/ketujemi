/**
 * Run production API + static frontend on one port (default 8080).
 * Requires: node ./scripts/build-production.mjs and a valid `.env` at repo root.
 */
import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_TABLE_SQL_STATEMENTS } from "../lib/db/base-table-statements.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbDir = path.join(root, "lib", "db");
const monorepoRootDir = fs.existsSync(path.join(root, "..", "pnpm-workspace.yaml"))
  ? path.join(root, "..")
  : root;
const envFile = path.join(root, ".env");
const staticRoot = path.join(root, "artifacts/vendi/dist/public");
const apiEntry = path.join(root, "artifacts/api-server/dist/index.mjs");
const requireDb = createRequire(path.join(dbDir, "package.json"));
const { Pool } = requireDb("pg");

const MAX_QUOTA_RETRIES = 3;
const QUOTA_RETRY_DELAY_MS = 5_000;

if (!fs.existsSync(apiEntry)) {
  console.error("[start-production] Missing API build. Run: node ./scripts/build-production.mjs");
  process.exit(1);
}
const indexPath = path.join(staticRoot, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("[start-production] Missing frontend build. Run: node ./scripts/build-production.mjs");
  process.exit(1);
}
const indexHtml = fs.readFileSync(indexPath, "utf8");
if (indexHtml.includes('src="/src/main.tsx"') || !indexHtml.includes("/assets/")) {
  console.error(
    "[start-production] index.html is not a Vite production build (missing /assets/ bundle). Run: node ./scripts/build-production.mjs",
  );
  process.exit(1);
}

const port = process.env.PORT ?? process.env.API_PORT ?? "8080";
const onRailway =
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  Boolean(process.env.RAILWAY_PROJECT_ID) ||
  Boolean(process.env.RAILWAY_SERVICE_ID);

const env = {
  ...process.env,
  NODE_ENV: "production",
  STATIC_ROOT: staticRoot,
  PORT: port,
  API_PORT: port,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isComputeQuotaError(err) {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return msg.includes("exceeded compute time quota");
}

function createDatabasePool() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;
  return new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 15_000,
  });
}

async function queryWithQuotaRetry(pool, sql, label = "query") {
  for (let attempt = 1; attempt <= MAX_QUOTA_RETRIES; attempt++) {
    try {
      return await pool.query(sql);
    } catch (err) {
      if (isComputeQuotaError(err)) {
        if (attempt >= MAX_QUOTA_RETRIES) throw err;
        console.warn(
          `[start-production] Neon compute quota exceeded during ${label} (${attempt}/${MAX_QUOTA_RETRIES}), retrying in 5s…`,
        );
        await sleep(QUOTA_RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Unexpected: ${label} exhausted quota retries`);
}

/**
 * @returns {{ state: "present" } | { state: "absent" } | { state: "unknown", error: unknown }}
 */
async function checkCoreTables() {
  const pool = createDatabasePool();
  if (!pool) {
    return { state: "unknown", error: new Error("DATABASE_URL is not set") };
  }

  try {
    const { rows } = await queryWithQuotaRetry(
      pool,
      `
      SELECT
        to_regclass('public.users')            AS users_tbl,
        to_regclass('public.categories')       AS categories_tbl,
        to_regclass('public.listings')         AS listings_tbl
    `,
      "core table check",
    );
    const row = rows[0] ?? {};
    const hasTables = Boolean(row.users_tbl && row.categories_tbl && row.listings_tbl);
    return hasTables ? { state: "present" } : { state: "absent" };
  } catch (err) {
    return { state: "unknown", error: err };
  } finally {
    await pool.end();
  }
}

function warnCoreTableCheckFailed(check, context) {
  const message =
    check.error instanceof Error ? check.error.message : String(check.error ?? "unknown error");
  console.warn(
    `[start-production] Could not verify core tables${context ? ` (${context})` : ""} — continuing startup:`,
    message,
  );
}

async function ensureBaseTables() {
  const pool = createDatabasePool();
  if (!pool) {
    throw new Error("DATABASE_URL is not set — cannot create base tables");
  }

  try {
    console.log(
      `[start-production] Creating base tables via SQL (${BASE_TABLE_SQL_STATEMENTS.length} statement(s))…`,
    );
    for (let i = 0; i < BASE_TABLE_SQL_STATEMENTS.length; i++) {
      const sql = BASE_TABLE_SQL_STATEMENTS[i];
      await queryWithQuotaRetry(pool, sql, `base table statement ${i + 1}`);
    }
    console.log("[start-production] Base tables SQL completed.");
  } finally {
    await pool.end();
  }
}

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

/** Prefer node_modules/.bin, then package bin entry, then npx (never pnpm). */
function resolveLocalBin(pkgName) {
  const binNames =
    process.platform === "win32" ? [pkgName, `${pkgName}.cmd`] : [pkgName];
  const binDirs = [
    path.join(dbDir, "node_modules", ".bin"),
    path.join(root, "node_modules", ".bin"),
    path.join(monorepoRootDir, "node_modules", ".bin"),
  ];

  for (const binDir of binDirs) {
    for (const name of binNames) {
      const binPath = path.join(binDir, name);
      if (fs.existsSync(binPath)) return binPath;
    }
  }

  try {
    return resolvePackageBin(pkgName);
  } catch {
    return null;
  }
}

function runLocalBinOrNpx(pkgName, args, cwd) {
  const binPath = resolveLocalBin(pkgName);
  if (binPath) {
    console.log(`[start-production] ${pkgName}: ${binPath}`);
    const ext = path.extname(binPath).toLowerCase();
    if (ext === ".js" || ext === ".cjs" || ext === ".mjs") {
      runCli(process.execPath, [binPath, ...args], cwd);
      return;
    }
    runCli(binPath, args, cwd);
    return;
  }

  console.log(`[start-production] ${pkgName}: npx --no-install ${pkgName} …`);
  runCli("npx", ["--no-install", pkgName, ...args], cwd);
}

function runCli(executable, args, cwd) {
  const result = spawnSync(executable, args, {
    cwd,
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? "production" },
    stdio: "inherit",
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `Command failed (exit ${result.status ?? "unknown"}): ${executable} ${args.join(" ")}`,
    );
  }
}

/** Poll until base tables exist (Neon can lag briefly). Unknown check errors stop waiting. */
async function waitForCoreTables(maxAttempts = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const check = await checkCoreTables();
    if (check.state === "present") return { ready: true, check };
    if (check.state === "unknown") return { ready: false, check };
    console.log(
      `[start-production] Waiting for core tables (${attempt}/${maxAttempts})…`,
    );
    await sleep(delayMs);
  }
  return { ready: false, check: { state: "absent" } };
}

async function runBootstrapDbSetup() {
  console.log("[start-production] Empty DB — step 1/2: create base tables (direct SQL) …");
  await ensureBaseTables();

  console.log("[start-production] Base tables created — verifying core tables …");
  const waitResult = await waitForCoreTables();
  if (waitResult.check.state === "present") {
    console.log("[start-production] Core tables verified.");
  } else if (waitResult.check.state === "unknown") {
    warnCoreTableCheckFailed(waitResult.check, "after bootstrap");
  } else if (!waitResult.ready) {
    console.warn(
      "[start-production] Base table SQL finished but core tables still look missing — continuing with migrations anyway.",
    );
  }

  console.log("[start-production] step 2/2: SQL migrations (tsx run-migrations.ts) …");
  runLocalBinOrNpx("tsx", ["./src/run-migrations.ts"], dbDir);
  console.log("[start-production] Database bootstrap completed.");
}

const args = ["--enable-source-maps", apiEntry];
// On Railway, never load ketujemi-2/.env — unquoted `&` in DATABASE_URL breaks Node --env-file
// and can truncate the URL (ENOTFOUND host "base"). Use platform Variables only.
if (fs.existsSync(envFile) && !onRailway && process.env.USE_ENV_FILE !== "0") {
  args.unshift("--env-file", envFile);
}

void (async () => {
  try {
    const check = await checkCoreTables();
    if (check.state === "present") {
      console.log("[start-production] Core DB tables already exist — skipping bootstrap.");
    } else if (check.state === "absent") {
      await runBootstrapDbSetup();
    } else {
      warnCoreTableCheckFailed(check, "startup");
    }
  } catch (err) {
    console.warn(
      "[start-production] Database bootstrap failed — starting server anyway:",
      err instanceof Error ? err.message : err,
    );
  }

  const child = spawn("node", args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => process.exit(code ?? 0));
})();
