/** Fields needed to link to a seller's public listings (detail API + feed rows). */
export type ListingSellerLinkFields = {
  seller_profile_href?: string | null;
  shop_id?: number | null;
  shop_slug?: string | null;
  user_id?: number | null;
};

/**
 * Resolve profile URL for listing detail sidebar.
 * Prefer API `seller_profile_href`; fall back to shop slug/id or user id.
 */
export function sellerProfileHrefFromListing(listing: ListingSellerLinkFields): string | null {
  const fromApi = listing.seller_profile_href?.trim();
  if (fromApi) return fromApi;

  const shopSlug = listing.shop_slug?.trim();
  const shopId = listing.shop_id;
  if (shopSlug) return `/dyqani/${shopSlug}`;
  if (shopId != null && shopId > 0) return `/dyqani/${shopId}`;

  const userId = listing.user_id;
  if (userId != null && userId > 0) return `/listings?user_id=${userId}`;

  return null;
}
