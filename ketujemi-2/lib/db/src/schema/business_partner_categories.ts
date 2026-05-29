import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { categoriesTable } from "./categories";
import { usersTable } from "./users";

/** Admin-assigned category visibility for active business partners (user accounts). */
export const businessPartnerCategoriesTable = pgTable(
  "business_partner_categories",
  {
    user_id: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    category_id: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.category_id] }),
  }),
);
