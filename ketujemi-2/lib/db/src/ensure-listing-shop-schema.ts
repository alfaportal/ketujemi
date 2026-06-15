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

UPDATE listings l
SET shop_id = s.id
FROM shops s
JOIN users u ON u.id = l.user_id
WHERE l.shop_id IS NULL
  AND s.is_active = true
  AND s.deleted_at IS NULL
  AND lower(trim(u.email)) = lower(trim(s.email))
  AND trim(u.email) <> '';

UPDATE listings l
SET shop_id = s.id
FROM shops s
WHERE l.shop_id IS NULL
  AND s.is_active = true
  AND s.deleted_at IS NULL
  AND RIGHT(regexp_replace(l.seller_phone, '\\D', '', 'g'), 8) = RIGHT(regexp_replace(s.phone, '\\D', '', 'g'), 8)
  AND length(regexp_replace(l.seller_phone, '\\D', '', 'g')) >= 8;
`;

export async function ensureListingShopSchema(pool: pg.Pool): Promise<void> {
  await pool.query(LISTING_SHOP_SCHEMA_SQL);
}
