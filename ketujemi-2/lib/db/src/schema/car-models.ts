import { pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

/** Reference car models for marketplace search UX (paired with Vetura brands by slug, e.g. `audi`). */
export const carModelsTable = pgTable(
  "car_models",
  {
    id: serial("id").primaryKey(),
    brand_slug: text("brand_slug").notNull(),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("car_models_brand_slug_name").on(t.brand_slug, t.name)],
);

export type CarModel = typeof carModelsTable.$inferSelect;
