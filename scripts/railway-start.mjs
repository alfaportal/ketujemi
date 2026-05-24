import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveDatabaseUrlFromEnv } from "./database-url.mjs";
import { resolveAppRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const startScript = path.join(appRoot, "scripts", "start-production.mjs");

console.log("[railway-start] app root:", appRoot);

try {
  const url = resolveDatabaseUrlFromEnv();
  if (url) {
    const host = new URL(
      url.replace(/^postgresql:/, "https:").replace(/^postgres:/, "https:"),
    ).hostname;
    console.log("[railway-start] DATABASE_URL host:", host);
  }
} catch (err) {
  console.error("[railway-start]", err instanceof Error ? err.message : err);
  process.exit(1);
}

/** Direct node start — avoids pnpm/node_modules lookup issues at runtime. */
const result = spawnSync(process.execPath, [startScript], {
  cwd: appRoot,
  env: process.env,
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
