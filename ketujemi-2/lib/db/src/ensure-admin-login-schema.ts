import type pg from "pg";

const SQL = `
CREATE TABLE IF NOT EXISTS admin_login_challenges (
  id serial PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_login_challenges_email_idx
  ON admin_login_challenges (email, expires_at DESC);
`;

export async function ensureAdminLoginSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
