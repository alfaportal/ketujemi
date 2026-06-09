import type { ShopDirectoryListItem } from "@/components/shop-directory-card";

/** When a category has exactly one shop, link straight to the shop profile. */
export function shopDirectoryCategoryHref(
  categorySlug: string,
  shops: ShopDirectoryListItem[],
): string {
  const inCategory = shops.filter((s) => s.directory_category_slug === categorySlug);
  if (inCategory.length === 1) return `/dyqani/${inCategory[0].id}`;
  return `/dyqanet/${categorySlug}`;
}

export function shopDirectorySubcategoryHref(
  categorySlug: string,
  subcategorySlug: string,
  shops: ShopDirectoryListItem[],
): string {
  const inSub = shops.filter(
    (s) =>
      s.directory_category_slug === categorySlug &&
      s.directory_subcategory_slug === subcategorySlug,
  );
  if (inSub.length === 1) return `/dyqani/${inSub[0].id}`;
  return `/dyqanet/${categorySlug}/${subcategorySlug}`;
}

export function singleShopHref(shops: ShopDirectoryListItem[]): string | null {
  if (shops.length !== 1) return null;
  return `/dyqani/${shops[0].id}`;
}
