-- Email sign-up verification challenges
CREATE TABLE IF NOT EXISTS email_verify_challenges (
  id serial PRIMARY KEY,
  email text NOT NULL,
  password_hash text NOT NULL,
  code text NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS email_verify_challenges_email_idx
  ON email_verify_challenges (email, expires_at DESC);
