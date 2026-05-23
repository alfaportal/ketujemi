-- Log listing moderation rejections (never inserted into listings)
CREATE TABLE IF NOT EXISTS listing_moderation_rejections (
  id serial PRIMARY KEY,
  title text NOT NULL,
  reason text NOT NULL,
  category_id integer,
  user_id integer,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_moderation_rejections_created_at_idx
  ON listing_moderation_rejections (created_at DESC);
