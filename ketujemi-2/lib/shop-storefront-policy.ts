/**
 * Which verified shops may have a public storefront (webfaqe e vet + katalog produktesh).
 * Blocks job boards, catering/restaurants, and other non-retail directory types.
 */

/** Directory subcategories that cannot have a product storefront. */
export const SHOP_STOREFRONT_BLOCKED_SUBCATEGORY_SLUGS = new Set([
  "oferta-pune-kohe-te-plote",
  "oferta-pune-kohe-te-pjesshme-sezonale",
  "kerkoj-pune",
  "pune-jashte-vendit",
  "catering-gatim-banket",
]);

/** Listing category root slugs blocked for shop product sync (jobs, gastronomy). */
export const SHOP_PRODUCT_BLOCKED_LISTING_ROOT_SLUGS = new Set([
  "pune-sherbime",
]);

/** Max product/service tiles on the public shop storefront grid. */
export const SHOP_STOREFRONT_MAX_TILES = 8;

/** Max photos per product tile (same as marketplace listings). */
export const SHOP_STOREFRONT_MAX_PHOTOS_PER_PRODUCT = 10;

/** Max total product photos across the storefront (8 tiles × 10 photos). */
export const SHOP_STOREFRONT_MAX_PHOTOS_TOTAL =
  SHOP_STOREFRONT_MAX_TILES * SHOP_STOREFRONT_MAX_PHOTOS_PER_PRODUCT;

export type ShopDirectoryFields = {
  directory_category_slug?: string | null;
  directory_subcategory_slug?: string | null;
};

export function isShopStorefrontEligible(shop: ShopDirectoryFields): boolean {
  const sub = shop.directory_subcategory_slug?.trim();
  if (!sub) return false;
  return !SHOP_STOREFRONT_BLOCKED_SUBCATEGORY_SLUGS.has(sub);
}

export function storefrontBlockedReason(subcategorySlug: string | null | undefined): string | null {
  const sub = subcategorySlug?.trim();
  if (!sub) return "Zgjidhni kategorinë e dyqanit për të aktivizuar webfaqen.";
  if (SHOP_STOREFRONT_BLOCKED_SUBCATEGORY_SLUGS.has(sub)) {
    return "Kjo kategori (p.sh. punë ose restorant/catering) nuk mbështet webfaqe produktesh. Zgjidhni kategori shitje/shërbimi.";
  }
  return null;
}

export function filterStorefrontDirectoryCategories<
  T extends { slug: string; subcategories: { slug: string }[] },
>(categories: T[]): T[] {
  return categories
    .map((cat) => ({
      ...cat,
      subcategories: cat.subcategories.filter(
        (sub) => !SHOP_STOREFRONT_BLOCKED_SUBCATEGORY_SLUGS.has(sub.slug),
      ),
    }))
    .filter((cat) => cat.subcategories.length > 0);
}
