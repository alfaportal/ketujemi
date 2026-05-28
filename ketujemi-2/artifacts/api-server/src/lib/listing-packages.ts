import { randomInt, randomUUID } from "node:crypto";
import { db, listingPackagePurchasesTable, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { countUserActiveListings } from "./user-listing-limits";
import {
  DEFAULT_FREE_LISTING_LIMIT,
  countParentCategories,
  loadAllCategories,
} from "./category-quota";
import { notifyListingPackageActivated } from "./send-listing-package-notifications";
const LISTING_PRICE_CENTS = 30;

function listingsRemainingFromBalance(balanceCents: number): number {
  return Math.floor(balanceCents / LISTING_PRICE_CENTS);
}

/** S/M/L = kredi portofoli (€0.30/shpallje). Nuk skadon — deri sa harxhohet. */
export const LISTING_PACKAGE_CATALOG = {
  s: {
    id: "s" as const,
    name: "Paketa S",
    price_eur: 5,
    price_cents: 500,
    wallet_credit_cents: 500,
    listings_approx: 16,
  },
  m: {
    id: "m" as const,
    name: "Paketa M",
    price_eur: 10,
    price_cents: 1000,
    wallet_credit_cents: 1000,
    listings_approx: 33,
  },
  l: {
    id: "l" as const,
    name: "Paketa L",
    price_eur: 20,
    price_cents: 2000,
    wallet_credit_cents: 2000,
    listings_approx: 66,
  },
} as const;

export type ListingPackageId = keyof typeof LISTING_PACKAGE_CATALOG;

export function stripePurposeForPackage(pkg: ListingPackageId): string {
  return `listing_package_${pkg}`;
}

export function parseListingPackageId(raw: string): ListingPackageId | null {
  const k = raw.trim().toLowerCase();
  if (k === "s" || k === "listing_package_s" || k === "5") return "s";
  if (k === "m" || k === "listing_package_m" || k === "10") return "m";
  if (k === "l" || k === "listing_package_l" || k === "20") return "l";
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

/** Paketat shtojnë kredi portofoli, jo vende aktive shtesë. */
export async function getUserExtraListingSlots(_userId: number): Promise<number> {
  return 0;
}

export async function getUserListingCapacity(user: User): Promise<{
  free_per_parent_category: number;
  parent_category_count: number;
  active_count_total: number;
}> {
  const { list } = await loadAllCategories();
  const active_count_total = await countUserActiveListings(user);
  return {
    free_per_parent_category: DEFAULT_FREE_LISTING_LIMIT,
    parent_category_count: countParentCategories(list),
    active_count_total,
  };
}

export function effectiveCategoryLimit(baseLimit: number, _extraSlots: number): number {
  return baseLimit;
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

  const pkg = purchase.package as ListingPackageId;
  const def = LISTING_PACKAGE_CATALOG[pkg];
  if (!def) return null;

  const now = new Date();
  const { creditWalletTopup, getWalletBalanceCents } = await import("./wallet");
  await creditWalletTopup(
    purchase.user_id,
    def.wallet_credit_cents,
    `listing_pkg:${purchase.payment_token}`,
  );

  await db
    .update(listingPackagePurchasesTable)
    .set({
      status: "paid",
      purchased_at: now,
      expires_at: null,
      extra_slots: def.listings_approx,
      amount_cents: def.price_cents,
    })
    .where(eq(listingPackagePurchasesTable.id, purchaseId));

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, purchase.user_id))
    .limit(1);

  if (user) {
    const balance = await getWalletBalanceCents(user.id);
    await notifyListingPackageActivated({
      user,
      packageName: packageLabel(pkg),
      creditEur: (def.wallet_credit_cents / 100).toFixed(2),
      listingsApprox: def.listings_approx,
      balanceEur: (balance / 100).toFixed(2),
      listingsRemaining: listingsRemainingFromBalance(balance),
      activationCode: purchase.activation_code,
    });
  }

  return { activationCode: purchase.activation_code };
}

export async function redeemListingPackageCode(
  userId: number,
  code: string,
): Promise<
  | {
      ok: true;
      package: string;
      listings_approx: number;
      balance_eur: string;
      listings_remaining: number;
    }
  | { ok: false; message: string }
> {
  const purchase = await findPackagePurchaseByCode(code);
  if (!purchase) {
    return { ok: false, message: "Kodi nuk u gjet." };
  }
  if (purchase.status !== "paid") {
    return { ok: false, message: "Paketa nuk është paguar ende." };
  }
  if (purchase.user_id !== userId) {
    return { ok: false, message: "Ky kod i përket një llogarie tjetër." };
  }

  const { getWalletBalanceCents } = await import("./wallet");
  const balance = await getWalletBalanceCents(userId);
  return {
    ok: true,
    package: purchase.package,
    listings_approx: purchase.extra_slots,
    balance_eur: (balance / 100).toFixed(2),
    listings_remaining: listingsRemainingFromBalance(balance),
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
      extra_slots: def.listings_approx,
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
