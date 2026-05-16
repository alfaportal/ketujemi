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

export const adminSettingsTable = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export type AdminSetting = typeof adminSettingsTable.$inferSelect;
