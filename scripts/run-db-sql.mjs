/**
 * Run a lib/db/sql/*.sql file using DATABASE_URL from the environment only.
 * Does not read .env files (safe for Railway preDeploy).
 *
 * Usage: DATABASE_URL=... node scripts/run-db-sql.mjs wallet-migration.sql
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptsDir, "..", "ketujemi-2");
const require = createRequire(path.join(appRoot, "lib", "db", "package.json"));
const pg = require("pg");
const sqlName = process.argv[2];

if (!sqlName?.trim()) {
  console.error("Usage: node scripts/run-db-sql.mjs <migration.sql>");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("[run-db-sql] DATABASE_URL is not set in the environment.");
  process.exit(1);
}

if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
  console.error("[run-db-sql] DATABASE_URL must be a postgres:// or postgresql:// URL.");
  process.exit(1);
}

const sqlPath = path.join(appRoot, "lib", "db", "sql", sqlName);
if (!existsSync(sqlPath)) {
  console.error("[run-db-sql] SQL file not found:", sqlPath);
  process.exit(1);
}

let host = "(unknown)";
try {
  const normalized = databaseUrl.replace(/^postgresql:/, "https:").replace(/^postgres:/, "https:");
  host = new URL(normalized).hostname;
} catch {
  console.error("[run-db-sql] DATABASE_URL is not a valid URL.");
  process.exit(1);
}

console.log(`[run-db-sql] Running ${sqlName} → host ${host}`);

const pool = new pg.Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 20_000,
});

const sql = readFileSync(sqlPath, "utf8");

try {
  await pool.query(sql);

  if (sqlName.includes("wallet")) {
    const { rows } = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
        AND column_name = 'wallet_balance_cents'
    `);
    console.log(
      "OK — wallet:",
      rows.length ? "wallet_balance_cents present" : "wallet_balance_cents MISSING",
    );
  } else if (sqlName.includes("phone-verify")) {
    const { rows } = await pool.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'phone_verify_challenges'
    `);
    console.log("OK — phone_verify_challenges:", rows.length ? "exists" : "MISSING");
  } else {
    console.log("OK —", sqlName);
  }
} catch (err) {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await pool.end();
}

if (process.exitCode) process.exit(process.exitCode);
