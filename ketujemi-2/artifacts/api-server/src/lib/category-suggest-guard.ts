import {
  guardPatundshmeriCategory,
  type PatundshmeriRuleMatch,
} from "./patundshmeri-category-suggest-rules";
import { hubCategoryRuleMatch } from "./hub-category-suggest-rules";

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export type GuardableCategoryResult = PatundshmeriRuleMatch & {
  source?: "rules" | "ai";
};

/**
 * Post-AI guard: patundshmëri-specific fixes + universal high-confidence rule override.
 */
export function guardCategorySuggestion<T extends GuardableCategoryResult>(
  text: string,
  result: T,
  cats: CategoryRow[],
): T {
  let guarded = guardPatundshmeriCategory(text, result, cats);

  if (guarded.source === "rules" && guarded !== result) {
    return guarded;
  }

  const ruleHit = hubCategoryRuleMatch(text, cats);
  if (!ruleHit || ruleHit.confidence !== "high") return guarded;

  const sameParent = ruleHit.parent_category_id === guarded.parent_category_id;
  const sameChild = ruleHit.category_id === guarded.category_id;
  if (sameParent && sameChild) return guarded;

  // Override AI or weak picks when rules are confident
  if (result.source === "ai" || !sameParent) {
    return {
      ...guarded,
      parent_category_id: ruleHit.parent_category_id,
      category_id: ruleHit.category_id,
      parent_name: ruleHit.parent_name,
      category_name: ruleHit.category_name,
      confidence: "high",
      source: "rules",
    };
  }

  return guarded;
}
