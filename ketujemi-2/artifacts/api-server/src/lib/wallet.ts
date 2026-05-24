import { eq } from "drizzle-orm";
import { db, usersTable, walletTransactionsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { isBusinessAccount, isVipBusinessActive } from "./business-rules";
import { countUserActiveListingsInCategoryRoot } from "./category-quota";

/** Cost per paid listing (€0.30). */
export const LISTING_PRICE_CENTS = 30;

export type WalletTopupId = "5" | "10" | "20";

export const WALLET_TOPUP_CATALOG: Record<
  WalletTopupId,
  { price_eur: number; price_cents: number; listings: number; label: string }
> = {
  "5": { price_eur: 5, price_cents: 500, listings: 16, label: "€5 — 16 shpallje" },
  "10": { price_eur: 10, price_cents: 1000, listings: 33, label: "€10 — 33 shpallje" },
  "20": { price_eur: 20, price_cents: 2000, listings: 66, label: "€20 — 66 shpallje" },
};

export function stripePurposeForWalletTopup(pkg: WalletTopupId): `wallet_topup_${WalletTopupId}` {
  return `wallet_topup_${pkg}`;
}

export function parseWalletTopupPurpose(
  purpose: string | undefined,
): WalletTopupId | null {
  if (purpose === "wallet_topup_5") return "5";
  if (purpose === "wallet_topup_10") return "10";
  if (purpose === "wallet_topup_20") return "20";
  return null;
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
  opts?: { hasPaidExtraPost?: boolean },
): Promise<boolean> {
  if (opts?.hasPaidExtraPost) return false;
  if (isBusinessAccount(user) && isVipBusinessActive(user)) return false;

  const { used, limit } = await countUserActiveListingsInCategoryRoot(user, categoryId);
  return used >= limit;
}

export async function assertWalletCoversListing(
  user: User,
  categoryId: number,
  opts?: { hasPaidExtraPost?: boolean },
): Promise<void> {
  const willCharge = await listingWillChargeWallet(user, categoryId, opts);
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
      "Balanca juaj nuk mjafton. Mbushni portofolin (€5 / €10 / €20) për të postuar.";
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
      note: "Stripe top-up",
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
