/**
 * Create core Drizzle schema tables on an empty Postgres DB (no TTY / no drizzle-kit).
 * Usage: DATABASE_URL=... node scripts/create-base-tables.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertValidDatabaseUrl, normalizeDatabaseUrl } from "./database-url.mjs";
import { resolveAppRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const requireDb = createRequire(path.join(appRoot, "lib", "db", "package.json"));
const { Pool } = requireDb("pg");

const rawUrl = process.env.DATABASE_URL?.trim();
if (!rawUrl) {
  console.error("[create-base-tables] DATABASE_URL is not set");
  process.exit(1);
}

let databaseUrl;
try {
  databaseUrl = assertValidDatabaseUrl(normalizeDatabaseUrl(rawUrl)).url;
} catch (err) {
  console.error("[create-base-tables]", err instanceof Error ? err.message : err);
  process.exit(1);
}

const appRootForStatements = resolveAppRoot();
const { BASE_TABLE_SQL_STATEMENTS } = await import(
  pathToFileURL(path.join(appRootForStatements, "lib", "db", "base-table-statements.mjs")).href
);

const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 30_000,
});

try {
  console.log("[create-base-tables] Creating core tables …");
  for (const sql of BASE_TABLE_SQL_STATEMENTS) {
    await pool.query(sql);
  }
  const { rows } = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log(`[create-base-tables] Done — ${rows.length} public table(s).`);
} catch (err) {
  console.error(
    "[create-base-tables] Failed:",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
} finally {
  await pool.end();
}
