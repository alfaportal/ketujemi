-- KetuJemi listings: TOP boost, status, moderation, repost sort
-- Run: psql "$DATABASE_URL" -f lib/db/sql/listings-top-repost-migration.sql

ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_top BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS top_until TIMESTAMP;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS top_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listed_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_reason TEXT;

UPDATE listings SET listed_at = created_at WHERE listed_at IS NULL;
UPDATE listings SET expires_at = created_at + INTERVAL '30 days' WHERE expires_at IS NULL;
UPDATE listings SET status = 'active' WHERE status IS NULL OR status = '';
UPDATE listings SET moderation_status = 'approved' WHERE moderation_status IS NULL OR moderation_status = '';

CREATE INDEX IF NOT EXISTS idx_listings_top_active ON listings (is_top, top_until DESC) WHERE is_top = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_listed_at ON listings (listed_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings (status);

ALTER TABLE business_payments ADD COLUMN IF NOT EXISTS listing_id INTEGER;
