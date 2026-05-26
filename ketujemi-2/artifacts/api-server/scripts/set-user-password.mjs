/**
 * Ops: set login password for an email account.
 * From ketujemi-2: pnpm --filter @workspace/api-server exec node ./scripts/set-user-password.mjs <email> <password>
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(root, ".env");

function parseEnvFile(filePath) {
  const out = {};
  if (!existsSync(filePath)) return out;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const email = (process.argv[2] ?? "").trim().toLowerCase();
const password = process.argv[3] ?? "";
if (!email || password.length < 6) {
  console.error("Usage: node scripts/set-user-password.mjs <email> <password>");
  process.exit(1);
}

let url = process.env.DATABASE_URL ?? parseEnvFile(envPath).DATABASE_URL ?? "";
url = url.replace(/[&?]channel_binding=[^&]*/gi, "");
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const pool = new pg.Pool({ connectionString: url });
try {
  const r = await pool.query(
    `UPDATE users SET password_hash = $1 WHERE lower(trim(email)) = $2 RETURNING id, email`,
    [hash, email],
  );
  if (r.rowCount === 0) {
    console.error("No user with that email.");
    process.exit(1);
  }
  console.log(`OK user id=${r.rows[0].id}`);
} finally {
  await pool.end();
}
