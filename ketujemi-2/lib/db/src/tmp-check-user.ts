import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(root, ".env");

function parseEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
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
if (!email) {
  console.error("Usage: pnpm exec tsx ./src/tmp-check-user.ts <email>");
  process.exit(1);
}

let url = process.env.DATABASE_URL ?? parseEnvFile(envPath).DATABASE_URL ?? "";
url = url.replace(/[&?]channel_binding=[^&]*/gi, "");
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });
try {
  const u = await pool.query(
    `SELECT id, email,
            (password_hash IS NOT NULL) AS has_password,
            email_verified_at,
            phone_e164_digits,
            (facebook_user_id IS NOT NULL) AS has_facebook,
            (instagram_user_id IS NOT NULL) AS has_instagram,
            banned_at IS NOT NULL AS is_banned,
            suspended_until,
            created_at
     FROM users WHERE lower(trim(email)) = $1`,
    [email],
  );
  const ch = await pool.query(
    `SELECT id, expires_at > NOW() AS active, created_at
     FROM email_verify_challenges WHERE lower(trim(email)) = $1
     ORDER BY created_at DESC LIMIT 3`,
    [email],
  );
  console.log(
    JSON.stringify(
      { email, user: u.rows[0] ?? null, pendingEmailChallenges: ch.rows },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
