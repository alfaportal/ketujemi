import { spawnSync } from "node:child_process";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);
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
