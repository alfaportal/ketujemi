import { db, usersTable, type User } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getAdminEmail } from "./admin-monitor-email.js";
import { isPlatformAdminUser, PLATFORM_OPERATOR_EMAIL } from "./platform-admin.js";
function platformAdminEmail(): string {
  return getAdminEmail()?.trim().toLowerCase() || PLATFORM_OPERATOR_EMAIL.toLowerCase();
}

export async function getPlatformAdminUser(): Promise<User | null> {
  const email = platformAdminEmail();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(sql`lower(trim(${usersTable.email})) = ${email}`)
    .limit(1);
  return user ?? null;
}

/** After empty DB reset — auto-create operator row so admin can post shops/listings. */
export async function getOrEnsurePlatformAdminUser(): Promise<User> {
  const existing = await getPlatformAdminUser();
  if (existing) return existing;

  const email = platformAdminEmail();
  const [inserted] = await db
    .insert(usersTable)
    .values({
      email,
      display_name: "KetuJemi Admin",
      identity_verified: true,
      identity_verified_via: "platform",
    })
    .returning();

  if (inserted) return inserted;

  const [row] = await db
    .select()
    .from(usersTable)
    .where(sql`lower(trim(${usersTable.email})) = ${email}`)
    .limit(1);
  if (!row) {
    throw new Error("PLATFORM_ADMIN_USER_ENSURE_FAILED");
  }
  return row;
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

function stripOperatorEmailFromDescription(description: string, operatorEmail: string): string {
  const op = operatorEmail.trim().toLowerCase();
  if (!op) return description;
  const sep = "\n\n";
  const idx = description.indexOf(sep);
  if (idx <= 0) return description;
  const firstLine = description.slice(0, idx);
  const rest = description.slice(idx);
  const pairs = firstLine.split(" · ").filter((pair) => {
    const colon = pair.indexOf(": ");
    if (colon <= 0) return true;
    const key = pair.slice(0, colon).trim();
    const value = pair.slice(colon + 2).trim().toLowerCase();
    if (key !== "Email") return true;
    return value !== op;
  });
  if (pairs.length === 0) return description.slice(idx + sep.length);
  return pairs.join(" · ") + rest;
}

export function descriptionForAdminOnBehalf(description: string, operatorEmail?: string | null): string {
  const op =
    operatorEmail?.trim().toLowerCase()
    || getAdminEmail()?.trim().toLowerCase()
    || PLATFORM_OPERATOR_EMAIL.toLowerCase();
  return stripOperatorEmailFromDescription(description, op);
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
