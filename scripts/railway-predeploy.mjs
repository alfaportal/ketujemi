import { spawnSync } from "node:child_process";
import { resolveAppRoot } from "./resolve-app-root.mjs";

const root = resolveAppRoot();
const shell = process.platform === "win32";

console.log("[railway-predeploy] app root:", root);

const result = spawnSync("pnpm", ["run", "db:push"], {
  cwd: root,
  stdio: "inherit",
  shell,
});

if (result.status !== 0) process.exit(result.status ?? 1);
