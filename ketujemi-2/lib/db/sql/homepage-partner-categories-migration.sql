-- Curated partner ↔ category visibility (admin checkbox list)
CREATE TABLE IF NOT EXISTS homepage_partner_categories (
  partner_id integer NOT NULL REFERENCES homepage_partners(id) ON DELETE CASCADE,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (partner_id, category_id)
);

CREATE INDEX IF NOT EXISTS homepage_partner_categories_category_idx
  ON homepage_partner_categories (category_id);
