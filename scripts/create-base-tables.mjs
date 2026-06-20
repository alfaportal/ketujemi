/**
 * Create core Drizzle schema tables on an empty Postgres DB (no TTY / no drizzle-kit).
 * Usage: DATABASE_URL=... node scripts/create-base-tables.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidDatabaseUrl, normalizeDatabaseUrl } from "./database-url.mjs";
import { resolveAppRoot } from "./resolve-app-root.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = resolveAppRoot();
const requireDb = createRequire(path.join(appRoot, "lib", "db", "package.json"));
const { Pool } = requireDb("pg");

const rawUrl = process.env.DATABASE_URL?.trim();
if (!rawUrl) {
  console.error("[create-base-tables] DATABASE_URL is not set");
  process.exit(1);
}

let databaseUrl;
try {
  databaseUrl = assertValidDatabaseUrl(normalizeDatabaseUrl(rawUrl)).url;
} catch (err) {
  console.error("[create-base-tables]", err instanceof Error ? err.message : err);
  process.exit(1);
}

/** Ordered CREATE TABLE IF NOT EXISTS — matches lib/db drizzle schema (drizzle.config.ts). */
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    icon TEXT NOT NULL,
    parent_id INTEGER,
    image_url TEXT,
    free_listing_limit INTEGER NOT NULL DEFAULT 10
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    phone_e164_digits TEXT UNIQUE,
    password_hash TEXT,
    display_name TEXT,
    contact_phone TEXT,
    profile_photo_url TEXT,
    city TEXT,
    about_me TEXT,
    email_verified_at TIMESTAMP,
    identity_verified BOOLEAN NOT NULL DEFAULT FALSE,
    identity_verified_via TEXT,
    account_type TEXT NOT NULL DEFAULT 'private',
    business_name TEXT,
    partner_logo_url TEXT,
    business_tier TEXT,
    business_status TEXT,
    partner_link_url TEXT,
    partner_link_type TEXT,
    partner_address TEXT,
    partner_facebook_url TEXT,
    partner_instagram_url TEXT,
    partner_whatsapp_number TEXT,
    partner_tiktok_url TEXT,
    partner_website_url TEXT,
    facebook_user_id TEXT UNIQUE,
    google_user_id TEXT UNIQUE,
    instagram_user_id TEXT UNIQUE,
    tiktok_user_id TEXT UNIQUE,
    instagram_username TEXT,
    partner_banner_urls TEXT,
    partner_activation_code TEXT,
    partner_activation_sent_at TIMESTAMP,
    vip_expires_at TIMESTAMP,
    suspended_until TIMESTAMP,
    strike_count INTEGER NOT NULL DEFAULT 0,
    banned_at TIMESTAMP,
    ban_reason TEXT,
    wallet_balance_cents INTEGER NOT NULL DEFAULT 0,
    first_listing_posted BOOLEAN NOT NULL DEFAULT FALSE,
    social_follow_notif_sent BOOLEAN NOT NULL DEFAULT FALSE,
    social_follow_notif_preference TEXT NOT NULL DEFAULT 'pending',
    marketing_email_opt_out BOOLEAN NOT NULL DEFAULT FALSE,
    last_active_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS car_models (
    id SERIAL PRIMARY KEY,
    brand_slug TEXT NOT NULL,
    name TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS car_models_brand_slug_name ON car_models (brand_slug, name)`,
  `CREATE TABLE IF NOT EXISTS truck_models (
    id SERIAL PRIMARY KEY,
    brand_slug TEXT NOT NULL,
    name TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS truck_models_brand_slug_name ON truck_models (brand_slug, name)`,
  `CREATE TABLE IF NOT EXISTS motor_models (
    id SERIAL PRIMARY KEY,
    brand_slug TEXT NOT NULL,
    name TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS motor_models_brand_slug_name ON motor_models (brand_slug, name)`,
  `CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    shop_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category_id INTEGER NOT NULL,
    location TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    seller_phone TEXT NOT NULL,
    condition TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    first_external_view_notified BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_top BOOLEAN NOT NULL DEFAULT FALSE,
    top_until TIMESTAMP,
    top_count INTEGER NOT NULL DEFAULT 0,
    listed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active',
    fb_posted BOOLEAN NOT NULL DEFAULT FALSE,
    ig_posted BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_status TEXT NOT NULL DEFAULT 'approved',
    moderation_reason TEXT,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    expiry_reminder_3d_sent_at TIMESTAMP,
    expiry_reminder_1d_sent_at TIMESTAMP,
    vehicle_year INTEGER,
    vehicle_mileage_km INTEGER,
    vehicle_fuel TEXT,
    vehicle_body_type TEXT,
    vehicle_model TEXT,
    truck_type_slug TEXT,
    truck_axle_config TEXT,
    truck_gvw_band TEXT,
    truck_euro_standard TEXT,
    property_txn TEXT,
    property_subtype TEXT,
    property_sqm INTEGER,
    property_floor TEXT,
    motor_type_slug TEXT,
    motor_cc_band TEXT,
    motor_power_kw INTEGER,
    motor_transmission TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS listing_reports (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reporter_name TEXT NOT NULL DEFAULT 'Anonymous',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS listing_deletion_log (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category_id INTEGER,
    price TEXT,
    source TEXT NOT NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS listing_moderation_rejections (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    reason TEXT NOT NULL,
    category_id INTEGER,
    user_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS phone_verify_challenges (
    id SERIAL PRIMARY KEY,
    phone_e164_digits TEXT NOT NULL,
    request_id TEXT NOT NULL,
    password_hash TEXT,
    fail_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS email_verify_challenges (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    code TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS seller_complaints (
    id SERIAL PRIMARY KEY,
    seller_user_id INTEGER,
    listing_id INTEGER,
    complaint_type TEXT NOT NULL DEFAULT 'no_response',
    reason TEXT,
    reporter_contact TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS user_violations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    violation_code TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS listing_moderation_flags (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL,
    flag_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS business_payments (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    partner_id INTEGER,
    purpose TEXT NOT NULL,
    listing_id INTEGER,
    amount_cents INTEGER NOT NULL,
    stripe_session_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMP,
    consumed_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    iban TEXT NOT NULL,
    package TEXT NOT NULL,
    logo_url TEXT,
    link_url TEXT NOT NULL,
    link_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    payment_token TEXT,
    stripe_session_id TEXT,
    last_payment_at TIMESTAMP,
    rejected_reason TEXT,
    rejected_at TIMESTAMP,
    suspended_at TIMESTAMP,
    reminder_3_sent_at TIMESTAMP,
    reminder_7_sent_at TIMESTAMP,
    reminder_15_sent_at TIMESTAMP,
    reminder_30_sent_at TIMESTAMP,
    accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
    client_ip TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS listing_package_purchases (
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
  )`,
  `CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    balance_after_cents INTEGER NOT NULL,
    listing_id INTEGER,
    payment_token TEXT,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS fiscal_receipts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_token TEXT NOT NULL,
    purpose TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    receipt_type TEXT NOT NULL DEFAULT 'fiscal_coupon',
    status TEXT NOT NULL DEFAULT 'pending',
    fiscal_number TEXT,
    qr_payload TEXT,
    pdf_url TEXT,
    provider TEXT,
    provider_ref TEXT,
    error_message TEXT,
    customer_email TEXT,
    issued_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
];

const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 30_000,
});

try {
  console.log("[create-base-tables] Creating core tables …");
  for (const sql of STATEMENTS) {
    await pool.query(sql);
  }
  const { rows } = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log(`[create-base-tables] Done — ${rows.length} public table(s).`);
} catch (err) {
  console.error(
    "[create-base-tables] Failed:",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
} finally {
  await pool.end();
}
