import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { categoriesTable } from "./categories";
import { homepagePartnersTable } from "./homepage_partners";

/** Categories where a curated homepage partner appears (hub pages). Empty = homepage only. */
export const homepagePartnerCategoriesTable = pgTable(
  "homepage_partner_categories",
  {
    partner_id: integer("partner_id")
      .notNull()
      .references(() => homepagePartnersTable.id, { onDelete: "cascade" }),
    category_id: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.partner_id, t.category_id] }),
  }),
);
