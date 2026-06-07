-- Track Facebook Page auto-posts (scheduled cron + immediate post on create).
ALTER TABLE listings ADD COLUMN IF NOT EXISTS fb_posted boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS listings_fb_posted_pending_idx ON listings (created_at)
  WHERE status = 'active' AND fb_posted = false;
