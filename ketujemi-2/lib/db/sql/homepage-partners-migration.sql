-- Curated trusted partners for homepage strip (admin CRUD)
CREATE TABLE IF NOT EXISTS homepage_partners (
  id serial PRIMARY KEY,
  business_name text NOT NULL,
  logo_url text NOT NULL,
  link_url text NOT NULL DEFAULT '',
  tier text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS homepage_partners_tier_active_idx
  ON homepage_partners (tier, is_active, sort_order);
