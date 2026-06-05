-- Partner profile page fields (homepage curated + business users)
ALTER TABLE homepage_partners ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE homepage_partners ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE homepage_partners ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE homepage_partners ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE homepage_partners ADD COLUMN IF NOT EXISTS tiktok_url text;
ALTER TABLE homepage_partners ADD COLUMN IF NOT EXISTS website_url text;

ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_address text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_facebook_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_instagram_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_whatsapp_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_tiktok_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_website_url text;
