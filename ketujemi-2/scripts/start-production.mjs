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
const envFile = path.join(root, ".env");
const staticRoot = path.join(root, "artifacts/vendi/dist/public");
const apiEntry = path.join(root, "artifacts/api-server/dist/index.mjs");
const require = createRequire(path.join(root, "lib", "db", "package.json"));
const { Pool } = require("pg");

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

async function hasCoreTables() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return false;

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 15_000,
  });
  try {
    const { rows } = await pool.query(`
      SELECT
        to_regclass('public.users')            AS users_tbl,
        to_regclass('public.categories')       AS categories_tbl,
        to_regclass('public.listings')         AS listings_tbl
    `);
    const row = rows[0] ?? {};
    return Boolean(row.users_tbl && row.categories_tbl && row.listings_tbl);
  } finally {
    await pool.end();
  }
}

function runPnpm(args) {
  const isWin = process.platform === "win32";
  const result = spawnSync("pnpm", args, {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit",
    shell: isWin,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: pnpm ${args.join(" ")}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  console.log("[start-production] Empty DB — step 1/2: db:push (base schema) …");
  runPnpm(["db:push"]);

  console.log("[start-production] db:push finished — verifying users/categories/listings exist …");
  const tablesReady = await waitForCoreTables();
  if (!tablesReady) {
    throw new Error(
      "db:push completed but core tables are still missing — cannot run db:migrate",
    );
  }
  console.log("[start-production] Core tables verified.");

  console.log("[start-production] step 2/2: db:migrate (SQL migrations) …");
  runPnpm(["db:migrate"]);
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
