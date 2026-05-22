import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const parent = path.dirname(appRoot);
const monorepoRoot = fs.existsSync(path.join(parent, "pnpm-workspace.yaml"))
  ? parent
  : appRoot;
const shell = process.platform === "win32";

const env = {
  ...process.env,
  NODE_ENV: "production",
  BASE_PATH: "/",
  NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=4096",
};

console.log("[railway-build] monorepo root:", monorepoRoot);
console.log("[railway-build] app root:", appRoot);

function run(args, cwd) {
  const result = spawnSync("pnpm", args, { cwd, env, stdio: "inherit", shell });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["install", "--no-frozen-lockfile"], monorepoRoot);
run(["run", "build:production"], appRoot);
console.log("[railway-build] done");
