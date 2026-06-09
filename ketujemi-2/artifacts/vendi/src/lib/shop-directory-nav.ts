import type { ShopDirectoryListItem } from "@/components/shop-directory-card";

/** When a category has exactly one shop, the shop-count link goes to the shop profile. */
export function shopDirectoryMainGridCountHref(
  categorySlug: string,
  shops: ShopDirectoryListItem[],
  count: number,
): string | null {
  if (count <= 0) return null;
  const inCategory = shops.filter((s) => s.directory_category_slug === categorySlug);
  if (inCategory.length === 1) return `/dyqani/${inCategory[0].id}`;
  return `/dyqanet/${categorySlug}`;
}

export function singleShopHref(shops: ShopDirectoryListItem[]): string | null {
  if (shops.length !== 1) return null;
  return `/dyqani/${shops[0].id}`;
}
