import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const adminLoginChallengesTable = pgTable("admin_login_challenges", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
