/**
 * Run production API + static frontend on one port (default 8080).
 * Requires: node ./scripts/build-production.mjs and a valid `.env` at repo root.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");
const staticRoot = path.join(root, "artifacts/vendi/dist/public");
const apiEntry = path.join(root, "artifacts/api-server/dist/index.mjs");

if (!fs.existsSync(apiEntry)) {
  console.error("[start-production] Missing API build. Run: node ./scripts/build-production.mjs");
  process.exit(1);
}
const indexPath = path.join(staticRoot, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("[start-production] Missing frontend build. Run: node ./scripts/build-production.mjs");
  process.exit(1);
}
const indexHtml = fs.readFileSync(indexPath, "utf8");
if (indexHtml.includes('src="/src/main.tsx"') || !indexHtml.includes("/assets/")) {
  console.error(
    "[start-production] index.html is not a Vite production build (missing /assets/ bundle). Run: node ./scripts/build-production.mjs",
  );
  process.exit(1);
}

const port = process.env.PORT ?? process.env.API_PORT ?? "8080";
const onRailway =
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  Boolean(process.env.RAILWAY_PROJECT_ID) ||
  Boolean(process.env.RAILWAY_SERVICE_ID);

const env = {
  ...process.env,
  NODE_ENV: "production",
  STATIC_ROOT: staticRoot,
  PORT: port,
  API_PORT: port,
};

const args = ["--enable-source-maps", apiEntry];
// On Railway, never load ketujemi-2/.env — unquoted `&` in DATABASE_URL breaks Node --env-file
// and can truncate the URL (ENOTFOUND host "base"). Use platform Variables only.
if (fs.existsSync(envFile) && !onRailway && process.env.USE_ENV_FILE !== "0") {
  args.unshift("--env-file", envFile);
}

const child = spawn("node", args, {
  cwd: root,
  env,
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code) => process.exit(code ?? 0));
