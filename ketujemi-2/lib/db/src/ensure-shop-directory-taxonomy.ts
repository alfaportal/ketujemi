import type pg from "pg";

const TABLES_SQL = `
CREATE TABLE IF NOT EXISTS shop_directory_categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  emoji text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shop_directory_subcategories (
  id serial PRIMARY KEY,
  category_id integer NOT NULL REFERENCES shop_directory_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  UNIQUE (category_id, slug)
);

CREATE INDEX IF NOT EXISTS shop_directory_subcategories_category_idx ON shop_directory_subcategories (category_id);
`;

const FK_COLUMNS_SQL = `
ALTER TABLE shops ADD COLUMN IF NOT EXISTS directory_category_id integer REFERENCES shop_directory_categories(id);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS directory_subcategory_id integer REFERENCES shop_directory_subcategories(id);
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS directory_category_id integer REFERENCES shop_directory_categories(id);
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS directory_subcategory_id integer REFERENCES shop_directory_subcategories(id);
CREATE INDEX IF NOT EXISTS shops_directory_category_id_idx ON shops (directory_category_id, is_active);
`;

export type ShopDirectorySeedCategory = {
  slug: string;
  emoji: string;
  nameSq: string;
  imageUrl?: string;
  subcategories: { slug: string; nameSq: string }[];
};

const LEGACY_CATEGORY_SLUG: Record<string, string> = {
  "pune-sherbime": "biznes-sherbime",
  "turizem-udhetime": "turizem-udhetimet",
};

export async function ensureShopDirectoryTaxonomyTables(pool: pg.Pool): Promise<void> {
  await pool.query(TABLES_SQL);
  await pool.query(FK_COLUMNS_SQL);
}

async function backfillDirectoryIds(pool: pg.Pool): Promise<void> {
  for (const [oldSlug, newSlug] of Object.entries(LEGACY_CATEGORY_SLUG)) {
    await pool.query(`UPDATE shops SET directory_category_slug = $1 WHERE directory_category_slug = $2`, [
      newSlug,
      oldSlug,
    ]);
    await pool.query(
      `UPDATE shop_applications SET directory_category_slug = $1 WHERE directory_category_slug = $2`,
      [newSlug, oldSlug],
    );
  }

  await pool.query(`
    UPDATE shops s SET directory_category_id = c.id
    FROM shop_directory_categories c
    WHERE s.directory_category_slug = c.slug
      AND (s.directory_category_id IS NULL OR s.directory_category_id <> c.id)
  `);

  await pool.query(`
    UPDATE shops s SET directory_subcategory_id = sub.id
    FROM shop_directory_subcategories sub
    INNER JOIN shop_directory_categories c ON c.id = sub.category_id
    WHERE s.directory_category_slug = c.slug
      AND s.directory_subcategory_slug = sub.slug
      AND (s.directory_subcategory_id IS NULL OR s.directory_subcategory_id <> sub.id)
  `);

  await pool.query(`
    UPDATE shop_applications a SET directory_category_id = c.id
    FROM shop_directory_categories c
    WHERE a.directory_category_slug = c.slug
      AND (a.directory_category_id IS NULL OR a.directory_category_id <> c.id)
  `);

  await pool.query(`
    UPDATE shop_applications a SET directory_subcategory_id = sub.id
    FROM shop_directory_subcategories sub
    INNER JOIN shop_directory_categories c ON c.id = sub.category_id
    WHERE a.directory_category_slug = c.slug
      AND a.directory_subcategory_slug = sub.slug
      AND (a.directory_subcategory_id IS NULL OR a.directory_subcategory_id <> sub.id)
  `);
}

export async function seedShopDirectoryTaxonomy(
  pool: pg.Pool,
  categories: ShopDirectorySeedCategory[],
): Promise<void> {
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]!;
    const imageUrl = cat.imageUrl ?? null;
    const inserted = await pool.query<{ id: number }>(
      `INSERT INTO shop_directory_categories (name, emoji, slug, image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         emoji = EXCLUDED.emoji,
         image_url = COALESCE(EXCLUDED.image_url, shop_directory_categories.image_url),
         sort_order = EXCLUDED.sort_order
       RETURNING id`,
      [cat.nameSq, cat.emoji, cat.slug, imageUrl, i],
    );
    const categoryId = inserted.rows[0]?.id;
    if (!categoryId) continue;

    for (const sub of cat.subcategories) {
      await pool.query(
        `INSERT INTO shop_directory_subcategories (category_id, name, slug)
         VALUES ($1, $2, $3)
         ON CONFLICT (category_id, slug) DO UPDATE SET name = EXCLUDED.name`,
        [categoryId, sub.nameSq, sub.slug],
      );
    }
  }

  await backfillDirectoryIds(pool);
}

export async function ensureShopDirectoryTaxonomy(
  pool: pg.Pool,
  categories: ShopDirectorySeedCategory[],
): Promise<void> {
  await ensureShopDirectoryTaxonomyTables(pool);
  await seedShopDirectoryTaxonomy(pool, categories);
}
