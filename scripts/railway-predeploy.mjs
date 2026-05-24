/**
 * Railway preDeploy — best-effort SQL migrations only.
 * Never blocks deploy: build already ran in railway-build.mjs; schema is also
 * guarded at API boot (ensureWalletSchema). Migrations were applied manually on Neon.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);

const databaseUrl = process.env.DATABASE_URL?.trim();

console.log("[railway-predeploy] monorepo root:", monorepoRoot);
console.log("[railway-predeploy] app root:", appRoot);

if (!databaseUrl) {
  console.warn(
    "[railway-predeploy] DATABASE_URL not set — skipping SQL migrations. Deploy continues.",
  );
  process.exit(0);
}

if (
  !databaseUrl.startsWith("postgres://") &&
  !databaseUrl.startsWith("postgresql://")
) {
  console.warn(
    "[railway-predeploy] DATABASE_URL is not a postgres URL — skipping migrations. Deploy continues.",
  );
  process.exit(0);
}

try {
  const normalized = databaseUrl
    .replace(/^postgresql:/, "https:")
    .replace(/^postgres:/, "https:");
  console.log("[railway-predeploy] DATABASE_URL host:", new URL(normalized).hostname);
} catch {
  console.warn(
    "[railway-predeploy] DATABASE_URL is not a valid URL — skipping migrations. Deploy continues.",
  );
  process.exit(0);
}

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
    `[railway-predeploy] SQL migrations exited ${result.status ?? 1} — deploy continues (schema may already be applied).`,
  );
} else {
  console.log("[railway-predeploy] SQL migrations completed.");
}

console.log("[railway-predeploy] done");
process.exit(0);
