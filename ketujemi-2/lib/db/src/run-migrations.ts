import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import pg from "pg";
import { normalizeDatabaseUrl } from "./normalize-database-url.js";

const dbDir = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.join(dbDir, "..", "sql");
const ketujemi2Root = path.resolve(dbDir, "..", "..");

function resolveDatabaseUrl(): string {
  const injected = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (injected) return injected;

  const envCandidates = [
    path.join(ketujemi2Root, ".env"),
    path.resolve(ketujemi2Root, "..", ".env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
  ];

  for (const envPath of envCandidates) {
    if (!existsSync(envPath)) continue;
    loadEnv({ path: envPath });
    const loaded = normalizeDatabaseUrl(process.env.DATABASE_URL);
    if (loaded) return loaded;
  }

  return "";
}

function migrationFilesFromDoc(): string[] {
  const docPath = path.join(sqlDir, "MIGRATIONS.md");
  const doc = readFileSync(docPath, "utf8");
  const files: string[] = [];
  const re = /^\d+\.\s+`([^`]+\.sql)`/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(doc)) !== null) {
    files.push(match[1]);
  }
  if (files.length === 0) {
    throw new Error(`No migrations found in ${docPath}`);
  }
  return files;
}

const dryRun = process.argv.includes("--dry-run");
const onlyFile = process.argv.find((a) => a.endsWith(".sql"));

const url = resolveDatabaseUrl();
if (!url) {
  console.error("DATABASE_URL is not set (env or ketujemi-2/.env)");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  connectionTimeoutMillis: 20_000,
});

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function isApplied(filename: string): Promise<boolean> {
  const { rows } = await pool.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations WHERE filename = $1 LIMIT 1",
    [filename],
  );
  return rows.length > 0;
}

async function markApplied(filename: string): Promise<void> {
  await pool.query(
    "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
    [filename],
  );
}

async function runFile(filename: string): Promise<void> {
  const sqlPath = path.join(sqlDir, filename);
  if (!existsSync(sqlPath)) {
    throw new Error(`Missing migration file: ${sqlPath}`);
  }
  const sql = readFileSync(sqlPath, "utf8");
  if (dryRun) {
    console.log(`[dry-run] would apply ${filename}`);
    return;
  }
  console.log(`Applying ${filename}…`);
  await pool.query(sql);
  await markApplied(filename);
  console.log(`OK — ${filename}`);
}

async function main(): Promise<void> {
  await ensureMigrationsTable();
  const all = migrationFilesFromDoc();
  const queue = onlyFile ? [onlyFile] : all;

  let applied = 0;
  let skipped = 0;

  for (const filename of queue) {
    if (!onlyFile && (await isApplied(filename))) {
      skipped += 1;
      continue;
    }
    await runFile(filename);
    applied += 1;
  }

  console.log(
    `Migrations finished — applied: ${applied}, skipped (already applied): ${skipped}, total in doc: ${all.length}`,
  );
}

main()
  .catch((err) => {
    console.error("Migration failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => pool.end());
