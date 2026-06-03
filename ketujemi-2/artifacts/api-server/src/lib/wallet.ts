import { eq } from "drizzle-orm";
import { db, usersTable, walletTransactionsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { isBusinessAccount, isVipBusinessActive } from "./business-rules";
import {
  countUserActiveListingsInCategoryRoot,
  getCategoryPostingQuota,
} from "./category-quota";
import { LISTING_PACKAGE_CATALOG, type ListingPackageId } from "./listing-packages";

/** Cost per paid listing (€0.30). */
export const LISTING_PRICE_CENTS = 30;

export type WalletTopupId = ListingPackageId;

export const WALLET_TOPUP_CATALOG: Record<
  WalletTopupId,
  { price_eur: number; price_cents: number; listings: number; label: string }
> = {
  s: {
    price_eur: LISTING_PACKAGE_CATALOG.s.price_eur,
    price_cents: LISTING_PACKAGE_CATALOG.s.price_cents,
    listings: LISTING_PACKAGE_CATALOG.s.listings_approx,
    label: `Paketa S — €${LISTING_PACKAGE_CATALOG.s.price_eur} (~${LISTING_PACKAGE_CATALOG.s.listings_approx} shpallje)`,
  },
  m: {
    price_eur: LISTING_PACKAGE_CATALOG.m.price_eur,
    price_cents: LISTING_PACKAGE_CATALOG.m.price_cents,
    listings: LISTING_PACKAGE_CATALOG.m.listings_approx,
    label: `Paketa M — €${LISTING_PACKAGE_CATALOG.m.price_eur} (~${LISTING_PACKAGE_CATALOG.m.listings_approx} shpallje)`,
  },
  l: {
    price_eur: LISTING_PACKAGE_CATALOG.l.price_eur,
    price_cents: LISTING_PACKAGE_CATALOG.l.price_cents,
    listings: LISTING_PACKAGE_CATALOG.l.listings_approx,
    label: `Paketa L — €${LISTING_PACKAGE_CATALOG.l.price_eur} (~${LISTING_PACKAGE_CATALOG.l.listings_approx} shpallje)`,
  },
};

export function parseWalletTopupId(raw: string): WalletTopupId | null {
  const k = raw.trim().toLowerCase();
  if (k === "s" || k === "5") return "s";
  if (k === "m" || k === "10") return "m";
  if (k === "l" || k === "20") return "l";
  return null;
}

export function stripePurposeForWalletTopup(pkg: WalletTopupId): `wallet_topup_${WalletTopupId}` {
  return `wallet_topup_${pkg}`;
}

export function parseWalletTopupPurpose(
  purpose: string | undefined,
): WalletTopupId | null {
  if (!purpose?.startsWith("wallet_topup_")) return null;
  return parseWalletTopupId(purpose.replace("wallet_topup_", ""));
}

export function listingsRemainingFromBalance(balanceCents: number): number {
  return Math.floor(balanceCents / LISTING_PRICE_CENTS);
}

export function walletSummary(balanceCents: number) {
  const remaining = listingsRemainingFromBalance(balanceCents);
  return {
    balance_cents: balanceCents,
    balance_eur: (balanceCents / 100).toFixed(2),
    listing_price_cents: LISTING_PRICE_CENTS,
    listing_price_eur: (LISTING_PRICE_CENTS / 100).toFixed(2),
    listings_remaining: remaining,
    after_one_listing_cents: Math.max(0, balanceCents - LISTING_PRICE_CENTS),
    after_one_listing_remaining: listingsRemainingFromBalance(
      Math.max(0, balanceCents - LISTING_PRICE_CENTS),
    ),
  };
}

export async function getWalletBalanceCents(userId: number): Promise<number> {
  const [row] = await db
    .select({ wallet_balance_cents: usersTable.wallet_balance_cents })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return row?.wallet_balance_cents ?? 0;
}

/** True when this post must be paid from wallet (over free quota). */
export async function listingWillChargeWallet(
  user: User,
  categoryId: number,
): Promise<boolean> {
  if (isBusinessAccount(user) && isVipBusinessActive(user)) return false;

  const q = await getCategoryPostingQuota(user, categoryId);
  if (!q.allowed) return true;

  if (isBusinessAccount(user)) {
    const { used, limit } = await countUserActiveListingsInCategoryRoot(user, categoryId);
    if (used >= limit) return true;
  }

  return false;
}

export async function assertWalletCoversListing(
  user: User,
  categoryId: number,
): Promise<void> {
  const willCharge = await listingWillChargeWallet(user, categoryId);
  if (!willCharge) return;

  const balance = await getWalletBalanceCents(user.id);
  if (balance < LISTING_PRICE_CENTS) {
    const err = new Error("WALLET_INSUFFICIENT") as Error & {
      balance_cents: number;
      required_cents: number;
      listings_remaining: number;
      publicMessage: string;
    };
    err.balance_cents = balance;
    err.required_cents = LISTING_PRICE_CENTS;
    err.listings_remaining = listingsRemainingFromBalance(balance);
    err.publicMessage =
      "Postimet falas këtë muaj për këtë kategori janë shpenzuar. Çdo postim i ri kushton vetëm €0.30 — mbushni portofolin nga Profili (Paketa S €5, M €10, L €20).";
    throw err;
  }
}

export async function creditWalletTopup(
  userId: number,
  amountCents: number,
  paymentToken: string,
): Promise<void> {
  if (amountCents <= 0) return;

  const [existing] = await db
    .select({ id: walletTransactionsTable.id })
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.payment_token, paymentToken))
    .limit(1);
  if (existing) return;

  await db.transaction(async (tx) => {
    const [user] = await tx
      .select({ wallet_balance_cents: usersTable.wallet_balance_cents })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user) return;

    const next = user.wallet_balance_cents + amountCents;
    await tx
      .update(usersTable)
      .set({ wallet_balance_cents: next })
      .where(eq(usersTable.id, userId));

    await tx.insert(walletTransactionsTable).values({
      user_id: userId,
      type: "topup",
      amount_cents: amountCents,
      balance_after_cents: next,
      payment_token: paymentToken,
      note: "Portofol — kredi",
    });
  });
}

export async function debitWalletForListing(
  userId: number,
  listingId: number,
): Promise<{ balance_cents: number; listings_remaining: number }> {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select({ wallet_balance_cents: usersTable.wallet_balance_cents })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.wallet_balance_cents < LISTING_PRICE_CENTS) {
      throw new Error("WALLET_INSUFFICIENT");
    }

    const next = user.wallet_balance_cents - LISTING_PRICE_CENTS;
    await tx
      .update(usersTable)
      .set({ wallet_balance_cents: next })
      .where(eq(usersTable.id, userId));

    await tx.insert(walletTransactionsTable).values({
      user_id: userId,
      type: "listing_debit",
      amount_cents: -LISTING_PRICE_CENTS,
      balance_after_cents: next,
      listing_id: listingId,
      note: "Listing post",
    });

    return {
      balance_cents: next,
      listings_remaining: listingsRemainingFromBalance(next),
    };
  });
}
