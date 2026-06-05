import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export type ShopApplicationStatus = "pending" | "approved" | "rejected";

export const shopApplicationsTable = pgTable("shop_applications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  shop_name: text("shop_name").notNull(),
  logo_url: text("logo_url").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  category_id: integer("category_id"),
  country: text("country").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  address: text("address").notNull(),
  facebook: text("facebook"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  whatsapp: text("whatsapp"),
  website: text("website"),
  contact_name: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"),
  shop_id: integer("shop_id"),
  rejected_reason: text("rejected_reason"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type ShopApplication = typeof shopApplicationsTable.$inferSelect;
