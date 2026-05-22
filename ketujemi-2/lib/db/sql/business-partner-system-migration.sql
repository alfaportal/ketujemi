-- Business partner program: admin activation, external link, VIP carousel
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_status text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_link_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_link_type text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_banner_urls text;

COMMENT ON COLUMN users.business_status IS 'pending | active | blocked — business partner accounts only';
COMMENT ON COLUMN users.partner_link_type IS 'website | instagram | facebook';
COMMENT ON COLUMN users.partner_banner_urls IS 'JSON array of up to 5 image URLs (VIP carousel)';
