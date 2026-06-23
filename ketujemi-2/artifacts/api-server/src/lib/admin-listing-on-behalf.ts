import { db, usersTable, shopsTable, type User } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getAdminEmail } from "./admin-monitor-email.js";
import { isPlatformAdminUser, PLATFORM_OPERATOR_EMAIL } from "./platform-admin.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import { phonesMatch } from "./listing-ownership.js";
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

export type AdminListingAttribution = {
  listingUserId: number;
  shopId: number | null;
  seller_name: string;
  seller_phone: string;
};

async function findShopByUniquePhone(
  phone: string,
): Promise<typeof shopsTable.$inferSelect | null> {
  const shops = await db.select().from(shopsTable).where(activeShopSqlCondition());
  const matches = shops.filter((s) => phonesMatch(phone, s.phone));
  return matches.length === 1 ? matches[0]! : null;
}

function shopSellerDisplayName(
  shop: Pick<typeof shopsTable.$inferSelect, "shop_name" | "contact_name">,
  submittedName: string,
): string {
  const custom = submittedName.trim();
  if (custom.length >= 2) return custom;
  const contact = shop.contact_name?.trim();
  if (contact && contact.length >= 2) return contact;
  return shop.shop_name.trim();
}

/**
 * Admin posts are stored as if the shop or seller posted — never as anonymous admin.
 * shop_id must be explicit or match exactly one shop phone.
 */
export async function resolveAdminListingAttribution(input: {
  adminUserId: number;
  bodyShopId?: number | null;
  seller_name: string;
  seller_phone: string;
}): Promise<AdminListingAttribution> {
  const seller = sellerContactForAdminOnBehalf({
    seller_name: input.seller_name,
    seller_phone: input.seller_phone,
  });

  let shopRow: typeof shopsTable.$inferSelect | null = null;

  if (input.bodyShopId != null && input.bodyShopId > 0) {
    const [row] = await db
      .select()
      .from(shopsTable)
      .where(eq(shopsTable.id, input.bodyShopId))
      .limit(1);
    shopRow = row ?? null;
  } else {
    shopRow = await findShopByUniquePhone(seller.seller_phone);
  }

  if (shopRow) {
    const phone = shopRow.phone?.trim() || seller.seller_phone;
    return {
      listingUserId: shopRow.user_id,
      shopId: shopRow.id,
      seller_name: shopSellerDisplayName(shopRow, seller.seller_name),
      seller_phone: phone,
    };
  }

  return {
    listingUserId: input.adminUserId,
    shopId: null,
    seller_name: seller.seller_name,
    seller_phone: seller.seller_phone,
  };
}
