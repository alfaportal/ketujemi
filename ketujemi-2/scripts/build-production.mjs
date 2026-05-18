/**
 * Production build: Vite frontend + API server bundle.
 * Usage (repo root): node ./scripts/build-production.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = process.platform === "win32";
const useNpm = process.env.USE_NPM === "1";

const env = {
  ...process.env,
  NODE_ENV: "production",
  BASE_PATH: "/",
  PORT: process.env.PORT ?? "8080",
};

function run(args) {
  const cmd = useNpm ? "npm" : "pnpm";
  const result = spawnSync(cmd, args, {
    cwd: root,
    env,
    stdio: "inherit",
    shell,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (useNpm) {
  run(["run", "build", "--workspace=@workspace/vendi"]);
  run(["run", "build", "--workspace=@workspace/api-server"]);
} else {
  run(["--filter", "@workspace/vendi", "run", "build"]);
  run(["--filter", "@workspace/api-server", "run", "build"]);
}
console.log("[build-production] done");
