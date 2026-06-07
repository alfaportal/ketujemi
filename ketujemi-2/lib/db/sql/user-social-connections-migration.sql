-- Verified OAuth platforms per registered user (instagram / facebook / tiktok only)
-- Run: pnpm --filter @workspace/db sql:run user-social-connections-migration.sql

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
