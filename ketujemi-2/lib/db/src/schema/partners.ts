import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Public partner program applications (pending until admin activates a user account). */
export type PartnerApplicationStatus = "pending" | "approved" | "rejected";

export type PartnerApplicationPackage = "standard" | "vip";

export const partnersTable = pgTable("partners", {
  id: serial("id").primaryKey(),
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
  accepted_terms: boolean("accepted_terms").notNull().default(false),
  client_ip: text("client_ip"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type PartnerApplication = typeof partnersTable.$inferSelect;
