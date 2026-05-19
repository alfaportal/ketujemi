import type { User } from "@workspace/db";
import {
  BUSINESS_EXTRA_POST_PRICE_EUR,
  BUSINESS_STANDARD_FREE_LISTINGS_PER_CATEGORY,
  BUSINESS_VIP_MONTHLY_PRICE_EUR,
  isBusinessAccount,
  isVipBusinessActive,
} from "./business-rules";
import { countUserActiveListingsInCategoryRoot } from "./category-quota";

export type BusinessQuotaStatus = {
  tier: "standard" | "vip";
  /** Per parent category for standard tier; unlimited for VIP. */
  freeLimitPerCategory: number;
  extraPostPriceEur: number;
  canPostUnlimited: boolean;
  vipMonthlyPriceEur: number;
};

export async function getBusinessQuotaStatus(user: User): Promise<BusinessQuotaStatus> {
  const vip = isVipBusinessActive(user);

  if (vip) {
    return {
      tier: "vip",
      freeLimitPerCategory: Number.POSITIVE_INFINITY,
      extraPostPriceEur: BUSINESS_EXTRA_POST_PRICE_EUR,
      canPostUnlimited: true,
      vipMonthlyPriceEur: BUSINESS_VIP_MONTHLY_PRICE_EUR,
    };
  }

  return {
    tier: "standard",
    freeLimitPerCategory: BUSINESS_STANDARD_FREE_LISTINGS_PER_CATEGORY,
    extraPostPriceEur: BUSINESS_EXTRA_POST_PRICE_EUR,
    canPostUnlimited: false,
    vipMonthlyPriceEur: BUSINESS_VIP_MONTHLY_PRICE_EUR,
  };
}

/** VIP = unlimited; standard = 10 free per category then €1 per extra post. */
export async function assertBusinessPostingAllowed(user: User): Promise<void> {
  if (!isBusinessAccount(user)) return;
  if (isVipBusinessActive(user)) return;
}

export async function assertBusinessCategoryListingQuota(
  user: User,
  categoryId: number,
  opts?: { paidExtraPost?: boolean },
): Promise<void> {
  if (!isBusinessAccount(user) || isVipBusinessActive(user)) return;

  const { used, limit } = await countUserActiveListingsInCategoryRoot(user, categoryId);
  if (used < limit) return;

  if (opts?.paidExtraPost) return;

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
