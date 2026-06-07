import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export type FacebookDataDeletionStatus = "completed" | "no_user" | "failed";

export const facebookDataDeletionRequestsTable = pgTable("facebook_data_deletion_requests", {
  id: serial("id").primaryKey(),
  confirmation_code: text("confirmation_code").notNull().unique(),
  facebook_user_id: text("facebook_user_id").notNull(),
  user_id: integer("user_id").references(() => usersTable.id),
  status: text("status").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  completed_at: timestamp("completed_at"),
});

export type FacebookDataDeletionRequest =
  typeof facebookDataDeletionRequestsTable.$inferSelect;
