import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopsTable } from "./shops";
import { usersTable } from "./users";

export const DELETION_REASONS = [
  "unsatisfied_service",
  "not_found",
  "too_annoying",
  "better_platform",
  "no_longer_need",
  "other",
] as const;

export type DeletionReason = (typeof DELETION_REASONS)[number];

export type DeletionEntityType = "user" | "shop";

export const deletionFeedbackTable = pgTable("deletion_feedback", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  entity_type: text("entity_type").notNull(),
  shop_id: integer("shop_id").references(() => shopsTable.id),
  reason: text("reason").notNull(),
  custom_text: text("custom_text"),
  additional_feedback: text("additional_feedback"),
  deleted_at: timestamp("deleted_at").notNull().defaultNow(),
});

export type DeletionFeedback = typeof deletionFeedbackTable.$inferSelect;
