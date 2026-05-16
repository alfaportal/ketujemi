import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  /** E.164 digits only (no +), e.g. 38344901234 — matches Vonage numbering */
  phone_e164_digits: text("phone_e164_digits").unique(),
  password_hash: text("password_hash"),
  display_name: text("display_name"),
  /** Contact number shown on listings (may differ from login phone). */
  contact_phone: text("contact_phone"),
  profile_photo_url: text("profile_photo_url"),
  city: text("city"),
  about_me: text("about_me"),
  email_verified_at: timestamp("email_verified_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
