import type pg from "pg";

const SOCIAL_REEL_POSTS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS social_reel_posts (
  id SERIAL PRIMARY KEY,
  listing_ids INTEGER[] NOT NULL,
  video_url TEXT NOT NULL,
  video_public_id TEXT,
  caption TEXT,
  ig_media_id TEXT,
  tiktok_publish_id TEXT,
  ig_posted BOOLEAN NOT NULL DEFAULT FALSE,
  tiktok_posted BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS social_reel_posts_created_at_idx
  ON social_reel_posts (created_at DESC);
`;

export async function ensureSocialReelPostsSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SOCIAL_REEL_POSTS_SCHEMA_SQL);
}
