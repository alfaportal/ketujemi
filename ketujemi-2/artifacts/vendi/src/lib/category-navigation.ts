import { useLayoutEffect } from "react";
import { PARENT_CATEGORY_SLUG_ORDER } from "@/lib/parent-category-slugs";
import {
  getScrollPosition,
  lastRouteChangeWasPop,
  markScrollPosition,
  scheduleRestoreScrollY,
  scrollLocationKey,
} from "@/lib/scroll-restoration";

/** Anchor after hero — filters / picker / Kthehu (not page top). */
export const CATEGORY_FOCUS_ELEMENT_ID = "category-focus";

const CATEGORY_FOCUS_SCROLL_MARGIN = 72;

export type CategoryScrollIntent = "focus" | "restore";

let pendingCategoryScrollIntent: CategoryScrollIntent | null = null;

export function consumeCategoryScrollIntent(): CategoryScrollIntent | null {
  const intent = pendingCategoryScrollIntent;
  pendingCategoryScrollIntent = null;
  return intent;
}

function measureCategoryFocusScrollY(): number | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById(CATEGORY_FOCUS_ELEMENT_ID);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY - CATEGORY_FOCUS_SCROLL_MARGIN;
  return Math.max(0, top);
}

/** Scroll to picker/filters block (below hero), with retries while layout settles. */
export function scheduleScrollToCategoryFocus(): () => void {
  const apply = () => {
    const y = measureCategoryFocusScrollY();
    if (y != null) scheduleRestoreScrollY(y);
  };
  apply();
  const timers: ReturnType<typeof setTimeout>[] = [];
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
  for (const ms of [50, 150, 350, 600, 900]) {
    timers.push(window.setTimeout(apply, ms));
  }
  return () => timers.forEach(clearTimeout);
}

/** Shared category URL helpers — single source of truth for all category links. */

/** Backup scroll when drilling subcategory (restored on back if URL cache misses). */
const categoryScrollRestore = new Map<number, number>();

export type CategoryRef = {
  id: number;
  slug?: string | null;
};

/** Legacy or mistyped slugs → canonical DB slug. */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  "motor-skuter": "motorr-skuter",
  "motorr-skuter": "motorr-skuter",
  "kompjuter-laptop": "kompjutere-laptope",
  "kompjutere-laptop": "kompjutere-laptope",
  "kompjutere-laptope": "kompjutere-laptope",
  "mobilje-dekorim": "mobilje-dekorime",
  "mobilje-dekorime": "mobilje-dekorime",
  "banesa-shtepi": "banesa-shtepi",
  "tv-elektronike": "tv-elektronike",
  "auto-pjese": "auto-pjese",
  "sport-outdoor": "sport-outdoor",
  "pune-sherbime": "pune-sherbime",
  "ndertim-instalime": "ndertim-instalime",
  "bujqesi-blegtori": "bujqesi-blegtori",
  "arsim-kurse": "arsim-kurse",
  "muzike-hobby": "muzike-hobby",
  fehmije: "femije",
  femije: "femije",
  vetura: "vetura",
  telefona: "telefona",
  kafshet: "kafshet",
  "kerkoj-te-blej": "kerkoj-te-blej",
  "dhurata-falas": "dhurata-falas",
  "lokale-zyre": "lokale-zyre",
  "kamione-furgone": "kamione-furgone",
  "rroba-kepuce": "rroba-kepuce",
};

const ROOT_SLUG_SET = new Set<string>(PARENT_CATEGORY_SLUG_ORDER);

export function normalizeCategorySegment(segment: string | undefined): string {
  let raw = (segment ?? "").trim();
  if (!raw) return "";
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  return raw;
}

function resolveAliasSlug(segment: string): string {
  const lower = segment.toLowerCase();
  return CATEGORY_SLUG_ALIASES[lower] ?? lower;
}

/** Build a client route path for a category (prefer slug for stable URLs). */
export function categoryPath(
  categoryOrId: number | CategoryRef,
  slugOverride?: string | null,
): string {
  if (typeof categoryOrId === "object" && categoryOrId != null) {
    const id = Number(categoryOrId.id);
    const slug = (slugOverride ?? categoryOrId.slug)?.trim();
    if (slug) return `/categories/${encodeURIComponent(slug)}`;
    if (Number.isFinite(id) && id > 0) return `/categories/${id}`;
    return "/";
  }

  const id = Number(categoryOrId);
  const slug = slugOverride?.trim();
  if (slug) return `/categories/${encodeURIComponent(slug)}`;
  if (Number.isFinite(id) && id > 0) return `/categories/${id}`;
  return "/";
}

/** Resolve `/categories/:segment` to a numeric category id (id or slug). */
export function resolveCategoryId(
  segment: string | undefined,
  categories: readonly CategoryRef[] | undefined,
): number | null {
  const raw = normalizeCategorySegment(segment);
  if (!raw) return null;

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && asNumber > 0 && String(asNumber) === raw) {
    const byId = categories?.find((c) => Number(c.id) === asNumber);
    return byId?.id ?? asNumber;
  }

  const canonicalSlug = resolveAliasSlug(raw);
  const bySlug = categories?.find(
    (c) => (c.slug?.trim().toLowerCase() ?? "") === canonicalSlug,
  );
  return bySlug?.id ?? null;
}

