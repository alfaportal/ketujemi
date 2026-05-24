import { spawnSync } from "node:child_process";
import { resolveDatabaseUrlFromEnv } from "./database-url.mjs";
import { resolveAppRoot, resolveMonorepoRoot } from "./resolve-app-root.mjs";

const appRoot = resolveAppRoot();
const monorepoRoot = resolveMonorepoRoot(appRoot);

try {
  resolveDatabaseUrlFromEnv();
} catch {
  /* build can run before DATABASE_URL is wired; db steps are not in build */
}

const env = {
  ...process.env,
  NODE_ENV: "production",
  BASE_PATH: "/",
  NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=4096",
};

console.log("[railway-build] monorepo root:", monorepoRoot);
console.log("[railway-build] app root:", appRoot);

function run(args, cwd) {
  const result = spawnSync("pnpm", args, {
    cwd,
    env,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["install", "--no-frozen-lockfile"], monorepoRoot);
run(["run", "build:production"], appRoot);
console.log("[railway-build] done");
