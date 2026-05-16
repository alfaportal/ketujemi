import { pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

/** Truck / van models for Kamionë & Furgonë search (paired with hub brand slugs, e.g. `kamione-mercedes-benz`). */
export const truckModelsTable = pgTable(
  "truck_models",
  {
    id: serial("id").primaryKey(),
    brand_slug: text("brand_slug").notNull(),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("truck_models_brand_slug_name").on(t.brand_slug, t.name)],
);

export type TruckModel = typeof truckModelsTable.$inferSelect;
