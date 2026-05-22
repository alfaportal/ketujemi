import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** `private` = individual seller; `business` = registered company account. */
export type AccountType = "private" | "business";

/** Business subscription tier (see BUSINESS_RULES.md). */
export type BusinessTier = "standard" | "vip";

/** Partner program lifecycle (business accounts). */
export type BusinessStatus = "pending" | "active" | "blocked";

export type PartnerLinkType = "website" | "instagram" | "facebook";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  /** E.164 digits only (no +), e.g. 38344901234 — matches Vonage numbering */
  phone_e164_digits: text("phone_e164_digits").unique(),
  password_hash: text("password_hash"),
  display_name: text("display_name"),
  /** Contact number shown on listings (may differ from login phone). */
  contact_phone: text("contact_phone"),
  profile_photo_url: text("profile_photo_url"),
  city: text("city"),
  about_me: text("about_me"),
  email_verified_at: timestamp("email_verified_at"),
  /** private | business — business accounts follow separate posting rules. */
  account_type: text("account_type").notNull().default("private"),
  business_name: text("business_name"),
  /** Logo shown in «Partnerët tanë të besuar» when VIP is active (falls back to profile_photo_url). */
  partner_logo_url: text("partner_logo_url"),
  business_tier: text("business_tier"),
  /** pending until admin activates; blocked hides partner strip and posting. */
  business_status: text("business_status"),
  /** Single outbound link (website / Instagram / Facebook) after activation. */
  partner_link_url: text("partner_link_url"),
  partner_link_type: text("partner_link_type"),
  /** JSON string array — up to 5 banner image URLs for VIP carousel. */
  partner_banner_urls: text("partner_banner_urls"),
  /** Sent to business email when admin activates partner account. */
  partner_activation_code: text("partner_activation_code"),
  partner_activation_sent_at: timestamp("partner_activation_sent_at"),
  vip_expires_at: timestamp("vip_expires_at"),
  /** Temporary suspension (30-day strike); permanent ban uses banned_at. */
  suspended_until: timestamp("suspended_until"),
  strike_count: integer("strike_count").notNull().default(0),
  banned_at: timestamp("banned_at"),
  ban_reason: text("ban_reason"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
