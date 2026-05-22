import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Stripe (or dev) payment records for business extra posts and VIP. */
export const businessPaymentsTable = pgTable("business_payments", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  user_id: integer("user_id").notNull(),
  partner_id: integer("partner_id"),
  purpose: text("purpose").notNull(),
  listing_id: integer("listing_id"),
  amount_cents: integer("amount_cents").notNull(),
  stripe_session_id: text("stripe_session_id"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  paid_at: timestamp("paid_at"),
  consumed_at: timestamp("consumed_at"),
});

export type BusinessPayment = typeof businessPaymentsTable.$inferSelect;
