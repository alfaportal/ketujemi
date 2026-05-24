import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const parentRoot = path.resolve(appRoot, "..");
const installRoot = fs.existsSync(path.join(parentRoot, "pnpm-workspace.yaml"))
  ? parentRoot
  : appRoot;

const installEnv = {
  ...process.env,
  NODE_ENV: "development",
  NPM_CONFIG_PRODUCTION: "false",
  CI: "true",
};

const shell = true;

function runPnpm(args, cwd, { required = true, label } = {}) {
  if (label) console.log(`[railway-predeploy] ${label} …`);
  const result = spawnSync("pnpm", args, { cwd, env: installEnv, stdio: "inherit", shell });
  if (result.status !== 0) {
    if (required) process.exit(result.status ?? 1);
    console.warn(`[railway-predeploy] optional step failed: pnpm ${args.join(" ")}`);
  }
}

console.log("[railway-predeploy] install root:", installRoot);
console.log("[railway-predeploy] app root:", appRoot);

if (!installEnv.DATABASE_URL?.trim()) {
  console.error("[railway-predeploy] DATABASE_URL is not set.");
  process.exit(1);
}

runPnpm(["install", "--no-frozen-lockfile"], installRoot, { label: "pnpm install" });

runPnpm(["run", "db:push"], appRoot, {
  required: false,
  label: "db:push (optional)",
});
runPnpm(["--filter", "@workspace/db", "sql:run", "wallet-migration.sql"], appRoot, {
  label: "wallet-migration.sql",
});
runPnpm(["run", "db:seed:parent-images"], appRoot, {
  required: false,
  label: "db:seed:parent-images",
});

console.log("[railway-predeploy] done");
