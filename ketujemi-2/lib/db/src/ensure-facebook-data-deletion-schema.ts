import type pg from "pg";

const SQL = `
CREATE TABLE IF NOT EXISTS facebook_data_deletion_requests (
  id SERIAL PRIMARY KEY,
  confirmation_code TEXT NOT NULL UNIQUE,
  facebook_user_id TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS facebook_data_deletion_requests_facebook_user_id_idx
  ON facebook_data_deletion_requests (facebook_user_id);

CREATE INDEX IF NOT EXISTS facebook_data_deletion_requests_created_at_idx
  ON facebook_data_deletion_requests (created_at DESC);
`;

export async function ensureFacebookDataDeletionSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
