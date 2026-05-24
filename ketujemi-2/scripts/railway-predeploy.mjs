/**
 * When Railway Root Directory = ketujemi-2, delegate to repo-root preDeploy script.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoPredeploy = path.resolve(appRoot, "..", "scripts", "railway-predeploy.mjs");

const result = spawnSync(process.execPath, [repoPredeploy], {
  cwd: path.resolve(appRoot, ".."),
  env: process.env,
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
