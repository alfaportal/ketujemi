import { integer, pgTable, serial, text, unique } from "drizzle-orm/pg-core";
import { shopDirectoryCategoriesTable } from "./shop_directory_categories";

export const shopDirectorySubcategoriesTable = pgTable(
  "shop_directory_subcategories",
  {
    id: serial("id").primaryKey(),
    category_id: integer("category_id")
      .notNull()
      .references(() => shopDirectoryCategoriesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [unique("shop_directory_subcategories_category_slug").on(t.category_id, t.slug)],
);

export type ShopDirectorySubcategoryRow = typeof shopDirectorySubcategoriesTable.$inferSelect;
