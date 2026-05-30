import { db, categoriesTable } from "@workspace/db";
import { claudeJsonCompletion, isClaudeConfigured, langLabel, type UiLang } from "./claude-client";
import { FEMIJE_HUB_SLUG, FEMIJE_SUGGEST_RULES } from "./femije-category-suggest-rules";

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
  slug: string;
  parent_id: number | null;
};

type SlugRule = {
  parentSlug: string;
  categorySlug: string;
  pattern: RegExp;
  /** Higher wins when multiple rules match. */
  weight: number;
  /** Skip this rule when text matches any of these (e.g. TV keywords override generic "sony"). */
  unless?: RegExp;
};

const SLUG_RULES: SlugRule[] = [
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-audio-zeri",
    pattern:
      /\b(jbl|bose|marshall|harman|beats|pioneer|altoparlant|soundbar|kufje|headphones?|earbuds?|airpods|bluetooth\s*speaker|woofer|subwoofer|pa\s*zëri|pajisje\s*zëri|audio\s*interface)\b/i,
    weight: 12,
    unless: /\b(televizor|\btv\b|oled|qled|projektor|smart\s*tv)\b/i,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-televizore-projektor",
    pattern: /\b(televizor|\btv\b|oled|qled|projektor|smart\s*tv|curved\s*tv|inch\b|\d{2}["″]\s*tv)\b/i,
    weight: 11,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-konzola-gaming",
    pattern: /\b(playstation|ps[345]\b|xbox|nintendo|switch\s*oled|konzol|gaming\s*pc)\b/i,
    weight: 10,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-kamera-foto-smartwatch",
    pattern: /\b(kamera|fotoaparat|gopro|dji|smart\s*watch|apple\s*watch|canon|nikon)\b/i,
    weight: 9,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-laptop-kompjutere",
    pattern: /\b(laptop|macbook|notebook|kompjuter|pc\s*gaming|imac|thinkpad)\b/i,
    weight: 9,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-pajisje-medha-shtepiake",
    pattern: /\b(frigorifer|lavatri[cç]e|sob[ëe]|mikroval|aspirator|pajisje\s+(te\s+)?medha)\b/i,
    weight: 9,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-klimatizim-ngrohje",
    pattern: /\b(klim|kondicion|ngrohje|fancoil|termopomp)\b/i,
    weight: 8,
  },
  {
    parentSlug: "telefona",
    categorySlug: "telefona-type-smartphones",
    pattern: /\b(iphone|samsung\s*galaxy|xiaomi|huawei|telefon|smartphone|redmi|pixel)\b/i,
    weight: 8,
  },
];

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

function ruleMatch(text: string, cats: CategoryRow[]): CategorySuggestResult | null {
  const femije = femijeRuleMatch(text, cats);
  if (femije) return femije;

  let best: { rule: SlugRule; weight: number } | null = null;

  for (const rule of SLUG_RULES) {
    if (!rule.pattern.test(text)) continue;
    if (rule.unless?.test(text)) continue;
    if (!best || rule.weight > best.weight) best = { rule, weight: rule.weight };
  }

  if (!best) return null;

  const parent = cats.find((c) => c.slug === best.rule.parentSlug && !c.parent_id);
  const child = cats.find((c) => c.slug === best.rule.categorySlug && c.parent_id === parent?.id);
  if (!parent || !child) return null;

  return {
    parent_category_id: parent.id,
    category_id: child.id,
    parent_name: parent.name,
    category_name: child.name,
    confidence: best.weight >= 10 ? "high" : "medium",
    source: "rules",
  };
}

const AI_SYSTEM = `You classify second-hand listings for KetuJemi.com.

Your ONLY job: suggest the category that matches the PRODUCT (what the item is). City, country, and seller location are irrelevant — never use geography in your decision.

Given title + description, pick the BEST matching parent category and subcategory from the provided JSON catalog (use exact ids and names from the catalog).

CRITICAL electronics rules:
- Speakers, headphones, JBL, Bose, soundbars, earbuds → "Audio & Pajisje Zëri" (slug tv-type-audio-zeri), NEVER "Televizorë & Projektorë".
- TVs, projectors, OLED/QLED → "Televizorë & Projektorë".
- PlayStation/Xbox/Nintendo → "Konzola & Gaming".

Fëmijë (baby & kids) rules:
- Strollers, car seats, baby carriers → "Karroca & Transport" under Fëmijë.
- Diapers, baby shampoo, bath → "Higjienë & Kujdes".
- Toys, dolls → "Lodra & Lojëra"; Montessori/educational → "Lodra Edukative".
- Maternity wear → "Veshje Shtatzënësie".
- When Fëmijë fits, pick the most specific sub-group from femije-grp-* slugs.

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

    return {
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
  } catch {
    return null;
  }
}
