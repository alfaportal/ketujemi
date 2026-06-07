import type pg from "pg";

const USER_SOCIAL_CONNECTIONS_SQL = `
CREATE TABLE IF NOT EXISTS user_social_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  external_user_id TEXT NOT NULL,
  username TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_social_connections_user_platform_idx
  ON user_social_connections (user_id, platform);

CREATE INDEX IF NOT EXISTS user_social_connections_platform_idx
  ON user_social_connections (platform);
`;

export async function ensureUserSocialConnectionsSchema(pool: pg.Pool): Promise<void> {
  await pool.query(USER_SOCIAL_CONNECTIONS_SQL);
}
