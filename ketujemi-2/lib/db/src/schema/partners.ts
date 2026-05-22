import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** pending = registered unpaid; active = paid; suspended; rejected */
export type PartnerApplicationStatus = "pending" | "active" | "suspended" | "rejected";

export type PartnerPaymentStatus = "unpaid" | "pending" | "paid";

export type PartnerApplicationPackage = "standard" | "vip";

export const partnersTable = pgTable("partners", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  business_name: text("business_name").notNull(),
  contact_name: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  iban: text("iban").notNull(),
  /** standard (€30) | vip (€50) */
  package: text("package").notNull(),
  logo_url: text("logo_url"),
  link_url: text("link_url").notNull(),
  link_type: text("link_type"),
  status: text("status").notNull().default("pending"),
  payment_status: text("payment_status").notNull().default("unpaid"),
  payment_token: text("payment_token"),
  stripe_session_id: text("stripe_session_id"),
  last_payment_at: timestamp("last_payment_at"),
  rejected_reason: text("rejected_reason"),
  rejected_at: timestamp("rejected_at"),
  suspended_at: timestamp("suspended_at"),
  reminder_3_sent_at: timestamp("reminder_3_sent_at"),
  reminder_7_sent_at: timestamp("reminder_7_sent_at"),
  reminder_15_sent_at: timestamp("reminder_15_sent_at"),
  reminder_30_sent_at: timestamp("reminder_30_sent_at"),
  accepted_terms: boolean("accepted_terms").notNull().default(false),
  client_ip: text("client_ip"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type PartnerApplication = typeof partnersTable.$inferSelect;
