-- KetuJemi — Business rules schema (run once on production DB)
-- psql $DATABASE_URL -f lib/db/sql/business-rules-migration.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'private';
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_tier text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_expires_at timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_until timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strike_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS seller_complaints (
  id serial PRIMARY KEY,
  seller_user_id integer,
  listing_id integer,
  complaint_type text NOT NULL DEFAULT 'no_response',
  reason text,
  reporter_contact text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_violations (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  violation_code text NOT NULL,
  notes text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listing_moderation_flags (
  id serial PRIMARY KEY,
  listing_id integer NOT NULL,
  flag_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  details text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_complaints_user ON seller_complaints (seller_user_id);
CREATE INDEX IF NOT EXISTS idx_user_violations_user ON user_violations (user_id);
CREATE INDEX IF NOT EXISTS idx_listing_flags_listing ON listing_moderation_flags (listing_id);
