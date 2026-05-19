import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Complaints against a seller (e.g. no response within 24h). */
export const sellerComplaintsTable = pgTable("seller_complaints", {
  id: serial("id").primaryKey(),
  /** User id of the reported seller (resolved from listing phone/email when possible). */
  seller_user_id: integer("seller_user_id"),
  listing_id: integer("listing_id"),
  complaint_type: text("complaint_type").notNull().default("no_response"),
  reason: text("reason"),
  reporter_contact: text("reporter_contact"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

/** Automated / manual violation log for strike escalation. */
export const userViolationsTable = pgTable("user_violations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  violation_code: text("violation_code").notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

/** Moderation flags on listings (duplicate, off-platform, AI, etc.). */
export const listingModerationFlagsTable = pgTable("listing_moderation_flags", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id").notNull(),
  flag_type: text("flag_type").notNull(),
  status: text("status").notNull().default("pending"),
  details: text("details"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type SellerComplaint = typeof sellerComplaintsTable.$inferSelect;
export type UserViolation = typeof userViolationsTable.$inferSelect;
export type ListingModerationFlag = typeof listingModerationFlagsTable.$inferSelect;
