import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  icon: text("icon").notNull(),
  parent_id: integer("parent_id"),
  /** Optional hero/thumbnail URL for the category (e.g. Pexels JPEG). */
  image_url: text("image_url"),
  /** Free active listings per user for this category tree (root categories; subcats inherit via root). */
  free_listing_limit: integer("free_listing_limit").notNull().default(5),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;
