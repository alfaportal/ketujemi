-- Partner logo analytics (views / clicks per calendar month)
CREATE TABLE IF NOT EXISTS partner_logo_stats (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

CREATE INDEX IF NOT EXISTS partner_logo_stats_month_idx ON partner_logo_stats (month);
