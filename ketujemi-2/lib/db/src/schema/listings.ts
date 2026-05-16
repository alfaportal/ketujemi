import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category_id: integer("category_id").notNull(),
  location: text("location").notNull(),
  seller_name: text("seller_name").notNull(),
  seller_phone: text("seller_phone").notNull(),
  condition: text("condition").notNull(),
  views: integer("views").notNull().default(0),
  is_featured: boolean("is_featured").notNull().default(false),
  image_url: text("image_url"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at"),
  /** Optional structured Vetura filters (backward-compatible; NULL for legacy rows). */
  vehicle_year: integer("vehicle_year"),
  vehicle_mileage_km: integer("vehicle_mileage_km"),
  vehicle_fuel: text("vehicle_fuel"),
  vehicle_body_type: text("vehicle_body_type"),
  vehicle_model: text("vehicle_model"),
  /** Kamionë & Furgonë hub filters (nullable; backward-compatible). */
  truck_type_slug: text("truck_type_slug"),
  truck_axle_config: text("truck_axle_config"),
  truck_gvw_band: text("truck_gvw_band"),
  truck_euro_standard: text("truck_euro_standard"),
  /** Optional Banesa & Shtëpi / real estate structured filters */
  property_txn: text("property_txn"),
  property_subtype: text("property_subtype"),
  property_sqm: integer("property_sqm"),
  property_floor: text("property_floor"),
  /** Motorr & Skuter hub filters (nullable). */
  motor_type_slug: text("motor_type_slug"),
  motor_cc_band: text("motor_cc_band"),
  motor_power_kw: integer("motor_power_kw"),
  motor_transmission: text("motor_transmission"),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, views: true, created_at: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
