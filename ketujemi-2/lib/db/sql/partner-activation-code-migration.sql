ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_activation_code text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_activation_sent_at timestamp;
