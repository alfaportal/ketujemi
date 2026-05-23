-- Log listing deletions for admin AI daily report
CREATE TABLE IF NOT EXISTS listing_deletion_log (
  id serial PRIMARY KEY,
  listing_id integer NOT NULL,
  title text NOT NULL,
  category_id integer,
  price text,
  source text NOT NULL,
  deleted_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_deletion_log_deleted_at_idx ON listing_deletion_log (deleted_at DESC);
