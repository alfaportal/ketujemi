import type pg from "pg";

const SQL = `
CREATE TABLE IF NOT EXISTS deletion_feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'shop')),
  shop_id INTEGER REFERENCES shops(id),
  reason TEXT NOT NULL,
  custom_text TEXT,
  additional_feedback TEXT,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deletion_feedback_deleted_at_idx
  ON deletion_feedback (deleted_at DESC);

CREATE INDEX IF NOT EXISTS deletion_feedback_reason_idx
  ON deletion_feedback (reason);

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE shops ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
`;

export async function ensureDeletionFeedbackSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
