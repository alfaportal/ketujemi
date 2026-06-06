import Fuse from "fuse.js";
import type { ShopDirectoryListItem } from "@/components/shop-directory-card";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";
import {
  translateDirectoryCategory,
  translateDirectorySubcategory,
} from "@/lib/shop-directory-i18n";
import type { UiTranslationLocale } from "@/lib/ui-languages";

export type ShopDirectoryFuseDoc = ShopDirectoryListItem & {
  categoryLabel: string;
  subcategoryLabel: string;
  description?: string | null;
};

export function buildShopDirectoryFuseDocs(
  shops: ShopDirectoryListItem[],
  locale: UiTranslationLocale,
): ShopDirectoryFuseDoc[] {
  return shops.map((s) => {
    const cat = s.directory_category_slug
      ? SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === s.directory_category_slug)
      : null;
    const sub = cat?.subcategories.find((x) => x.slug === s.directory_subcategory_slug);
    return {
      ...s,
      categoryLabel: cat ? translateDirectoryCategory(cat, locale) : "",
      subcategoryLabel: sub ? translateDirectorySubcategory(sub, locale) : "",
    };
  });
}

export function filterShopsByQuery(
  shops: ShopDirectoryListItem[],
  query: string,
  locale: UiTranslationLocale,
): ShopDirectoryListItem[] {
  const q = query.trim();
  if (!q) return shops;

  const fuse = new Fuse(buildShopDirectoryFuseDocs(shops, locale), {
    keys: ["shop_name", "categoryLabel", "subcategoryLabel", "city", "country", "description"],
    threshold: 0.3,
    ignoreLocation: true,
  });

  return fuse.search(q).map((r) => r.item);
}
