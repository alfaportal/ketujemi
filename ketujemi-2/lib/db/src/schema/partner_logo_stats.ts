import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/** Monthly logo impressions/clicks for VIP partners (trusted partners strip). */
export const partnerLogoStatsTable = pgTable(
  "partner_logo_stats",
  {
    user_id: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    /** Calendar month in UTC, e.g. 2026-05 */
    month: text("month").notNull(),
    views: integer("views").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.month] }),
  }),
);

export type PartnerLogoStats = typeof partnerLogoStatsTable.$inferSelect;
