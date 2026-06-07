import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const profileChangeChallengesTable = pgTable("profile_change_challenges", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  phone_e164_digits: text("phone_e164_digits"),
  email: text("email"),
  request_id: text("request_id"),
  code: text("code"),
  fail_count: integer("fail_count").notNull().default(0),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const profileChangeTokensTable = pgTable("profile_change_tokens", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  channel: text("channel").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
