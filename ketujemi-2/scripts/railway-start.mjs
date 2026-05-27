/**
 * When Railway Root Directory = ketujemi-2, delegate to repo-root start script
 * (DATABASE_URL normalize + SESSION_SECRET validation + start-production).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoStart = path.resolve(appRoot, "..", "scripts", "railway-start.mjs");

const result = spawnSync(process.execPath, [repoStart], {
  cwd: path.resolve(appRoot, ".."),
  env: process.env,
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
