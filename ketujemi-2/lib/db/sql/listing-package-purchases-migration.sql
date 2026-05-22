CREATE TABLE IF NOT EXISTS listing_package_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  package TEXT NOT NULL,
  extra_slots INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  activation_code TEXT NOT NULL UNIQUE,
  payment_token TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listing_pkg_user_active_idx
  ON listing_package_purchases (user_id, status, expires_at DESC);
CREATE INDEX IF NOT EXISTS listing_pkg_code_idx ON listing_package_purchases (activation_code);
CREATE INDEX IF NOT EXISTS listing_pkg_purchased_at_idx ON listing_package_purchases (purchased_at DESC);
