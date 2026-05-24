import type pg from "pg";

/** Idempotent wallet schema — safe to run on every API boot (uses Railway DATABASE_URL). */
const WALLET_SCHEMA_SQL = `
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
`;

export async function ensureWalletSchema(pool: pg.Pool): Promise<void> {
  await pool.query(WALLET_SCHEMA_SQL);

  const { rows } = await pool.query<{ ok: boolean }>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'wallet_balance_cents'
    ) AS ok
  `);
  if (!rows[0]?.ok) {
    throw new Error("wallet_balance_cents column missing after ensureWalletSchema");
  }
}
