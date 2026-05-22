-- Partner payment automation + admin lifecycle fields
ALTER TABLE partners ADD COLUMN IF NOT EXISTS user_id integer;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payment_token text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_payment_at timestamp;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS rejected_reason text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS rejected_at timestamp;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS suspended_at timestamp;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS reminder_3_sent_at timestamp;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS reminder_7_sent_at timestamp;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS reminder_15_sent_at timestamp;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS reminder_30_sent_at timestamp;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'business_payments'
  ) THEN
    ALTER TABLE business_payments ADD COLUMN IF NOT EXISTS partner_id integer;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS partners_status_idx ON partners (status);
CREATE INDEX IF NOT EXISTS partners_payment_status_idx ON partners (payment_status, created_at);
CREATE INDEX IF NOT EXISTS partners_user_id_idx ON partners (user_id);
