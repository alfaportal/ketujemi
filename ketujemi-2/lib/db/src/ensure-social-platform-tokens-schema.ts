import type pg from "pg";

const SOCIAL_PLATFORM_TOKENS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS social_platform_tokens (
  token_key TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  meta JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export async function ensureSocialPlatformTokensSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SOCIAL_PLATFORM_TOKENS_SCHEMA_SQL);
}
