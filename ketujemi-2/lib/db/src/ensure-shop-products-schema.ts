import type pg from "pg";

const SHOP_PRODUCTS_SQL = `
CREATE TABLE IF NOT EXISTS shop_products (
  id serial PRIMARY KEY,
  shop_id integer NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  listing_id integer REFERENCES listings(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  compare_at_price numeric(10, 2),
  category_id integer NOT NULL REFERENCES categories(id),
  image_url text,
  sku text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shop_products_shop_idx ON shop_products (shop_id, sort_order, id);
CREATE INDEX IF NOT EXISTS shop_products_listing_idx ON shop_products (listing_id)
  WHERE listing_id IS NOT NULL;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS shop_product_id integer REFERENCES shop_products(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS listings_shop_product_id_uidx ON listings (shop_product_id)
  WHERE shop_product_id IS NOT NULL;

ALTER TABLE shops ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS shops_slug_uidx ON shops (slug) WHERE slug IS NOT NULL AND TRIM(slug) <> '';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS youtube text;
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS youtube text;
`;

export async function ensureShopProductsSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SHOP_PRODUCTS_SQL);
}
