import type pg from "pg";

const LISTING_USER_SCHEMA_SQL = `
ALTER TABLE listings ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings (user_id)
  WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS listing_self_duplicate_alerts (
  user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  listing_id integer NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
  notified_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS listing_scan_duplicate_alerts (
  user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kept_listing_id integer NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
  notified_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kept_listing_id)
);
`;

export async function ensureListingUserSchema(pool: pg.Pool): Promise<void> {
  await pool.query(LISTING_USER_SCHEMA_SQL);
}
