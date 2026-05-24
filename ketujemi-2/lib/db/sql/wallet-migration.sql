-- Wallet / credit balance for paid listings (€0.30 per post)
-- psql $DATABASE_URL -f lib/db/sql/wallet-migration.sql
-- Or: pnpm --filter @workspace/db sql:run wallet-migration.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS wallet_balance_cents integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type text NOT NULL,
  amount_cents integer NOT NULL,
  balance_after_cents integer NOT NULL,
  listing_id integer,
  payment_token text,
  note text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wallet_tx_user_id_idx ON wallet_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wallet_tx_payment_token_idx ON wallet_transactions (payment_token)
  WHERE payment_token IS NOT NULL;
