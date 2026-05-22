import { useLayoutEffect } from "react";
import {
  lastRouteChangeWasPop,
  markScrollPosition,
  scheduleRestoreScrollY,
  scrollLocationKey,
} from "@/lib/scroll-restoration";

/** Shared category URL helpers — single source of truth for all category links. */

/** Backup scroll when drilling subcategory (restored on back if URL cache misses). */
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

/** Navigate to a category; stash parent scroll so back returns where you were. */
export function navigateToCategory(
  setLocation: (path: string) => void,
  toCategoryId: number,
  fromCategoryId?: number | null,
) {
  if (fromCategoryId != null && Number.isFinite(fromCategoryId)) {
    stashCategoryScroll(fromCategoryId);
    markScrollPosition(scrollLocationKey(window.location.pathname), window.scrollY);
  }
  categoryScrollRestore.delete(toCategoryId);
  setLocation(categoryPath(toCategoryId));
}

/**
 * Category drill-down: forward → top; back (browser or UI) → restore prior scroll.
 * Works with useScrollRestoration (URL keys) — never forces top on popstate.
 */
export function useCategoryScroll(categoryId: number) {
  useLayoutEffect(() => {
    if (!Number.isFinite(categoryId)) return;

    const isPop = lastRouteChangeWasPop;

    if (isPop) {
      const stashed = takeCategoryScroll(categoryId);
      if (stashed != null) {
        return scheduleRestoreScrollY(stashed);
      }
      return;
    }

    const stashed = takeCategoryScroll(categoryId);
    if (stashed != null) {
      return scheduleRestoreScrollY(stashed);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const timers = [0, 50].map((ms) =>
      window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [categoryId]);
}
