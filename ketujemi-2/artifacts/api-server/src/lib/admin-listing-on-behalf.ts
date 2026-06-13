import { db, usersTable, type User } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getAdminEmail } from "./admin-monitor-email.js";
import { isPlatformAdminUser } from "./platform-admin.js";
import { stripEmailFromListingDescription } from "./listing-ownership-guard.js";

/** Platform operator account (EMAIL_ADMIN, e.g. novelto22@gmail.com). */
export async function getPlatformAdminUser(): Promise<User | null> {
  const email = getAdminEmail()?.trim().toLowerCase();
  if (!email) return null;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(sql`lower(trim(${usersTable.email})) = ${email}`)
    .limit(1);
  return user ?? null;
}

export function normalizeSubmittedSellerPhone(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;
  if (trimmed.startsWith("+")) return trimmed;
  if (/^\d/.test(trimmed)) return `+${digits}`;
  return trimmed;
}

export function sellerContactForAdminOnBehalf(submitted: {
  seller_name: string;
  seller_phone: string;
}): { seller_name: string; seller_phone: string } {
  return {
    seller_name: submitted.seller_name.trim(),
    seller_phone: normalizeSubmittedSellerPhone(submitted.seller_phone),
  };
}

export function descriptionForAdminOnBehalf(description: string): string {
  return stripEmailFromListingDescription(description);
}

export async function isListingUserPlatformAdmin(userId: number | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const [user] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user ? isPlatformAdminUser(user) : false;
}
