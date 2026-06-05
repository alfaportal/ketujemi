import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const userFcmTokensTable = pgTable("user_fcm_tokens", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  platform: text("platform"),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
