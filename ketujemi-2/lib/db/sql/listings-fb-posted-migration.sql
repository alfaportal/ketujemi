-- Track Facebook + Instagram auto-posts (separate scheduled runs).
ALTER TABLE listings ADD COLUMN IF NOT EXISTS fb_posted boolean NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS ig_posted boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS listings_fb_posted_pending_idx ON listings (created_at)
  WHERE status = 'active' AND fb_posted = false;

CREATE INDEX IF NOT EXISTS listings_ig_posted_pending_idx ON listings (created_at)
  WHERE status = 'active' AND fb_posted = true AND ig_posted = false;
