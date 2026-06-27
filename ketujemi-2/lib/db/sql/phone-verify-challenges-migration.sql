-- SMS / Vonage phone verification challenges
-- pnpm --filter @workspace/db sql:run phone-verify-challenges-migration.sql

CREATE TABLE IF NOT EXISTS phone_verify_challenges (
  id serial PRIMARY KEY,
  phone_e164_digits text NOT NULL,
  request_id text NOT NULL,
  password_hash text,
  otp_code_hash text,
  fail_count integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS phone_verify_challenges_phone_idx
  ON phone_verify_challenges (phone_e164_digits, expires_at DESC);

CREATE INDEX IF NOT EXISTS phone_verify_challenges_request_id_idx
  ON phone_verify_challenges (request_id);
