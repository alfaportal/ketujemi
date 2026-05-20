-- Expiry reminder emails (3 days + 1 day before) — track sent timestamps
-- Run: psql "$DATABASE_URL" -f lib/db/sql/listings-expiry-reminders-migration.sql

ALTER TABLE listings ADD COLUMN IF NOT EXISTS expiry_reminder_3d_sent_at TIMESTAMP;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS expiry_reminder_1d_sent_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_listings_expiry_reminder_3d
  ON listings (expires_at)
  WHERE expiry_reminder_3d_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_listings_expiry_reminder_1d
  ON listings (expires_at)
  WHERE expiry_reminder_1d_sent_at IS NULL;
