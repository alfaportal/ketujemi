-- Trusted partners: logo URL for VIP business slots on home / category hubs
-- Run: psql "$DATABASE_URL" -f lib/db/sql/users-partner-logo-migration.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_logo_url TEXT;
