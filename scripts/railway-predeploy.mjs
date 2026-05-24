import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);

/** Snapshot before any child process — Railway injects this; do not read .env in SQL runner. */
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error(
    "[railway-predeploy] DATABASE_URL is not set. Add it in Railway → Variables before preDeploy.",
  );
  process.exit(1);
}

const installEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  NODE_ENV: "development",
  NPM_CONFIG_PRODUCTION: "false",
  CI: "true",
};

function runPnpm(args, cwd, { required = true, label, useShell = true } = {}) {
  if (label) console.log(`[railway-predeploy] ${label} …`);

  const result = spawnSync("pnpm", args, {
    cwd,
    env: installEnv,
    stdio: "inherit",
    shell: useShell,
  });

  if (result.status !== 0) {
    if (required) {
      console.error(`[railway-predeploy] Command failed: pnpm ${args.join(" ")}`);
      process.exit(result.status ?? 1);
    }
    console.warn(
      `[railway-predeploy] Optional step failed (exit ${result.status}): pnpm ${args.join(" ")}`,
    );
  }
}

let dbHost = "(unknown)";
try {
  const normalized = databaseUrl
    .replace(/^postgresql:/, "https:")
    .replace(/^postgres:/, "https:");
  dbHost = new URL(normalized).hostname;
} catch {
  console.error("[railway-predeploy] DATABASE_URL is not a valid postgres URL.");
  process.exit(1);
}

console.log("[railway-predeploy] monorepo root:", monorepoRoot);
console.log("[railway-predeploy] app root:", appRoot);
console.log("[railway-predeploy] DATABASE_URL host:", dbHost);

console.log("[railway-predeploy] Installing dependencies (including devDeps for drizzle-kit) …");
runPnpm(["install", "--no-frozen-lockfile"], monorepoRoot, {
  label: "pnpm install",
});

runPnpm(["--filter", "@workspace/db", "exec", "drizzle-kit", "--version"], appRoot, {
  label: "verify drizzle-kit is on PATH",
});

runPnpm(["run", "db:push"], appRoot, {
  required: false,
  label: "drizzle-kit push (db:push) — optional",
});

console.log("[railway-predeploy] Applying all lib/db/sql migrations …");
const allSqlRunner = path.join(scriptsDir, "run-all-db-sql.mjs");
const allMigrations = spawnSync(process.execPath, [allSqlRunner], {
  cwd: monorepoRoot,
  env: installEnv,
  stdio: "inherit",
  shell: false,
});
if (allMigrations.status !== 0) {
  console.error("[railway-predeploy] One or more SQL migrations failed.");
  process.exit(allMigrations.status ?? 1);
}

runPnpm(["run", "db:seed:parent-images"], appRoot, {
  required: false,
  label: "db:seed:parent-images",
});

console.log("[railway-predeploy] done");