/** True when categories are loaded and the segment does not match any category. */
export function isUnknownCategorySegment(
  segment: string | undefined,
  categories: readonly CategoryRef[] | undefined,
): boolean {
  const raw = normalizeCategorySegment(segment);
  if (!raw || !categories?.length) return false;
  return resolveCategoryId(raw, categories) === null;
}

/** Canonical slug for URL bar (numeric segment → slug when known). */
export function canonicalCategorySegment(
  segment: string | undefined,
  categories: readonly CategoryRef[] | undefined,
): string | null {
  const raw = normalizeCategorySegment(segment);
  if (!raw || !categories?.length) return null;

  const id = resolveCategoryId(raw, categories);
  if (id == null) return null;

  const row = categories.find((c) => Number(c.id) === Number(id));
  const slug = row?.slug?.trim();
  if (slug) return slug;
  return /^\d+$/.test(raw) ? raw : null;
}

export function isRootCategorySlug(slug: string | null | undefined): boolean {
  const s = slug?.trim().toLowerCase() ?? "";
  return s.length > 0 && ROOT_SLUG_SET.has(s);
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

type SetLocation = (
  path: string,
  options?: { replace?: boolean },
) => void;

/** Sport & Outdoor hub card → type subcategory (by id or canonical slug). */
export function navigateToSportType(
  setLocation: SetLocation,
  categories: readonly CategoryRef[],
  hubId: number,
  sportTypeSlug: string,
  fromCategoryId: number,
) {
  const row = categories.find(
    (c) => Number(c.parent_id) === Number(hubId) && c.slug === sportTypeSlug,
  );
  if (row?.id) {
    navigateToCategory(setLocation, row.id, fromCategoryId, categories);
    return;
  }
  stashCategoryScroll(fromCategoryId);
  markScrollPosition(scrollLocationKey(window.location.pathname), window.scrollY);
  pendingCategoryScrollIntent = "focus";
  setLocation(categoryPath(0, sportTypeSlug));
}

/** Navigate to a category; stash parent scroll so back returns where you were. */
export function navigateToCategory(
  setLocation: SetLocation,
  toCategoryId: number,
  fromCategoryId?: number | null,
  categories?: readonly CategoryRef[],
) {
  if (!Number.isFinite(toCategoryId) || toCategoryId <= 0) return;

  if (fromCategoryId != null && Number.isFinite(fromCategoryId)) {
    stashCategoryScroll(fromCategoryId);
    markScrollPosition(scrollLocationKey(window.location.pathname), window.scrollY);
  }
  categoryScrollRestore.delete(toCategoryId);
  pendingCategoryScrollIntent = "focus";

  const row = categories?.find((c) => Number(c.id) === Number(toCategoryId));
  setLocation(categoryPath(row ?? toCategoryId));
}

/**
 * Explicit back target for category drill-down (hub → type → leaf).
 * Root hub (no parent) → homepage.
 */
export function resolveCategoryBackPath(options: {
  currentCategory: CategoryRef;
  parentCategory: CategoryRef | null;
  /** Sport Outdoor leaf step (?pajisja=) — back drops the query on the same type page. */
  sportDeviceActive?: boolean;
}): string {
  const { currentCategory, parentCategory, sportDeviceActive } = options;
  if (sportDeviceActive) return categoryPath(currentCategory);
  if (parentCategory) return categoryPath(parentCategory);
  return "/";
}

/** UI "Kthehu" — parent hub/type, or homepage at root hub. */
export function navigateCategoryBack(
  setLocation: SetLocation,
  options: {
    currentCategory: CategoryRef;
    parentCategory: CategoryRef | null;
    sportDeviceActive?: boolean;
  },
) {
  const currentId = Number(options.currentCategory.id);
  if (options.sportDeviceActive && Number.isFinite(currentId)) {
    stashCategoryScroll(currentId);
  }
  markScrollPosition(scrollLocationKey(window.location.pathname), window.scrollY);
  pendingCategoryScrollIntent = "restore";
  setLocation(resolveCategoryBackPath(options));
}

/**
 * Category pages: forward → scroll to #category-focus (picker/filters, not hero top).
 * Back (Kthehu or browser) → restore prior scrollY. Global hook skips /categories/* top reset.
 */
export function useCategoryScroll(categoryId: number) {
  useLayoutEffect(() => {
    if (!Number.isFinite(categoryId)) return;

    const intent = consumeCategoryScrollIntent();
    const isPop = lastRouteChangeWasPop;

    if (intent === "restore" || isPop) {
      const stashed = takeCategoryScroll(categoryId);
      if (stashed != null) {
        return scheduleRestoreScrollY(stashed);
      }
      if (isPop || intent === "restore") {
        const saved = getScrollPosition(scrollLocationKey(window.location.pathname));
        if (saved != null) {
          return scheduleRestoreScrollY(saved);
        }
      }
      if (intent === "restore") return;
    }

    return scheduleScrollToCategoryFocus();
  }, [categoryId]);
}
