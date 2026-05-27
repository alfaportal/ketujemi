import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const moderationLogTable = pgTable("moderation_log", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id"),
  reason: text("reason").notNull(),
  action: text("action").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type ModerationLog = typeof moderationLogTable.$inferSelect;
