import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const shopDirectoryCategoriesTable = pgTable("shop_directory_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  slug: text("slug").notNull().unique(),
  image_url: text("image_url"),
  sort_order: integer("sort_order").notNull().default(0),
});

export type ShopDirectoryCategoryRow = typeof shopDirectoryCategoriesTable.$inferSelect;
