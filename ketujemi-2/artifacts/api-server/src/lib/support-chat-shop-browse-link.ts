import {
  SHOP_DIRECTORY_CATEGORIES,
  LISTING_PARENT_SLUG_TO_DIRECTORY,
} from "../../../../lib/shop-directory-taxonomy.js";
import { resolveShopDirectoryHubSlug } from "../../../../lib/shop-directory-search-match.js";

export type ShopDirectoryRouteMatch = {
  categorySlug: string;
  subcategorySlug?: string;
};

const SHOP_INTENT_RE =
  /\b(dyqan|dyqani|dyqane|dyqanet|shitore|shitoret|shop|shops|store|stores|prodavnic|prodavnica|radnj|radnja|ducan|dućan|biznes\s+lokal)\b/i;

function foldForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isShopBrowseIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return SHOP_INTENT_RE.test(t) || /\bdyqanet\b/i.test(t);
}

export function stripShopIntentWords(text: string): string {
  return foldForMatch(
    text.replace(
      /\b(dyqan|dyqani|dyqane|dyqanet|shitore|shitoret|shop|shops|store|stores|prodavnic[a]?\b|radnj[a]?\b|ducan|dućan|biznes\s+lokal)\b/gi,
      " ",
    ),
  );
}

function significantTokens(folded: string): string[] {
  return folded.split(/\s+/).filter((t) => t.length >= 3);
}

function scoreSubcategoryMatch(folded: string, categorySlug: string, subSlug: string, nameSq: string): number {
  const subFolded = foldForMatch(subSlug.replace(/-/g, " "));
  const nameFolded = foldForMatch(nameSq);
  let score = 0;

  if (subFolded.length >= 4 && folded.includes(subFolded)) score += subFolded.length + 40;
  if (nameFolded.length >= 4 && folded.includes(nameFolded)) score += nameFolded.length + 50;

  const slugTokens = subSlug.split("-").filter((t) => t.length >= 4);
  let tokenHits = 0;
  for (const token of slugTokens) {
    if (folded.includes(token)) tokenHits++;
  }
  if (tokenHits > 0 && tokenHits >= Math.min(2, slugTokens.length)) {
    score += tokenHits * 12;
  }

  const nameTokens = significantTokens(nameFolded).filter((t) => t.length >= 4);
  for (const token of nameTokens) {
    if (folded.includes(token)) score += 8;
  }

  if (score > 0) score += categorySlug.length;
  return score;
}

function bestSubcategoryInCategory(
  folded: string,
  categorySlug: string,
): { subcategorySlug: string; score: number } | null {
  const cat = SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return null;

  let best: { subcategorySlug: string; score: number } | null = null;
  for (const sub of cat.subcategories) {
    const score = scoreSubcategoryMatch(folded, categorySlug, sub.slug, sub.nameSq);
    if (score < 20) continue;
    if (!best || score > best.score) {
      best = { subcategorySlug: sub.slug, score };
    }
  }
  return best;
}

function bestSubcategoryGlobal(folded: string): ShopDirectoryRouteMatch | null {
  let best: { categorySlug: string; subcategorySlug: string; score: number } | null = null;

  for (const cat of SHOP_DIRECTORY_CATEGORIES) {
    for (const sub of cat.subcategories) {
      const score = scoreSubcategoryMatch(folded, cat.slug, sub.slug, sub.nameSq);
      if (score < 24) continue;
      if (!best || score > best.score) {
        best = { categorySlug: cat.slug, subcategorySlug: sub.slug, score };
      }
    }
  }

  if (!best) return null;
  return { categorySlug: best.categorySlug, subcategorySlug: best.subcategorySlug };
}

function bestCategoryOnly(folded: string): ShopDirectoryRouteMatch | null {
  let best: { categorySlug: string; score: number } | null = null;

  for (const cat of SHOP_DIRECTORY_CATEGORIES) {
    const nameFolded = foldForMatch(cat.nameSq);
    const slugFolded = foldForMatch(cat.slug.replace(/-/g, " "));
    let score = 0;
    if (slugFolded.length >= 4 && folded.includes(slugFolded)) score += slugFolded.length + 30;
    if (nameFolded.length >= 4 && folded.includes(nameFolded)) score += nameFolded.length + 35;
    for (const token of cat.slug.split("-").filter((t) => t.length >= 5)) {
      if (folded.includes(token)) score += 10;
    }
    if (score < 18) continue;
    if (!best || score > best.score) best = { categorySlug: cat.slug, score };
  }

  return best ? { categorySlug: best.categorySlug } : null;
}

/** Map free text to /dyqanet/{category}/{subcategory?} */
export function matchShopDirectoryRoute(text: string): ShopDirectoryRouteMatch | null {
  const folded = stripShopIntentWords(text);
  if (!folded) return null;

  const globalSub = bestSubcategoryGlobal(folded);
  if (globalSub) return globalSub;

  const hubSlug = resolveShopDirectoryHubSlug(folded);
  if (hubSlug) {
    const sub = bestSubcategoryInCategory(folded, hubSlug);
    if (sub) return { categorySlug: hubSlug, subcategorySlug: sub.subcategorySlug };
    return { categorySlug: hubSlug };
  }

  const categoryOnly = bestCategoryOnly(folded);
  if (categoryOnly) return categoryOnly;

  return null;
}

/** Listing hub slug → shop directory category (when user says «dyqan vetura»). */
export function shopRouteFromListingCategoryId(listingCategoryId: string): ShopDirectoryRouteMatch | null {
  const dirSlug = LISTING_PARENT_SLUG_TO_DIRECTORY[listingCategoryId];
  if (!dirSlug) return null;
  return { categorySlug: dirSlug };
}

export function shopDirectoryHref(match: ShopDirectoryRouteMatch | null): string {
  if (!match) return "/dyqanet";
  if (match.subcategorySlug) {
    return `/dyqanet/${match.categorySlug}/${match.subcategorySlug}`;
  }
  return `/dyqanet/${match.categorySlug}`;
}
