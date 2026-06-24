import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Pending Vonage Verify request IDs (TTL enforced in application code). */
export const phoneVerifyChallengesTable = pgTable("phone_verify_challenges", {
  id: serial("id").primaryKey(),
  phone_e164_digits: text("phone_e164_digits").notNull(),
  request_id: text("request_id").notNull(),
  /** Set during SMS registration (not used for login-only OTP). */
  password_hash: text("password_hash"),
  /** Bcrypt hash i kodit OTP (WhatsApp Cloud API — verifikim lokal). */
  otp_code_hash: text("otp_code_hash"),
  fail_count: integer("fail_count").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});

export type PhoneVerifyChallenge = typeof phoneVerifyChallengesTable.$inferSelect;
