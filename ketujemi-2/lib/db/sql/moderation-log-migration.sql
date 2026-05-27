-- Log AI moderation decisions (blocked/allowed)
CREATE TABLE IF NOT EXISTS moderation_log (
  id serial PRIMARY KEY,
  listing_id integer,
  reason text NOT NULL,
  action text NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS moderation_log_created_at_idx
  ON moderation_log (created_at DESC);
