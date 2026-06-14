/**
 * Patundshmëri-specific guard (industrial vs residential).
 * Keyword rules live in hub-category-suggest-rules.ts.
 */
import {
  PATUNDSHMERI_APARTMENT_PATTERN,
  PATUNDSHMERI_INDUSTRIAL_PATTERN,
  hubCategoryRuleMatch,
} from "./hub-category-suggest-rules";

export {
  PATUNDSHMERI_INDUSTRIAL_PATTERN,
  PATUNDSHMERI_APARTMENT_PATTERN,
};

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export type PatundshmeriRuleMatch = {
  parent_category_id: number;
  category_id: number;
  parent_name: string;
  category_name: string;
  confidence: "high" | "medium" | "low";
};

const BANESA_PARENT_SLUG = "banesa-shtepi";
const APARTMENT_CATEGORY_SLUG = "banesa-type-apartamente-banesa";

/** @deprecated Use hubCategoryRuleMatch — kept for imports. */
export function patundshmeriRuleMatch(
  text: string,
  cats: CategoryRow[],
): PatundshmeriRuleMatch | null {
  const hit = hubCategoryRuleMatch(text, cats);
  if (!hit) return null;
  if (hit.parentSlug !== "lokale-zyre" && hit.parentSlug !== "banesa-shtepi") {
    return null;
  }
  return hit;
}

/** Reject picks that put industrial property under residential subcategories. */
export function guardPatundshmeriCategory<T extends PatundshmeriRuleMatch & { source?: "rules" | "ai" }>(
  text: string,
  result: T,
  cats: CategoryRow[],
): T {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return result;

  const parent = cats.find((c) => c.id === result.parent_category_id);
  const child = cats.find((c) => c.id === result.category_id);
  const isResidentialPick =
    parent?.slug === BANESA_PARENT_SLUG ||
    child?.slug === APARTMENT_CATEGORY_SLUG ||
    child?.slug === "banesa-type-dhoma-qira";

  const industrialText =
    PATUNDSHMERI_INDUSTRIAL_PATTERN.test(normalized) &&
    !PATUNDSHMERI_APARTMENT_PATTERN.test(normalized);

  if (!industrialText || !isResidentialPick) return result;

  const override = hubCategoryRuleMatch(normalized, cats);
  if (!override || override.categorySlug !== "lokale-type-industriale") return result;

  return {
    ...result,
    parent_category_id: override.parent_category_id,
    category_id: override.category_id,
    parent_name: override.parent_name,
    category_name: override.category_name,
    confidence: "high",
    source: "rules",
  };
}
