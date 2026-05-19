/** Shared category URL helpers — single source of truth for all category links. */

export type CategoryRef = {
  id: number;
  slug?: string | null;
};

/** Build a client route path for a category (numeric id). */
export function categoryPath(categoryId: number): string {
  return `/categories/${categoryId}`;
}

/** Resolve `/categories/:segment` to a numeric category id (id or slug). */
export function resolveCategoryId(
  segment: string | undefined,
  categories: readonly CategoryRef[] | undefined,
): number | null {
  const raw = (segment ?? "").trim();
  if (!raw) return null;

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && asNumber > 0 && String(asNumber) === raw) {
    return asNumber;
  }

  const bySlug = categories?.find((c) => c.slug === raw);
  return bySlug?.id ?? null;
}

/** True when categories are loaded and the segment does not match any category. */
export function isUnknownCategorySegment(
  segment: string | undefined,
  categories: readonly CategoryRef[] | undefined,
): boolean {
  const raw = (segment ?? "").trim();
  if (!raw || !categories?.length) return false;
  return resolveCategoryId(raw, categories) === null;
}
