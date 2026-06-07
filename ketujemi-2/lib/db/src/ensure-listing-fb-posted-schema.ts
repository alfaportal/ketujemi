import type pg from "pg";

const LISTING_FB_POSTED_SCHEMA_SQL = `
ALTER TABLE listings ADD COLUMN IF NOT EXISTS fb_posted boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS listings_fb_posted_pending_idx ON listings (created_at)
  WHERE status = 'active' AND fb_posted = false;
`;

export async function ensureListingFbPostedSchema(pool: pg.Pool): Promise<void> {
  await pool.query(LISTING_FB_POSTED_SCHEMA_SQL);
}
