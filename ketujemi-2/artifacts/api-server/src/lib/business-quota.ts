import type { User } from "@workspace/db";
import {
  BUSINESS_EXTRA_POST_PRICE_EUR,
  BUSINESS_STANDARD_FREE_LISTINGS_PER_CATEGORY,
  BUSINESS_VIP_MONTHLY_PRICE_EUR,
  isBusinessAccount,
  isVipBusinessActive,
} from "./business-rules";
import { countUserActiveListings } from "./user-listing-limits";
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

  if (vip) {
    return {
      tier: "vip",
      freeLimitPerCategory: Number.POSITIVE_INFINITY,
      extraPostPriceEur: BUSINESS_EXTRA_POST_PRICE_EUR,
      canPostUnlimited: false,
      monthlyActiveCap: BUSINESS_VIP_ACTIVE_LISTING_CAP,
      vipMonthlyPriceEur: BUSINESS_VIP_MONTHLY_PRICE_EUR,
    };
  }

  return {
    tier: "standard",
    freeLimitPerCategory: BUSINESS_STANDARD_FREE_LISTINGS_PER_CATEGORY,
    extraPostPriceEur: BUSINESS_EXTRA_POST_PRICE_EUR,
    canPostUnlimited: false,
    monthlyActiveCap: BUSINESS_STANDARD_ACTIVE_LISTING_CAP,
    vipMonthlyPriceEur: BUSINESS_VIP_MONTHLY_PRICE_EUR,
  };
}

/** Active listing caps: standard 50, VIP 100. */
export async function assertBusinessPostingAllowed(user: User): Promise<void> {
  if (!isBusinessAccount(user)) return;
  const limit = isVipBusinessActive(user)
    ? BUSINESS_VIP_ACTIVE_LISTING_CAP
    : BUSINESS_STANDARD_ACTIVE_LISTING_CAP;
  const used = await countUserActiveListings(user);
  if (used < limit) return;

  const err = new Error("BUSINESS_MONTHLY_CAP") as Error & {
    used: number;
    limit: number;
    publicMessage: string;
  };
  err.used = used;
  err.limit = limit;
  err.publicMessage = `Keni arritur limitin e paketës suaj (${limit} njoftime aktive). Fshini një njoftim për të postuar përsëri.`;
  throw err;
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
