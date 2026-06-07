import type pg from "pg";

const SQL = `
CREATE TABLE IF NOT EXISTS shop_social_profile_enrichments (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  source_url TEXT,
  handle TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  follower_count INTEGER,
  profile_url TEXT,
  fetch_status TEXT NOT NULL DEFAULT 'pending',
  link_valid BOOLEAN NOT NULL DEFAULT FALSE,
  oauth_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_method TEXT,
  fetched_at TIMESTAMPTZ,
  next_fetch_at TIMESTAMPTZ,
  raw_json TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS shop_social_profile_shop_platform_idx
  ON shop_social_profile_enrichments (shop_id, platform);

CREATE INDEX IF NOT EXISTS shop_social_profile_next_fetch_idx
  ON shop_social_profile_enrichments (next_fetch_at)
  WHERE next_fetch_at IS NOT NULL;
`;

export async function ensureShopSocialProfileSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
