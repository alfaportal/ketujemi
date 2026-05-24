/**
 * Run all lib/db/sql migrations in dependency order using DATABASE_URL from env only.
 *
 * Usage: DATABASE_URL=... node scripts/run-all-db-sql.mjs
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertValidDatabaseUrl,
  normalizeDatabaseUrl,
} from "./database-url.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptsDir, "..", "ketujemi-2");
const sqlDir = path.join(appRoot, "lib", "db", "sql");
const orderFile = path.join(sqlDir, "migration-order.json");
const require = createRequire(path.join(appRoot, "lib", "db", "package.json"));
const pg = require("pg");

const soft = process.argv.includes("--soft");
let databaseUrl;
let host;
try {
  ({ url: databaseUrl, host } = assertValidDatabaseUrl(
    normalizeDatabaseUrl(process.env.DATABASE_URL),
    { label: "[run-all-db-sql] DATABASE_URL" },
  ));
  process.env.DATABASE_URL = databaseUrl;
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(soft ? 0 : 1);
}

function migrationFiles() {
  if (existsSync(orderFile)) {
    const ordered = JSON.parse(readFileSync(orderFile, "utf8"));
    if (!Array.isArray(ordered)) throw new Error("migration-order.json must be an array");
    return ordered.filter((f) => typeof f === "string" && f.endsWith(".sql"));
  }
  return readdirSync(sqlDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

const files = migrationFiles();
console.log(`[run-all-db-sql] host ${host} — ${files.length} migration(s)\n`);

const pool = new pg.Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 30_000,
});

let failed = 0;

for (const name of files) {
  const sqlPath = path.join(sqlDir, name);
  if (!existsSync(sqlPath)) {
    console.error(`✗ ${name} — file not found`);
    failed++;
    continue;
  }

  const sql = readFileSync(sqlPath, "utf8");
  process.stdout.write(`→ ${name} … `);
  try {
    await pool.query(sql);
    console.log("OK");
  } catch (err) {
    failed++;
    console.log("FAILED");
    console.error(`  ${err instanceof Error ? err.message : err}`);
  }
}

try {
  const { rows: tables } = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log(`\n[run-all-db-sql] public tables (${tables.length}):`);
  for (const r of tables) console.log(`  - ${r.table_name}`);
} catch (err) {
  console.warn(
    `\n[run-all-db-sql] Could not list tables: ${err instanceof Error ? err.message : err}`,
  );
}

await pool.end();

if (failed > 0) {
  console.error(`\n[run-all-db-sql] ${failed} migration(s) failed.`);
  if (soft) {
    console.warn("[run-all-db-sql] --soft: continuing despite errors.");
    process.exit(0);
  }
  process.exit(1);
}

console.log("\n[run-all-db-sql] All migrations completed.");
