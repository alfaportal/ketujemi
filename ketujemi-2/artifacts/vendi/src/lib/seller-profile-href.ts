/** Fields needed to link to a seller's public listings (detail API + feed rows). */
export type ListingSellerLinkFields = {
  seller_profile_href?: string | null;
  shop_id?: number | null;
  user_id?: number | null;
};

/**
 * Resolve profile URL for listing detail sidebar.
 * Prefer API `seller_profile_href`; fall back to shop/user ids so stale React Query
 * cache (from before the field existed) still renders a working link.
 */
export function sellerProfileHrefFromListing(listing: ListingSellerLinkFields): string | null {
  const fromApi = listing.seller_profile_href?.trim();
  if (fromApi) return fromApi;

  const shopId = listing.shop_id;
  if (shopId != null && shopId > 0) return `/dyqani/${shopId}`;

  const userId = listing.user_id;
  if (userId != null && userId > 0) return `/listings?user_id=${userId}`;

  return null;
}
