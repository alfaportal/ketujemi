import type pg from "pg";

/** OAuth columns on users — idempotent boot migration. */
const OAUTH_SCHEMA_SQL = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_user_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_user_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_username text;

CREATE UNIQUE INDEX IF NOT EXISTS users_facebook_user_id_uidx
  ON users (facebook_user_id) WHERE facebook_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_instagram_user_id_uidx
  ON users (instagram_user_id) WHERE instagram_user_id IS NOT NULL;
`;

export async function ensureOAuthSchema(pool: pg.Pool): Promise<void> {
  await pool.query(OAUTH_SCHEMA_SQL);

  const { rows } = await pool.query<{ ok: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'facebook_user_id'
    ) AS ok
  `);
  if (!rows[0]?.ok) {
    throw new Error("facebook_user_id column missing after ensureOAuthSchema");
  }
}
