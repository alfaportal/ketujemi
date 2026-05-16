import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Pending email sign-ups (code + magic link). */
export const emailVerifyChallengesTable = pgTable("email_verify_challenges", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  password_hash: text("password_hash").notNull(),
  code: text("code").notNull(),
  token: text("token").notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});

export type EmailVerifyChallenge = typeof emailVerifyChallengesTable.$inferSelect;
