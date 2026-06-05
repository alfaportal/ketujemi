import type { User } from "@workspace/db";
import {
  BUSINESS_EXTRA_POST_PRICE_EUR,
  BUSINESS_VIP_MONTHLY_PRICE_EUR,
  isBusinessAccount,
  isVipBusinessActive,
} from "./business-rules";
import { countUserActiveListingsInCategoryRoot } from "./category-quota";

export const BUSINESS_STANDARD_ACTIVE_LISTING_CAP = 50;
export const BUSINESS_VIP_ACTIVE_LISTING_CAP = 100;

export type BusinessQuotaStatus = {
  tier: "standard" | "vip";
  /** Per parent category for standard tier; unlimited for VIP. */
  freeLimitPerCategory: number;
  extraPostPriceEur: number;
  canPostUnlimited: boolean;
  monthlyActiveCap: number;
  vipMonthlyPriceEur: number;
};

export async function getBusinessQuotaStatus(user: User): Promise<BusinessQuotaStatus> {
  const vip = isVipBusinessActive(user);
  return {
    tier: vip ? "vip" : "standard",
    freeLimitPerCategory: Number.POSITIVE_INFINITY,
    extraPostPriceEur: 0,
    canPostUnlimited: true,
    monthlyActiveCap: Number.POSITIVE_INFINITY,
    vipMonthlyPriceEur: BUSINESS_VIP_MONTHLY_PRICE_EUR,
  };
}

/** Listing caps removed — posting is unlimited for all account types. */
export async function assertBusinessPostingAllowed(_user: User): Promise<void> {
  return;
}

export async function assertBusinessCategoryListingQuota(
  user: User,
  categoryId: number,
  opts?: { hasPaidExtraPost?: boolean },
): Promise<void> {
  if (!isBusinessAccount(user) || isVipBusinessActive(user)) return;

  const { used, limit } = await countUserActiveListingsInCategoryRoot(user, categoryId);
  if (used < limit) return;

  if (opts?.hasPaidExtraPost) return;

  const err = new Error("BUSINESS_QUOTA_EXCEEDED") as Error & {
    used: number;
    limit: number;
    extraPostPriceEur: number;
  };
  err.used = used;
  err.limit = limit;
  err.extraPostPriceEur = BUSINESS_EXTRA_POST_PRICE_EUR;
  throw err;
}
