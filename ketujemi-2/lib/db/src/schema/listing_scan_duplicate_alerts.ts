import { integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";

/** One-time notify after periodic scan removes duplicate listings (kept = original). */
export const listingScanDuplicateAlertsTable = pgTable(
  "listing_scan_duplicate_alerts",
  {
    user_id: integer("user_id").notNull(),
    kept_listing_id: integer("kept_listing_id").notNull(),
    notified_at: timestamp("notified_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.kept_listing_id] }),
  }),
);
