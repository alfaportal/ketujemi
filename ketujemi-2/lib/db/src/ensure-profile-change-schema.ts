import type pg from "pg";

const SQL = `
CREATE TABLE IF NOT EXISTS profile_change_challenges (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel text NOT NULL,
  phone_e164_digits text,
  email text,
  request_id text,
  code text,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_change_challenges_user_idx
  ON profile_change_challenges (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS profile_change_tokens (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  channel text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_change_tokens_user_idx
  ON profile_change_tokens (user_id, expires_at DESC);
`;

export async function ensureProfileChangeSchema(pool: pg.Pool): Promise<void> {
  await pool.query(SQL);
}
