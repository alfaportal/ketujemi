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

async function hasCoreTables() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return false;

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 15_000,
  });

  const maxQuotaRetries = 3;
  const quotaRetryDelayMs = 5_000;

  try {
    for (let attempt = 1; attempt <= maxQuotaRetries; attempt++) {
      try {
        const { rows } = await pool.query(`
      SELECT
        to_regclass('public.users')            AS users_tbl,
        to_regclass('public.categories')       AS categories_tbl,
        to_regclass('public.listings')         AS listings_tbl
    `);
        const row = rows[0] ?? {};
        return Boolean(row.users_tbl && row.categories_tbl && row.listings_tbl);
      } catch (err) {
        if (isComputeQuotaError(err)) {
          if (attempt >= maxQuotaRetries) {
            throw err;
          }
          console.warn(
            `[start-production] Neon compute quota exceeded (${attempt}/${maxQuotaRetries}), retrying in 5s…`,
          );
          await sleep(quotaRetryDelayMs);
          continue;
        }
        console.warn(
          "[start-production] Could not check core tables:",
          err instanceof Error ? err.message : err,
        );
        return false;
      }
    }
    return false;
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

/** Poll until drizzle push has created core tables (Neon can lag briefly). */
async function waitForCoreTables(maxAttempts = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (await hasCoreTables()) return true;
    console.log(
      `[start-production] Waiting for core tables (${attempt}/${maxAttempts})…`,
    );
    await sleep(delayMs);
  }
  return false;
}

async function runBootstrapDbSetup() {
  console.log(
    "[start-production] Empty DB — step 1/2: drizzle-kit push:pg (node_modules/.bin or npx) …",
  );
  runLocalBinOrNpx(
    "drizzle-kit",
    ["push:pg", "--config", "./drizzle.config.ts", "--force"],
    dbDir,
  );

  console.log("[start-production] drizzle-kit push:pg finished — verifying core tables …");
  const tablesReady = await waitForCoreTables();
  if (!tablesReady) {
    throw new Error(
      "drizzle-kit push:pg completed but core tables are still missing — cannot run SQL migrations",
    );
  }
  console.log("[start-production] Core tables verified.");

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
    if (!(await hasCoreTables())) {
      await runBootstrapDbSetup();
    } else {
      console.log("[start-production] Core DB tables already exist — skipping bootstrap.");
    }
  } catch (err) {
    console.error(
      "[start-production] Automatic DB bootstrap failed:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }

  const child = spawn("node", args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => process.exit(code ?? 0));
})();
