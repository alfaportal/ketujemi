import type pg from "pg";

const LISTING_SHOP_SCHEMA_SQL = `
ALTER TABLE listings ADD COLUMN IF NOT EXISTS shop_id integer REFERENCES shops (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS listings_shop_id_idx ON listings (shop_id)
  WHERE shop_id IS NOT NULL;

UPDATE listings l
SET shop_id = s.id
FROM shops s
WHERE l.user_id = s.user_id
  AND l.shop_id IS NULL
  AND s.is_active = true
  AND s.deleted_at IS NULL;
`;

export async function ensureListingShopSchema(pool: pg.Pool): Promise<void> {
  await pool.query(LISTING_SHOP_SCHEMA_SQL);
}
