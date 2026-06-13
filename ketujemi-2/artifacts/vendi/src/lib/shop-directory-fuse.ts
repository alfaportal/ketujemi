import Fuse from "fuse.js";
import type { ShopDirectoryListItem } from "@/components/shop-directory-card";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";
import {
  translateDirectoryCategory,
  translateDirectorySubcategory,
} from "@/lib/shop-directory-i18n";
import type { UiTranslationLocale } from "@/lib/ui-languages";
import {
  resolveShopDirectoryHubSlug,
  shopSearchTokens,
} from "../../../../lib/shop-directory-search-match";

export type ShopDirectoryFuseDoc = ShopDirectoryListItem & {
  categoryLabel: string;
  subcategoryLabel: string;
  categoryNameSq: string;
  subcategoryNameSq: string;
  categorySlug: string;
  subcategorySlug: string;
  listingCategory: string;
  description?: string | null;
  searchBlob: string;
};

function foldSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c");
}

export function buildShopDirectoryFuseDocs(
  shops: ShopDirectoryListItem[],
  locale: UiTranslationLocale,
): ShopDirectoryFuseDoc[] {
  return shops.map((s) => {
    const cat = s.directory_category_slug
      ? SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === s.directory_category_slug)
      : null;
    const sub = cat?.subcategories.find((x) => x.slug === s.directory_subcategory_slug);
    const categoryLabel = cat ? translateDirectoryCategory(cat, locale) : "";
    const subcategoryLabel = sub ? translateDirectorySubcategory(sub, locale) : "";
    const categoryNameSq = cat?.nameSq ?? "";
    const subcategoryNameSq = sub?.nameSq ?? "";
    const listingCategory = s.category?.trim() ?? "";
    const categorySlug = s.directory_category_slug ?? "";
    const subcategorySlug = s.directory_subcategory_slug ?? "";

    const searchBlob = foldSearchText(
      [
        s.shop_name,
        listingCategory,
        categoryLabel,
        subcategoryLabel,
        categoryNameSq,
        subcategoryNameSq,
        categorySlug,
        subcategorySlug,
        s.city,
        s.country,
        s.description ?? "",
      ].join(" "),
    );

    return {
      ...s,
      categoryLabel,
      subcategoryLabel,
      categoryNameSq,
      subcategoryNameSq,
      categorySlug,
      subcategorySlug,
      listingCategory,
      searchBlob,
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

  const foldedQuery = foldSearchText(q);
  const docs = buildShopDirectoryFuseDocs(shops, locale);
  const hubSlug = resolveShopDirectoryHubSlug(q);
  const tokens = shopSearchTokens(q);

  const byId = new Map<number, ShopDirectoryListItem>();

  if (hubSlug) {
    for (const s of shops) {
      if (s.directory_category_slug === hubSlug) byId.set(s.id, s);
    }
  }

  const fuse = new Fuse(docs, {
    keys: [
      { name: "shop_name", weight: 2 },
      { name: "listingCategory", weight: 1.8 },
      { name: "categoryLabel", weight: 1.6 },
      { name: "subcategoryLabel", weight: 1.5 },
      { name: "categoryNameSq", weight: 1.6 },
      { name: "subcategoryNameSq", weight: 1.4 },
      { name: "categorySlug", weight: 1.3 },
      { name: "subcategorySlug", weight: 1.2 },
      { name: "city", weight: 1 },
      { name: "country", weight: 0.8 },
      { name: "description", weight: 0.9 },
      { name: "searchBlob", weight: 1.1 },
    ],
    threshold: 0.42,
    ignoreLocation: true,
  });

  for (const r of fuse.search(foldedQuery)) {
    byId.set(r.item.id, r.item);
  }

  if (byId.size === 0 && tokens.length > 0) {
    for (const doc of docs) {
      const blob = doc.searchBlob;
      const allTokensMatch = tokens.every((t) => blob.includes(t));
      if (allTokensMatch) byId.set(doc.id, doc);
    }
  }

  if (byId.size === 0) {
    for (const doc of docs) {
      if (doc.searchBlob.includes(foldedQuery)) byId.set(doc.id, doc);
    }
  }

  return [...byId.values()];
}
