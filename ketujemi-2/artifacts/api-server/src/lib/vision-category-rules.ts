/**
 * Google Vision returns English labels — map them to marketplace category slugs.
 * Used only by the Google Vision listing-analyze pipeline (no Claude classification).
 */

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

type VisionSlugRule = {
  parentSlug: string;
  categorySlug: string;
  pattern: RegExp;
  weight: number;
  unless?: RegExp;
};

export const VISION_LABEL_RULES: VisionSlugRule[] = [
  {
    parentSlug: "telefona",
    categorySlug: "telefona-type-smartphones",
    pattern:
      /\b(mobile\s*phone|cell\s*phone|smartphone|iphone|android\s*phone|samsung\s*galaxy|handset|telefon)\b/i,
    weight: 12,
  },
  {
    parentSlug: "telefona",
    categorySlug: "telefona-type-smartphones",
    pattern: /\b(gadget|electronics|electronic\s*device|communication\s*device)\b/i,
    weight: 7,
    unless: /\b(laptop|notebook|television|\btv\b|sofa|car|automobile|refrigerator|bicycle)\b/i,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-televizore-projektor",
    pattern: /\b(television|\btv\b|oled|qled|flat\s*screen|lcd\s*tv|smart\s*tv|projektor|projector)\b/i,
    weight: 11,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-audio-zeri",
    pattern:
      /\b(speaker|headphones?|earbuds?|airpods|soundbar|bluetooth\s*speaker|jbl|bose|marshall|beats|woofer|subwoofer)\b/i,
    weight: 11,
    unless: /\b(television|\btv\b|oled|qled)\b/i,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-konzola-gaming",
    pattern: /\b(playstation|ps[345]\b|xbox|nintendo|switch\s*oled|game\s*console|gaming\s*console)\b/i,
    weight: 10,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-kamera-foto-smartwatch",
    pattern: /\b(camera|digital\s*camera|dslr|gopro|smart\s*watch|apple\s*watch|canon|nikon|fotoaparat)\b/i,
    weight: 9,
  },
  {
    parentSlug: "kompjutere-laptope",
    categorySlug: "kompj-type-laptop",
    pattern: /\b(laptop|notebook|macbook|thinkpad|chromebook|ultrabook)\b/i,
    weight: 10,
  },
  {
    parentSlug: "kompjutere-laptope",
    categorySlug: "kompj-type-desktop-pc",
    pattern: /\b(desktop|pc\s*tower|imac|workstation|gaming\s*pc)\b/i,
    weight: 9,
  },
  {
    parentSlug: "kompjutere-laptope",
    categorySlug: "kompj-type-tablete",
    pattern: /\b(tablet|ipad|galaxy\s*tab)\b/i,
    weight: 9,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-pajisje-medha-shtepiake",
    pattern:
      /\b(refrigerator|washing\s*machine|dishwasher|microwave|oven|frigorifer|lavatri[cç]e|sob[ëe])\b/i,
    weight: 9,
  },
  {
    parentSlug: "mobilje-dekorime",
    categorySlug: "mobilje-type-sallone-ulese",
    pattern: /\b(sofa|couch|armchair|chair|table|furniture|mobilje|divan)\b/i,
    weight: 9,
  },
  {
    parentSlug: "rroba-kepuce",
    categorySlug: "rroba-type-veshje-femra",
    pattern:
      /\b(dress|gown|skirt|blouse|women'?s?\s*(clothing|wear|apparel)|costume|folk\s*costume|traditional\s*clothing)\b/i,
    weight: 10,
    unless: /\b(men'?s?|boy|meshkuj)\b/i,
  },
  {
    parentSlug: "rroba-kepuce",
    categorySlug: "rroba-type-veshje-meshkuj",
    pattern: /\b(men'?s?\s*(clothing|wear|apparel)|suit|jacket|shirt|pants|trousers)\b/i,
    weight: 9,
  },
  {
    parentSlug: "rroba-kepuce",
    categorySlug: "rroba-type-kepuce",
    pattern: /\b(shoe|sneaker|boot|footwear|këpucë|kepuce)\b/i,
    weight: 9,
  },
  {
    parentSlug: "sport-outdoor",
    categorySlug: "sport-type-bicikleta",
    pattern: /\b(bicycle|bike|biciklet|cycling)\b/i,
    weight: 9,
  },
  {
    parentSlug: "vetura",
    categorySlug: "sedan",
    pattern: /\b(car|automobile|vehicle|sedan|suv|hatchback|vetur)\b/i,
    weight: 8,
    unless: /\b(motorcycle|motorbike|scooter|truck|kamion|tire|wheel)\b/i,
  },
  {
    parentSlug: "motorr-skuter",
    categorySlug: "motorr-type-sportiv",
    pattern: /\b(motorcycle|motorbike|scooter|vespa|atv|quad)\b/i,
    weight: 12,
    unless: /\b(car|automobile|sedan|suv)\b/i,
  },
  {
    parentSlug: "kamione-furgone",
    categorySlug: "kamione-type-furgone",
    pattern: /\b(van|minivan|cargo\s+van|furgon)\b/i,
    weight: 11,
    unless: /\b(car|sedan|suv)\b/i,
  },
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-fellne-goma",
    pattern: /\b(tire|tyre|wheel|rim|alloy\s+wheel)\b/i,
    weight: 12,
    unless: /\b(bicycle|bike)\b/i,
  },
  {
    parentSlug: "kafshet",
    categorySlug: "kafshet-type-qen",
    pattern: /\b(dog|puppy|canine)\b/i,
    weight: 11,
  },
  {
    parentSlug: "kafshet",
    categorySlug: "kafshet-type-mace",
    pattern: /\b(cat|kitten|feline)\b/i,
    weight: 11,
  },
  {
    parentSlug: "lokale-zyre",
    categorySlug: "lokale-type-industriale",
    pattern:
      /\b(industrial\s+building|factory|warehouse|manufacturing|corrugated|metal\s+building|metal\s+panel|hangar|shed|industrial\s+property)\b/i,
    weight: 15,
    unless: /\b(apartment|residential|flat|condo|house\s+for\s+sale|bedroom)\b/i,
  },
  {
    parentSlug: "lokale-zyre",
    categorySlug: "lokale-type-depo",
    pattern: /\b(storage\s+unit|storage\s+facility|depot)\b/i,
    weight: 10,
    unless: /\b(industrial\s+building|factory|manufacturing)\b/i,
  },
  {
    parentSlug: "banesa-shtepi",
    categorySlug: "banesa-type-apartamente-banesa",
    pattern: /\b(apartment|flat|condo|residential\s+building|bedroom|living\s+room)\b/i,
    weight: 9,
    unless: /\b(industrial|factory|warehouse|corrugated|metal\s+building|hangar)\b/i,
  },
];

export function matchVisionLabelsToCategory(
  text: string,
  cats: CategoryRow[],
): {
  parent_category_id: number;
  category_id: number;
  parent_name: string;
  category_name: string;
  confidence: "high" | "medium" | "low";
} | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  let best: { rule: VisionSlugRule; weight: number } | null = null;
  for (const rule of VISION_LABEL_RULES) {
    if (!rule.pattern.test(normalized)) continue;
    if (rule.unless?.test(normalized)) continue;
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
  };
}
