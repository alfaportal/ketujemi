-- Business payments (Stripe extra post / VIP)
-- psql $DATABASE_URL -f lib/db/sql/business-payments-migration.sql

CREATE TABLE IF NOT EXISTS business_payments (
  id serial PRIMARY KEY,
  token text NOT NULL UNIQUE,
  user_id integer NOT NULL,
  purpose text NOT NULL,
  amount_cents integer NOT NULL,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now(),
  paid_at timestamp,
  consumed_at timestamp
);

CREATE INDEX IF NOT EXISTS business_payments_user_id_idx ON business_payments (user_id);
CREATE INDEX IF NOT EXISTS business_payments_status_idx ON business_payments (status);
