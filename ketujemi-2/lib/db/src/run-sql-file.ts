import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import pg from "pg";
import { normalizeDatabaseUrl } from "./normalize-database-url.js";

const dbDir = path.dirname(fileURLToPath(import.meta.url));
const ketujemi2Root = path.resolve(dbDir, "..", "..");

/** Railway / CI inject DATABASE_URL — never overwrite with a local .env file. */
function resolveDatabaseUrl(): string {
  const injected = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (injected) {
    return injected;
  }

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

const fileArg = process.argv[2] ?? "partner-activation-code-migration.sql";
const sqlPath = path.isAbsolute(fileArg)
  ? fileArg
  : path.join(dbDir, "..", "sql", fileArg);

const url = resolveDatabaseUrl();
if (!url) {
  console.error("DATABASE_URL is not set (env or ketujemi-2/.env)");
  process.exit(1);
}

if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
  console.error("DATABASE_URL must be a postgres:// or postgresql:// connection string");
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");
const pool = new pg.Pool({
  connectionString: url,
  connectionTimeoutMillis: 20_000,
});

async function main() {
  let host = "?";
  try {
    const normalized = url.replace(/^postgresql:/, "https:").replace(/^postgres:/, "https:");
    host = new URL(normalized).hostname;
  } catch {
    /* ignore */
  }
  console.log(`Running SQL: ${path.basename(sqlPath)} (host ${host})`);
  await pool.query(sql);
  const base = path.basename(sqlPath);
  if (base.includes("phone-verify")) {
    const { rows } = await pool.query<{ column_name: string }>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'phone_verify_challenges'
      ORDER BY ordinal_position
    `);
    console.log(
      "OK — phone_verify_challenges columns:",
      rows.map((r) => r.column_name).join(", ") || "(table missing)",
    );
  } else if (base.includes("wallet")) {
    const { rows } = await pool.query<{ kind: string; name: string }>(`
      SELECT 'column' AS kind, column_name AS name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'wallet_balance_cents'
      UNION ALL
      SELECT 'table', table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'wallet_transactions'
    `);
    console.log(
      "OK — wallet schema:",
      rows.map((r) => `${r.kind}:${r.name}`).join(", ") || "(missing)",
    );
  } else {
    const { rows } = await pool.query<{ column_name: string }>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name IN ('partner_activation_code', 'partner_activation_sent_at')
      ORDER BY column_name
    `);
    console.log("OK — columns present:", rows.map((r) => r.column_name).join(", ") || "(none)");
  }
}

main()
  .catch((err) => {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => pool.end());
