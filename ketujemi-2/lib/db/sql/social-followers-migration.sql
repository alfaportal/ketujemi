-- Social followers tracking (Instagram / Facebook / TikTok)
-- Run: pnpm --filter @workspace/db sql:run social-followers-migration.sql

CREATE TABLE IF NOT EXISTS social_followers (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  follower_username TEXT NOT NULL,
  follower_id TEXT,
  followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unfollowed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS social_followers_platform_username_idx
  ON social_followers (platform, follower_username);

CREATE INDEX IF NOT EXISTS social_followers_platform_active_idx
  ON social_followers (platform, is_active);

CREATE INDEX IF NOT EXISTS social_followers_followed_at_idx
  ON social_followers (followed_at DESC);

CREATE INDEX IF NOT EXISTS social_followers_unfollowed_at_idx
  ON social_followers (unfollowed_at DESC)
  WHERE unfollowed_at IS NOT NULL;
