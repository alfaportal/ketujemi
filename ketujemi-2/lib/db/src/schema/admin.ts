import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const listingReportsTable = pgTable("listing_reports", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id").notNull(),
  reason: text("reason").notNull(),
  reporter_name: text("reporter_name").notNull().default("Anonymous"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type ListingReport = typeof listingReportsTable.$inferSelect;

/** Audit trail when a listing row is removed (admin, owner, expiry job). */
export const listingDeletionLogTable = pgTable("listing_deletion_log", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id").notNull(),
  title: text("title").notNull(),
  category_id: integer("category_id"),
  price: text("price"),
  source: text("source").notNull(),
  deleted_at: timestamp("deleted_at").notNull().defaultNow(),
});

export type ListingDeletionLog = typeof listingDeletionLogTable.$inferSelect;

/** Moderation blocks before insert — logged for admin AI context. */
export const listingModerationRejectionsTable = pgTable("listing_moderation_rejections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  reason: text("reason").notNull(),
  category_id: integer("category_id"),
  user_id: integer("user_id"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type ListingModerationRejection = typeof listingModerationRejectionsTable.$inferSelect;

export const adminSettingsTable = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export type AdminSetting = typeof adminSettingsTable.$inferSelect;
