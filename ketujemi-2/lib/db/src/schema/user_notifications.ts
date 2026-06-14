import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type UserNotificationType =
  | "listing_first_external_view"
  | "social_follow_prompt"
  | "listing_excess_photos_removed";

export const userNotificationsTable = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  type: text("type").notNull(),
  /** JSON payload, e.g. { listingId, listingTitle } */
  payload: text("payload"),
  read_at: timestamp("read_at"),
  requires_action: boolean("requires_action").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type UserNotification = typeof userNotificationsTable.$inferSelect;
