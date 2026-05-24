import { spawnSync } from "node:child_process";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);
const shell = process.platform === "win32";

function run(args, cwd) {
  const result = spawnSync("pnpm", args, { cwd, env: process.env, stdio: "inherit", shell });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("[railway-predeploy] monorepo root:", monorepoRoot);
console.log("[railway-predeploy] app root:", appRoot);

console.log("[railway-predeploy] Installing dependencies …");
run(["install", "--no-frozen-lockfile"], monorepoRoot);

console.log("[railway-predeploy] drizzle-kit push …");
run(["run", "db:push"], appRoot);

console.log("[railway-predeploy] Applying wallet-migration.sql …");
run(["--filter", "@workspace/db", "sql:run", "wallet-migration.sql"], appRoot);

console.log("[railway-predeploy] Seeding parent category images …");
run(["run", "db:seed:parent-images"], appRoot);

console.log("[railway-predeploy] done");
