import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type ListingPackageTier = "s" | "m" | "l";

export const listingPackagePurchasesTable = pgTable("listing_package_purchases", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  package: text("package").notNull(),
  extra_slots: integer("extra_slots").notNull(),
  amount_cents: integer("amount_cents").notNull(),
  activation_code: text("activation_code").notNull().unique(),
  payment_token: text("payment_token").notNull().unique(),
  stripe_session_id: text("stripe_session_id"),
  status: text("status").notNull().default("pending"),
  purchased_at: timestamp("purchased_at"),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type ListingPackagePurchase = typeof listingPackagePurchasesTable.$inferSelect;
