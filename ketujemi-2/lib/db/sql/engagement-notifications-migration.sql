ALTER TABLE users ADD COLUMN IF NOT EXISTS first_listing_posted boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_follow_notif_sent boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_follow_notif_preference text NOT NULL DEFAULT 'pending';

ALTER TABLE listings ADD COLUMN IF NOT EXISTS first_external_view_notified boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS user_notifications (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload text,
  read_at timestamp,
  requires_action boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_notifications_user_created_idx
  ON user_notifications (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_fcm_tokens_user_idx ON user_fcm_tokens (user_id);
