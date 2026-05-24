import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const parentRoot = path.resolve(appRoot, "..");
const installRoot = fs.existsSync(path.join(parentRoot, "pnpm-workspace.yaml"))
  ? parentRoot
  : appRoot;
const shell = process.platform === "win32";

function run(args, cwd) {
  const result = spawnSync("pnpm", args, { cwd, env: process.env, stdio: "inherit", shell });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("[railway-predeploy] install root:", installRoot);
console.log("[railway-predeploy] app root:", appRoot);

console.log("[railway-predeploy] Installing dependencies …");
run(["install", "--no-frozen-lockfile"], installRoot);

console.log("[railway-predeploy] drizzle-kit push …");
run(["run", "db:push"], appRoot);

console.log("[railway-predeploy] Applying wallet-migration.sql …");
run(["--filter", "@workspace/db", "sql:run", "wallet-migration.sql"], appRoot);

console.log("[railway-predeploy] done");
