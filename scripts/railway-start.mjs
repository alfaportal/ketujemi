import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertValidDatabaseUrl,
  databaseUrlHost,
  normalizeDatabaseUrl,
  resolveDatabaseUrlFromEnv,
} from "./database-url.mjs";
import { resolveAppRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const startScript = path.join(appRoot, "scripts", "start-production.mjs");

console.log("[railway-start] app root:", appRoot);
console.log("[railway-start] start script:", startScript);

function logDiagnostics() {
  const secret = process.env.SESSION_SECRET?.trim() ?? "";
  const rawDb = process.env.DATABASE_URL?.trim() ?? "";
  const normalized = rawDb ? normalizeDatabaseUrl(rawDb) : "";
  console.log("[railway-start] env:", {
    NODE_ENV: process.env.NODE_ENV ?? "(unset)",
    PORT: process.env.PORT ?? "(unset, start-production defaults to 8080)",
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT ?? "(unset)",
    DATABASE_URL_set: Boolean(rawDb),
    DATABASE_URL_host: normalized ? databaseUrlHost(normalized) : null,
    SESSION_SECRET_ok: secret.length >= 16,
  });
}

logDiagnostics();

try {
  const url = resolveDatabaseUrlFromEnv();
  if (!url) {
    console.error(
      "[railway-start] DATABASE_URL is not set. Add it in Railway → Variables (full Neon URL, ?sslmode=require only).",
    );
    process.exit(1);
  }
  const { host } = assertValidDatabaseUrl(url);
  console.log("[railway-start] DATABASE_URL host:", host);
} catch (err) {
  console.error("[railway-start]", err instanceof Error ? err.message : err);
  process.exit(1);
}

const sessionSecret = process.env.SESSION_SECRET?.trim() ?? "";
if (sessionSecret.length < 16) {
  console.error(
    "[railway-start] SESSION_SECRET must be at least 16 characters. Add it in Railway → Variables.",
  );
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
