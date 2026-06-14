import { db, categoriesTable } from "@workspace/db";
import { claudeJsonCompletion, isClaudeConfigured, langLabel, type UiLang } from "./claude-client";
import { CATEGORY_CLASSIFY_GUIDE } from "./category-assistant-guide";
import { guardCategorySuggestion } from "./category-suggest-guard";
import { FEMIJE_HUB_SLUG, FEMIJE_SUGGEST_RULES } from "./femije-category-suggest-rules";
import { hubCategoryRuleMatch } from "./hub-category-suggest-rules";

export type CategorySuggestResult = {
  parent_category_id: number;
  category_id: number;
  parent_name: string;
  category_name: string;
  brand_category_id?: number;
  brand_name?: string;
  confidence: "high" | "medium" | "low";
  source: "rules" | "ai";
};

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

function normalizeText(title: string, description: string): string {
  return `${title} ${description}`.trim().toLowerCase().normalize("NFC");
}

function femijeRuleMatch(text: string, cats: CategoryRow[]): CategorySuggestResult | null {
  let best: { rule: (typeof FEMIJE_SUGGEST_RULES)[number]; weight: number } | null = null;

  for (const rule of FEMIJE_SUGGEST_RULES) {
    if (!rule.pattern.test(text)) continue;
    if (rule.unless?.test(text)) continue;
    if (!best || rule.weight > best.weight) best = { rule, weight: rule.weight };
  }

  if (!best) return null;

  const hub = cats.find((c) => c.slug === FEMIJE_HUB_SLUG && !c.parent_id);
  const group = cats.find(
    (c) => c.slug === best.rule.groupSlug && c.parent_id === hub?.id,
  );
  if (!hub || !group) return null;

  let brand: CategoryRow | undefined;
  if (best.rule.leafSlug) {
    brand = cats.find(
      (c) => c.slug === best.rule.leafSlug && c.parent_id === group.id,
    );
  }

  return {
    parent_category_id: hub.id,
    category_id: group.id,
    parent_name: hub.name,
    category_name: group.name,
    brand_category_id: brand?.id,
    brand_name: brand?.name,
    confidence: best.weight >= 13 ? "high" : "medium",
    source: "rules",
  };
}

/** Rule-based category match only — no Claude. Used by Google Vision listing analyze. */
export function matchListingCategoryFromRules(
  text: string,
  cats: CategoryRow[],
): CategorySuggestResult | null {
  return ruleMatch(text, cats);
}

function ruleMatch(text: string, cats: CategoryRow[]): CategorySuggestResult | null {
  const hub = hubCategoryRuleMatch(text, cats);
  if (hub) {
    return {
      parent_category_id: hub.parent_category_id,
      category_id: hub.category_id,
      parent_name: hub.parent_name,
      category_name: hub.category_name,
      confidence: hub.confidence,
      source: "rules",
    };
  }

  const femije = femijeRuleMatch(text, cats);
  if (femije) return femije;

  return null;
}

const AI_SYSTEM = `You classify second-hand listings for KetuJemi.com.

Your ONLY job: suggest the category that matches the PRODUCT (what the item is). City, country, and seller location are irrelevant — never use geography in your decision.

Given title + description, pick the BEST matching parent category AND the most specific subcategory (nenkategori) from the provided JSON catalog (use exact ids and names from the catalog).

${CATEGORY_CLASSIFY_GUIDE}

Reply ONLY JSON:
{"parent_category_id":number,"category_id":number,"parent_name":"...","category_name":"...","confidence":"high"|"medium"|"low"}`;

export async function suggestListingCategory(
  input: { title: string; description: string },
  lang: UiLang = "sq",
): Promise<CategorySuggestResult | null> {
  const title = input.title.trim();
  if (title.length < 3) return null;

  const text = normalizeText(title, input.description);
  const cats = await db.select().from(categoriesTable);
  const rows: CategoryRow[] = cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parent_id,
  }));

  const fromRules = ruleMatch(text, rows);
  if (fromRules) return fromRules;

  if (!isClaudeConfigured()) return null;

  const parents = rows.filter((c) => !c.parent_id);
  const catalog = parents.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    children: rows
      .filter((c) => c.parent_id === p.id)
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  }));

  try {
    const parsed = await claudeJsonCompletion<CategorySuggestResult>({
      system: AI_SYSTEM,
      user: JSON.stringify({
        language: langLabel(lang),
        title: title.slice(0, 200),
        description: input.description.trim().slice(0, 1500),
        categories: catalog,
      }),
      maxTokens: 400,
    });

    if (!parsed?.parent_category_id || !parsed?.category_id) return null;

    const parent = rows.find((c) => c.id === parsed.parent_category_id);
    const child = rows.find((c) => c.id === parsed.category_id && c.parent_id === parent?.id);
    if (!parent || !child) return null;

    const aiResult: CategorySuggestResult = {
      parent_category_id: parent.id,
      category_id: child.id,
      parent_name: parent.name,
      category_name: child.name,
      confidence:
        parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
          ? parsed.confidence
          : "low",
      source: "ai",
    };

    return guardCategorySuggestion(text, aiResult, rows);
  } catch {
    return null;
  }
}
