import type pg from "pg";

const FISCAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS fiscal_receipts (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  payment_token text NOT NULL,
  purpose text NOT NULL,
  amount_cents integer NOT NULL,
  receipt_type text NOT NULL DEFAULT 'fiscal_coupon',
  status text NOT NULL DEFAULT 'pending',
  fiscal_number text,
  qr_payload text,
  pdf_url text,
  provider text,
  provider_ref text,
  error_message text,
  customer_email text,
  issued_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS fiscal_receipts_payment_token_uidx
  ON fiscal_receipts (payment_token);

CREATE INDEX IF NOT EXISTS fiscal_receipts_user_id_idx
  ON fiscal_receipts (user_id, created_at DESC);
`;

export async function ensureFiscalSchema(pool: pg.Pool): Promise<void> {
  await pool.query(FISCAL_SCHEMA_SQL);

  const { rows } = await pool.query<{ ok: boolean }>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'fiscal_receipts'
    ) AS ok
  `);
  if (!rows[0]?.ok) {
    throw new Error("fiscal_receipts table missing after ensureFiscalSchema");
  }
}
