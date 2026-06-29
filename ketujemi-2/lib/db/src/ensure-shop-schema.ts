import type pg from "pg";

const SHOP_APPLICATIONS_SQL = `
CREATE TABLE IF NOT EXISTS shop_applications (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id),
  shop_name text NOT NULL,
  logo_url text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  category_id integer,
  country text NOT NULL,
  city text NOT NULL,
  region text NOT NULL,
  address text NOT NULL,
  facebook text,
  instagram text,
  tiktok text,
  whatsapp text,
  website text,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  shop_id integer,
  rejected_reason text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shop_applications_status_idx ON shop_applications (status, created_at DESC);
CREATE INDEX IF NOT EXISTS shop_applications_user_idx ON shop_applications (user_id);
`;

const SHOPS_SQL = `
CREATE TABLE IF NOT EXISTS shops (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id),
  application_id integer,
  shop_name text NOT NULL,
  logo_url text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  category_id integer,
  country text NOT NULL,
  city text NOT NULL,
  region text NOT NULL,
  address text NOT NULL,
  facebook text,
  instagram text,
  tiktok text,
  whatsapp text,
  website text,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shops_user_idx ON shops (user_id);
CREATE INDEX IF NOT EXISTS shops_active_idx ON shops (is_active, created_at DESC);
`;

const DIRECTORY_COLUMNS_SQL = `
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS directory_category_slug text;
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS directory_subcategory_slug text;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS directory_category_slug text;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS directory_subcategory_slug text;
CREATE INDEX IF NOT EXISTS shops_directory_category_idx ON shops (directory_category_slug, is_active);
CREATE INDEX IF NOT EXISTS shops_directory_city_idx ON shops (city, country);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS pwa_installs integer NOT NULL DEFAULT 0;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS deleted_at timestamp;
`;

/** FK columns need shop_directory_* tables — applied via ensureShopDirectoryTaxonomyTables on boot. */
const DIRECTORY_FK_COLUMNS_SQL = `
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS directory_category_id integer;
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS directory_subcategory_id integer;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS directory_category_id integer;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS directory_subcategory_id integer;
`;

const SHOP_RATINGS_SQL = `
CREATE TABLE IF NOT EXISTS shop_ratings (
  id serial PRIMARY KEY,
  shop_id integer NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS shop_ratings_shop_user_idx ON shop_ratings (shop_id, user_id);
CREATE INDEX IF NOT EXISTS shop_ratings_shop_idx ON shop_ratings (shop_id, created_at DESC);
`;

export async function ensureShopSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SHOP_APPLICATIONS_SQL);
  await pool.query(SHOPS_SQL);
  await pool.query(DIRECTORY_COLUMNS_SQL);
  await pool.query(DIRECTORY_FK_COLUMNS_SQL);
  await pool.query(SHOP_RATINGS_SQL);
}
