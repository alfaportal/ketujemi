import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Curated logos for «Partnerët tanë të besuar» on homepage (admin-managed). */
export const homepagePartnersTable = pgTable("homepage_partners", {
  id: serial("id").primaryKey(),
  business_name: text("business_name").notNull(),
  logo_url: text("logo_url").notNull(),
  link_url: text("link_url").notNull().default(""),
  address: text("address"),
  facebook_url: text("facebook_url"),
  instagram_url: text("instagram_url"),
  whatsapp_number: text("whatsapp_number"),
  tiktok_url: text("tiktok_url"),
  website_url: text("website_url"),
  /** vip | standard */
  tier: text("tier").notNull(),
  sort_order: integer("sort_order").notNull().default(0),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type HomepagePartner = typeof homepagePartnersTable.$inferSelect;
export type HomepagePartnerInsert = typeof homepagePartnersTable.$inferInsert;
