import type pg from "pg";

const HOMEPAGE_PARTNERS_SQL = `
CREATE TABLE IF NOT EXISTS homepage_partners (
  id serial PRIMARY KEY,
  business_name text NOT NULL,
  logo_url text NOT NULL,
  link_url text NOT NULL,
  tier text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS homepage_partners_tier_active_idx
  ON homepage_partners (tier, is_active, sort_order);
`;

const HOMEPAGE_PARTNER_CATEGORIES_SQL = `
CREATE TABLE IF NOT EXISTS homepage_partner_categories (
  partner_id integer NOT NULL REFERENCES homepage_partners(id) ON DELETE CASCADE,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (partner_id, category_id)
);

CREATE INDEX IF NOT EXISTS homepage_partner_categories_category_idx
  ON homepage_partner_categories (category_id);
`;

export async function ensureHomepagePartnersSchema(pool: pg.Pool): Promise<void> {
  await pool.query(HOMEPAGE_PARTNERS_SQL);
  await pool.query(HOMEPAGE_PARTNER_CATEGORIES_SQL);

  const { rows } = await pool.query<{ ok: boolean }>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'homepage_partners'
    ) AS ok
  `);
  if (!rows[0]?.ok) {
    throw new Error("homepage_partners table missing after ensureHomepagePartnersSchema");
  }
}
