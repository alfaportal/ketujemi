import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";

export type ShopDirectoryTaxonomySubcategory = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
};

export type ShopDirectoryTaxonomyCategory = {
  id: number;
  name: string;
  emoji: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  subcategories: ShopDirectoryTaxonomySubcategory[];
};

/** Fallback kur API/DB nuk kthejnë taxonomy — përdor slug në submit. */
export function staticShopDirectoryTaxonomy(): ShopDirectoryTaxonomyCategory[] {
  return SHOP_DIRECTORY_CATEGORIES.map((cat, sort_order) => ({
    id: 0,
    name: cat.nameSq,
    emoji: cat.emoji,
    slug: cat.slug,
    image_url: null,
    sort_order,
    subcategories: cat.subcategories.map((sub) => ({
      id: 0,
      category_id: 0,
      name: sub.nameSq,
      slug: sub.slug,
    })),
  }));
}

export function isApiShopDirectoryTaxonomy(categories: ShopDirectoryTaxonomyCategory[]): boolean {
  return categories.some((c) => c.id > 0);
}

export async function fetchShopDirectoryTaxonomy(): Promise<ShopDirectoryTaxonomyCategory[]> {
  try {
    const r = await fetchWithTimeout("/api/shops/directory/taxonomy");
    if (r.ok) {
      const data = (await r.json()) as { categories?: ShopDirectoryTaxonomyCategory[] };
      if (Array.isArray(data.categories) && data.categories.length > 0 && isApiShopDirectoryTaxonomy(data.categories)) {
        return data.categories;
      }
    }
  } catch {
    /* API jo i disponueshëm — përdor fallback statik */
  }
  return staticShopDirectoryTaxonomy();
}
