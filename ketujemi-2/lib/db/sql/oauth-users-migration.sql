-- OAuth identity columns for Facebook / Instagram login

ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_user_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_user_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_username text;

CREATE UNIQUE INDEX IF NOT EXISTS users_facebook_user_id_uidx
  ON users (facebook_user_id) WHERE facebook_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_instagram_user_id_uidx
  ON users (instagram_user_id) WHERE instagram_user_id IS NOT NULL;
