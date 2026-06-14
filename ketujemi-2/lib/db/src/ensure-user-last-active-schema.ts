import type pg from "pg";

const SQL = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at timestamp;
`;

export async function ensureUserLastActiveSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
