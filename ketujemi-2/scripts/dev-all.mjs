/**
 * Starts API + web dev servers in parallel (`pnpm run dev:api`, `pnpm run dev:web`).
 * From repo root: `pnpm dev`
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const shell = process.platform === "win32";

function run(cmd, args) {
  return spawn(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell,
  });
}

const api = run("pnpm", ["run", "dev:api"]);
const web = run("pnpm", ["run", "dev:web"]);

function shutdown() {
  try {
    api.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  try {
    web.kill("SIGTERM");
  } catch {
    /* ignore */
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});
process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

api.on("exit", (code) => {
  if (code !== 0 && code !== null) shutdown();
});

web.on("exit", (code) => {
  if (code !== 0 && code !== null) shutdown();
});
