import { randomInt, randomUUID } from "node:crypto";
import { db, listingPackagePurchasesTable, usersTable } from "@workspace/db";
import type { ListingPackageTier, User } from "@workspace/db";
import { and, eq, gt, gte, sql } from "drizzle-orm";
import { DEFAULT_FREE_LISTING_LIMIT } from "./category-quota";
import { MAX_ACTIVE_LISTINGS_PER_USER } from "./user-listing-limits";
import { isBusinessAccount } from "./business-rules";
import { notifyListingPackageActivated } from "./send-listing-package-notifications";
import { logger } from "./logger";

export const LISTING_PACKAGE_CATALOG = {
  s: {
    id: "s" as const,
    name: "Paketa S",
    price_eur: 1,
    price_cents: 100,
    extra_slots: 5,
    days: 30,
  },
  m: {
    id: "m" as const,
    name: "Paketa M",
    price_eur: 5,
    price_cents: 500,
    extra_slots: 25,
    days: 30,
  },
  l: {
    id: "l" as const,
    name: "Paketa L",
    price_eur: 8,
    price_cents: 800,
    extra_slots: 50,
    days: 30,
  },
} as const;

export type ListingPackageId = keyof typeof LISTING_PACKAGE_CATALOG;

export function stripePurposeForPackage(pkg: ListingPackageId): string {
  return `listing_package_${pkg}`;
}

export function parseListingPackageId(raw: string): ListingPackageId | null {
  const k = raw.trim().toLowerCase();
  if (k === "s" || k === "listing_package_s") return "s";
  if (k === "m" || k === "listing_package_m") return "m";
  if (k === "l" || k === "listing_package_l") return "l";
  return null;
}

export function generateListingPackageActivationCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += chars[randomInt(0, chars.length)]!;
  }
  return `KJ-${year}-${suffix}`;
}

export function packageLabel(pkg: ListingPackageId): string {
  return LISTING_PACKAGE_CATALOG[pkg].name;
}

/** Sum of extra slots from active paid packages for a user. */
export async function getUserExtraListingSlots(userId: number): Promise<number> {
  const now = new Date();
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${listingPackagePurchasesTable.extra_slots}), 0)::int`,
    })
    .from(listingPackagePurchasesTable)
    .where(
      and(
        eq(listingPackagePurchasesTable.user_id, userId),
        eq(listingPackagePurchasesTable.status, "paid"),
        gt(listingPackagePurchasesTable.expires_at, now),
      ),
    );
  return Number(row?.total ?? 0);
}

export async function getUserListingCapacity(user: User): Promise<{
  base_limit: number;
  extra_slots: number;
  effective_limit: number;
  active_count: number;
  remaining: number;
}> {
  const { countUserActiveListings } = await import("./user-listing-limits");
  const extra = isBusinessAccount(user) ? 0 : await getUserExtraListingSlots(user.id);
  const base = MAX_ACTIVE_LISTINGS_PER_USER;
  const effective = base + extra;
  const active_count = await countUserActiveListings(user);
  return {
    base_limit: base,
    extra_slots: extra,
    effective_limit: effective,
    active_count,
    remaining: Math.max(0, effective - active_count),
  };
}

export function effectiveCategoryLimit(baseLimit: number, extraSlots: number): number {
  return baseLimit + extraSlots;
}

export async function findPackagePurchaseByToken(token: string) {
  const [row] = await db
    .select()
    .from(listingPackagePurchasesTable)
    .where(eq(listingPackagePurchasesTable.payment_token, token))
    .limit(1);
  return row ?? null;
}

export async function findPackagePurchaseByCode(code: string) {
  const normalized = code.trim().toUpperCase();
  const [row] = await db
    .select()
    .from(listingPackagePurchasesTable)
    .where(eq(listingPackagePurchasesTable.activation_code, normalized))
    .limit(1);
  return row ?? null;
}

export async function activateListingPackageFromPayment(
  purchaseId: number,
): Promise<{ activationCode: string } | null> {
  const [purchase] = await db
    .select()
    .from(listingPackagePurchasesTable)
    .where(eq(listingPackagePurchasesTable.id, purchaseId))
    .limit(1);

  if (!purchase) return null;
  if (purchase.status === "paid") {
    return { activationCode: purchase.activation_code };
  }

  const now = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + LISTING_PACKAGE_CATALOG[purchase.package as ListingPackageId].days);

  await db
    .update(listingPackagePurchasesTable)
    .set({
      status: "paid",
      purchased_at: now,
      expires_at: expires,
    })
    .where(eq(listingPackagePurchasesTable.id, purchaseId));

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, purchase.user_id))
    .limit(1);

  const pkg = purchase.package as ListingPackageId;
  const capacity = user ? await getUserListingCapacity(user) : null;

  if (user) {
    await notifyListingPackageActivated({
      user,
      packageName: packageLabel(pkg),
      extraSlots: purchase.extra_slots,
      effectiveLimit:
        capacity?.effective_limit ?? DEFAULT_FREE_LISTING_LIMIT + purchase.extra_slots,
      expiresAt: expires,
      activationCode: purchase.activation_code,
    });
  }

  return { activationCode: purchase.activation_code };
}

/** Redeem code on another device (same or first-time user binding). */
export async function redeemListingPackageCode(
  userId: number,
  code: string,
): Promise<
  | { ok: true; package: string; extra_slots: number; expires_at: string; effective_limit: number }
  | { ok: false; message: string }
> {
  const purchase = await findPackagePurchaseByCode(code);
  if (!purchase) {
    return { ok: false, message: "Kodi nuk u gjet." };
  }
  if (purchase.status !== "paid") {
    return { ok: false, message: "Paketa nuk është paguar ende." };
  }
  if (purchase.expires_at && purchase.expires_at < new Date()) {
    return { ok: false, message: "Paketa ka skaduar." };
  }
  if (purchase.user_id !== userId) {
    return { ok: false, message: "Ky kod i përket një llogarie tjetër." };
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    return { ok: false, message: "Llogaria nuk u gjet." };
  }

  const capacity = await getUserListingCapacity(user);
  return {
    ok: true,
    package: purchase.package,
    extra_slots: purchase.extra_slots,
    expires_at: purchase.expires_at!.toISOString(),
    effective_limit: capacity.effective_limit,
  };
}

export async function createPendingPackagePurchase(
  userId: number,
  pkg: ListingPackageId,
): Promise<{ purchaseId: number; token: string; activationCode: string }> {
  const def = LISTING_PACKAGE_CATALOG[pkg];
  const token = randomUUID();
  const activationCode = generateListingPackageActivationCode();

  const [row] = await db
    .insert(listingPackagePurchasesTable)
    .values({
      user_id: userId,
      package: pkg,
      extra_slots: def.extra_slots,
      amount_cents: def.price_cents,
      activation_code: activationCode,
      payment_token: token,
      status: "pending",
    })
    .returning({ id: listingPackagePurchasesTable.id });

  return {
    purchaseId: row!.id,
    token,
    activationCode,
  };
}

export async function getMonthlyPackageRevenueCents(): Promise<number> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${listingPackagePurchasesTable.amount_cents}), 0)::int`,
    })
    .from(listingPackagePurchasesTable)
    .where(
      and(
        eq(listingPackagePurchasesTable.status, "paid"),
        gte(listingPackagePurchasesTable.purchased_at, start),
      ),
    );
  return Number(row?.total ?? 0);
}
