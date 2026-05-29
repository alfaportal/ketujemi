/** Must match server `TOP_PACKAGES` in listing-top.ts */
export type TopPackageId = "s" | "m" | "l";

export type TopListingPurpose = "top_listing_s" | "top_listing_m" | "top_listing_l";

export type TopPackagePublic = {
  id: TopPackageId;
  purpose: TopListingPurpose;
  priceEur: number;
  days: number;
  label: string;
};

export const TOP_PACKAGES_PUBLIC: TopPackagePublic[] = [
  { id: "s", purpose: "top_listing_s", priceEur: 2, days: 4, label: "4 ditë" },
  { id: "m", purpose: "top_listing_m", priceEur: 5, days: 15, label: "15 ditë" },
  { id: "l", purpose: "top_listing_l", priceEur: 8, days: 30, label: "30 ditë" },
];

export function isTopListingPurpose(purpose: string): purpose is TopListingPurpose {
  return purpose === "top_listing_s" || purpose === "top_listing_m" || purpose === "top_listing_l";
}
