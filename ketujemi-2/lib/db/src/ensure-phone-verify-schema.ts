import type pg from "pg";

const SQL = `
ALTER TABLE phone_verify_challenges ADD COLUMN IF NOT EXISTS fail_count integer NOT NULL DEFAULT 0;
`;

export async function ensurePhoneVerifySchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
