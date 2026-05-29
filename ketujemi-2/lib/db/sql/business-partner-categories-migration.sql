-- Admin-assigned categories for business partner accounts (user_id)
CREATE TABLE IF NOT EXISTS business_partner_categories (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS business_partner_categories_category_idx
  ON business_partner_categories (category_id);
