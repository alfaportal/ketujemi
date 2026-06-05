import { integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { shopsTable } from "./shops";
import { usersTable } from "./users";

export const shopRatingsTable = pgTable(
  "shop_ratings",
  {
    id: serial("id").primaryKey(),
    shop_id: integer("shop_id")
      .notNull()
      .references(() => shopsTable.id, { onDelete: "cascade" }),
    user_id: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    shopUserUnique: uniqueIndex("shop_ratings_shop_user_idx").on(t.shop_id, t.user_id),
  }),
);

export type ShopRating = typeof shopRatingsTable.$inferSelect;
