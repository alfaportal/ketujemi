import { pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

/** Motorcycle / scooter models (brand slug = `motorr-yamaha`, etc.). */
export const motorModelsTable = pgTable(
  "motor_models",
  {
    id: serial("id").primaryKey(),
    brand_slug: text("brand_slug").notNull(),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("motor_models_brand_slug_name").on(t.brand_slug, t.name)],
);

export type MotorModel = typeof motorModelsTable.$inferSelect;
