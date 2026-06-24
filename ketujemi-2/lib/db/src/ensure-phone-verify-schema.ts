import type pg from "pg";

const SQL = `
ALTER TABLE phone_verify_challenges ADD COLUMN IF NOT EXISTS fail_count integer NOT NULL DEFAULT 0;
ALTER TABLE phone_verify_challenges ADD COLUMN IF NOT EXISTS otp_code_hash text;
`;

export async function ensurePhoneVerifySchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
