import { useEffect, useLayoutEffect, useRef } from "react";

/** Shared category URL helpers — single source of truth for all category links. */

/** In-memory scroll positions when drilling into a subcategory (restored on back). */
const categoryScrollRestore = new Map<number, number>();

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

/** Remember scroll position before opening a child category. */
export function stashCategoryScroll(categoryId: number) {
  if (!Number.isFinite(categoryId)) return;
  categoryScrollRestore.set(categoryId, window.scrollY);
}

function takeCategoryScroll(categoryId: number): number | null {
  const y = categoryScrollRestore.get(categoryId);
  if (y == null) return null;
  categoryScrollRestore.delete(categoryId);
  return y;
}

/** Navigate to a category; optionally restore parent scroll when returning. */
export function navigateToCategory(
  setLocation: (path: string) => void,
  toCategoryId: number,
  fromCategoryId?: number | null,
) {
  if (fromCategoryId != null && Number.isFinite(fromCategoryId)) {
    stashCategoryScroll(fromCategoryId);
  }
  // Subcategory must always open at the top, never reuse an old saved position.
  categoryScrollRestore.delete(toCategoryId);
  setLocation(categoryPath(toCategoryId));
}

function applyScrollY(top: number) {
  window.scrollTo({ top, left: 0, behavior: "auto" });
}

/**
 * On category change: scroll to top for new visits (incl. subcategories), or
 * restore position when returning to a parent category.
 */
export function useCategoryScroll(
  categoryId: number,
  options?: { contentReady?: boolean },
) {
  const restoredRef = useRef(false);

  useLayoutEffect(() => {
    if (!Number.isFinite(categoryId)) return;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const saved = takeCategoryScroll(categoryId);
    restoredRef.current = saved != null;
    const top = saved ?? 0;

    applyScrollY(top);
    requestAnimationFrame(() => applyScrollY(top));

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, [categoryId]);

  // After listings/filters render, keep subcategory pages at the top (not on listings).
  useEffect(() => {
    if (!Number.isFinite(categoryId)) return;
    if (restoredRef.current) return;
    if (options?.contentReady === false) return;

    const top = 0;
    applyScrollY(top);
    const t1 = window.setTimeout(() => applyScrollY(top), 0);
    const t2 = window.setTimeout(() => applyScrollY(top), 120);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [categoryId, options?.contentReady]);
}
