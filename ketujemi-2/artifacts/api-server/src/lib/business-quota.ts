import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { and, gte, lt } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";
import {
  BUSINESS_EXTRA_POST_PRICE_EUR,
  BUSINESS_STANDARD_FREE_POSTS_PER_MONTH,
  isBusinessAccount,
  isVipBusinessActive,
} from "./business-rules";

function monthBounds(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

/** Active listings created this calendar month by this user. */
export async function countBusinessPostsThisMonth(user: User): Promise<number> {
  const { start, end } = monthBounds();
  const rows = await db
    .select({
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
      created_at: listingsTable.created_at,
    })
    .from(listingsTable)
    .where(
      and(
        gte(listingsTable.created_at, start),
        lt(listingsTable.created_at, end),
      ),
    );

  return rows.filter((l) => userOwnsListing(user, l)).length;
}

export type BusinessQuotaStatus = {
  tier: "standard" | "vip";
  postsThisMonth: number;
  freeLimit: number;
  canPostFree: boolean;
  extraPostPriceEur: number;
  vipMonthlyPriceEur: number;
};

export async function getBusinessQuotaStatus(user: User): Promise<BusinessQuotaStatus> {
  const postsThisMonth = await countBusinessPostsThisMonth(user);
  const vip = isVipBusinessActive(user);

  if (vip) {
    return {
      tier: "vip",
      postsThisMonth,
      freeLimit: Number.POSITIVE_INFINITY,
      canPostFree: true,
      extraPostPriceEur: BUSINESS_EXTRA_POST_PRICE_EUR,
      vipMonthlyPriceEur: 20,
    };
  }

  const freeLimit = BUSINESS_STANDARD_FREE_POSTS_PER_MONTH;
  return {
    tier: "standard",
    postsThisMonth,
    freeLimit,
    canPostFree: postsThisMonth < freeLimit,
    extraPostPriceEur: BUSINESS_EXTRA_POST_PRICE_EUR,
    vipMonthlyPriceEur: 20,
  };
}

export async function assertBusinessPostingAllowed(
  user: User,
  opts?: { paidExtraPost?: boolean },
): Promise<void> {
  if (!isBusinessAccount(user)) return;

  const status = await getBusinessQuotaStatus(user);
  if (status.canPostFree) return;

  if (opts?.paidExtraPost) return;

  const err = new Error("BUSINESS_QUOTA_EXCEEDED") as Error & {
    quota: BusinessQuotaStatus;
  };
  err.quota = status;
  throw err;
}
