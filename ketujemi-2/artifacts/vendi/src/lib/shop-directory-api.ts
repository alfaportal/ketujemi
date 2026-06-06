import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

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

export async function fetchShopDirectoryTaxonomy(): Promise<ShopDirectoryTaxonomyCategory[]> {
  const r = await fetchWithTimeout("/api/shops/directory/taxonomy");
  if (!r.ok) return [];
  const data = (await r.json()) as { categories?: ShopDirectoryTaxonomyCategory[] };
  return Array.isArray(data.categories) ? data.categories : [];
}
