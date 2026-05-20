import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = process.platform === "win32";

const env = {
  ...process.env,
  NODE_ENV: "production",
  BASE_PATH: "/",
  NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=4096",
};

console.log("[railway-build] cwd:", root);

function run(args) {
  const result = spawnSync("pnpm", args, { cwd: root, env, stdio: "inherit", shell });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["install", "--no-frozen-lockfile"]);
run(["run", "build:production"]);
