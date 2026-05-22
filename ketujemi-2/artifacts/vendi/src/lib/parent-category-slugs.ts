/** Top-level marketplace categories (seeded parent slugs). */
export const PARENT_CATEGORY_SLUG_ORDER = [
  "vetura",
  "motorr-skuter",
  "kamione-furgone",
  "auto-pjese",
  "banesa-shtepi",
  "lokale-zyre",
  "telefona",
  "kompjutere-laptope",
  "tv-elektronike",
  "mobilje-dekorime",
  "rroba-kepuce",
  "femije",
  "sport-outdoor",
  "pune-sherbime",
  "bujqesi-blegtori",
  "arsim-kurse",
  "muzike-hobby",
  "kafshet",
] as const;

const PARENT_SLUG_SET = new Set<string>(PARENT_CATEGORY_SLUG_ORDER);

export function isRootCategory(cat: {
  id?: number | null;
  parent_id?: number | null;
  slug?: string | null;
}): boolean {
  if (cat.id == null || Number(cat.id) <= 0) return false;
  const slug = cat.slug?.trim();
  if (slug && PARENT_SLUG_SET.has(slug)) return true;
  return cat.parent_id == null;
}

export function sortRootCategories<T extends { slug?: string | null }>(items: T[]): T[] {
  const rank = new Map(PARENT_CATEGORY_SLUG_ORDER.map((s, i) => [s, i]));
  return [...items].sort(
    (a, b) =>
      (rank.get((a.slug?.trim() ?? "") as (typeof PARENT_CATEGORY_SLUG_ORDER)[number]) ?? 999) -
      (rank.get((b.slug?.trim() ?? "") as (typeof PARENT_CATEGORY_SLUG_ORDER)[number]) ?? 999),
  );
}
