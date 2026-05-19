import type { User } from "@workspace/db";
import {
  BUSINESS_STANDARD_FREE_LISTINGS_PER_CATEGORY,
  BUSINESS_VIP_MONTHLY_PRICE_EUR,
  isBusinessAccount,
  isVipBusinessActive,
} from "./business-rules";

export type BusinessQuotaStatus = {
  tier: "standard" | "vip";
  /** Per parent category for standard tier; unlimited for VIP. */
  freeLimitPerCategory: number;
  canPostUnlimited: boolean;
  vipMonthlyPriceEur: number;
};

export async function getBusinessQuotaStatus(user: User): Promise<BusinessQuotaStatus> {
  const vip = isVipBusinessActive(user);

  if (vip) {
    return {
      tier: "vip",
      freeLimitPerCategory: Number.POSITIVE_INFINITY,
      canPostUnlimited: true,
      vipMonthlyPriceEur: BUSINESS_VIP_MONTHLY_PRICE_EUR,
    };
  }

  return {
    tier: "standard",
    freeLimitPerCategory: BUSINESS_STANDARD_FREE_LISTINGS_PER_CATEGORY,
    canPostUnlimited: false,
    vipMonthlyPriceEur: BUSINESS_VIP_MONTHLY_PRICE_EUR,
  };
}

/** VIP = unlimited; standard business uses per-category quota in listings route. */
export async function assertBusinessPostingAllowed(user: User): Promise<void> {
  if (!isBusinessAccount(user)) return;
  if (isVipBusinessActive(user)) return;
}
