import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopDirectoryCategoriesTable } from "./shop_directory_categories";
import { shopDirectorySubcategoriesTable } from "./shop_directory_subcategories";
import { usersTable } from "./users";

export const shopsTable = pgTable("shops", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  application_id: integer("application_id"),
  shop_name: text("shop_name").notNull(),
  logo_url: text("logo_url").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  category_id: integer("category_id"),
  directory_category_slug: text("directory_category_slug"),
  directory_subcategory_slug: text("directory_subcategory_slug"),
  directory_category_id: integer("directory_category_id").references(() => shopDirectoryCategoriesTable.id),
  directory_subcategory_id: integer("directory_subcategory_id").references(
    () => shopDirectorySubcategoriesTable.id,
  ),
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
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type Shop = typeof shopsTable.$inferSelect;
