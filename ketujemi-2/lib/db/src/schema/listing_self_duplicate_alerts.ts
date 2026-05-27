import { integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";

/** Tracks one-time SMS/email when a user retries an identical active listing. */
export const listingSelfDuplicateAlertsTable = pgTable(
  "listing_self_duplicate_alerts",
  {
    user_id: integer("user_id").notNull(),
    listing_id: integer("listing_id").notNull(),
    notified_at: timestamp("notified_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.listing_id] }),
  }),
);
