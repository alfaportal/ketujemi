import { boolean, integer, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { categoriesTable } from "./categories";
import { listingsTable } from "./listings";
import { shopsTable } from "./shops";

export const shopProductsTable = pgTable("shop_products", {
  id: serial("id").primaryKey(),
  shop_id: integer("shop_id")
    .notNull()
    .references(() => shopsTable.id, { onDelete: "cascade" }),
  /** Linked Blej & Shite listing — auto-synced on create/update. */
  listing_id: integer("listing_id").references(() => listingsTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compare_at_price: numeric("compare_at_price", { precision: 10, scale: 2 }),
  category_id: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  image_url: text("image_url"),
  /** Owner-defined shelf/group label (e.g. Menu, Desserts) — storefront only. */
  collection: text("collection"),
  sku: text("sku"),
  sort_order: integer("sort_order").notNull().default(0),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type ShopProduct = typeof shopProductsTable.$inferSelect;
export type InsertShopProduct = typeof shopProductsTable.$inferInsert;
