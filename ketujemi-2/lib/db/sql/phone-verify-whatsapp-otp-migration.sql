-- WhatsApp OTP: store bcrypt hash locally (phone-otp.ts / whatsapp-otp.ts)
-- Safe to re-run (IF NOT EXISTS).

ALTER TABLE phone_verify_challenges
  ADD COLUMN IF NOT EXISTS fail_count integer NOT NULL DEFAULT 0;

ALTER TABLE phone_verify_challenges
  ADD COLUMN IF NOT EXISTS otp_code_hash text;
