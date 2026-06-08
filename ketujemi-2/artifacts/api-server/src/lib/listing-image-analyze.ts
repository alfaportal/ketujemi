import { db, categoriesTable } from "@workspace/db";
import { claudeJsonCompletion, claudeVisionJsonCompletionFromBase64, isClaudeConfigured } from "./claude-client";
import {
  detectImageLabels,
  formatVisionDetectResult,
  isGoogleVisionConfigured,
  type GoogleVisionDetectResult,
} from "./google-vision-client";
import { suggestListingCategory } from "./listing-category-suggest";

export type ListingImageAnalyzeResult = {
  parent_category_id: number;
  category_id: number;
  brand_category_id?: number;
  parent_name: string;
  category_name: string;
  brand_name?: string;
  title: string;
  description: string;
  confidence: "high" | "medium" | "low";
};

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
};

type VisionAiPayload = {
  parent_category_id?: number;
  category_id?: number;
  brand_category_id?: number | null;
  title?: string;
  description?: string;
  confidence?: "high" | "medium" | "low";
};

type CategoryPickPayload = {
  parent_category_id?: number;
  category_id?: number;
  brand_category_id?: number | null;
  confidence?: "high" | "medium" | "low";
};

type CopyPayload = {
  title?: string;
  description?: string;
  confidence?: "high" | "medium" | "low";
};

/** Parents that must never be auto-selected from a product photo. */
const EXCLUDED_PARENT_SLUGS = new Set(["kerkoj-te-blej", "dhurata-falas"]);

const CATEGORY_FROM_LABELS_SYSTEM = `You classify second-hand listings for KetuJemi.com from Google Vision labels (NOT from an image).

Given detected labels/objects, pick the BEST matching categories from the JSON catalog. Use exact numeric ids only.

═══ CATEGORY ID RULES ═══
parent_category_id = top-level hub (root in catalog)
category_id = DIRECT child of that parent (required when parent has children)
brand_category_id = deepest leaf when 3+ levels exist; null otherwise

═══ VISUAL LABEL → PARENT HUB (exact catalog names) ═══
Clothing, shoes, costumes → «Rroba & Këpucë» (NEVER Muzikë & Hobby for clothing)
Cars → «Vetura» | Motorcycles → «Motorr & Skuter» | Trucks → «Kamionë & Furgonë»
Car parts, tires → «Auto Pjesë»
Phones → «Telefona» (iPhone/Apple/Samsung → brand child when visible)
Laptops/PCs → «Kompjuterë & Laptopë»
TVs, speakers, cameras, gaming → «Elektronikë & Pajisje Shtëpiake»
Furniture → «Mobilje & Dekorime»
Baby/toys → «Fëmijë»
Sports, bicycles → «Sport & Outdoor»
Pets → «Kafshë»
Musical instruments, art supplies → «Muzikë & Hobby» ONLY for those items

Reply ONLY JSON:
{"parent_category_id":number,"category_id":number,"brand_category_id":number|null,"confidence":"high"|"medium"|"low"}`;

const COPY_FROM_LABELS_SYSTEM = `You write Albanian (sq) listing copy for KetuJemi.com second-hand marketplace.

You receive Google Vision labels and the already-chosen category. Write based on what was detected — do NOT invent features not suggested by the labels.

title: 5–80 chars, product-focused (e.g. "iPhone 7 me ekran të thyer", "Kostum tradicional femrash")
description: 40–400 chars, condition + visible features from labels; no phone/email/price

If seller_type is "shop", write as a clear shop product listing.

Reply ONLY JSON:
{"title":"...","description":"...","confidence":"high"|"medium"|"low"}`;

const AI_VISION_FALLBACK_SYSTEM = `You analyze product photos for second-hand listings on KetuJemi.com (Albanian marketplace).

TASK: Look at the MAIN OBJECT being sold. Classify by what the item IS (material product type), not by cultural context, decoration style, or where it might be used.

Use ONLY numeric ids from the provided JSON catalog. Never invent ids.

═══ CATEGORY ID RULES (critical) ═══
parent_category_id = top-level hub (root row in catalog, no parent)
category_id = the DIRECT child of that parent (type/subcategory row). REQUIRED whenever the parent has children.
brand_category_id = deepest leaf when the catalog has 3+ levels under the parent (grandchild or deeper). Use null only when the tree stops at category_id.

Always pick the MOST SPECIFIC leaf available. Never stop at parent only when children exist.

═══ VISUAL OBJECT → PARENT HUB (use exact catalog names) ═══
CLOTHING & WEARABLES → «Rroba & Këpucë» — NOT «Muzikë & Hobby»
VEHICLES → «Vetura» | «Motorr & Skuter» | «Kamionë & Furgonë»
AUTO PARTS → «Auto Pjesë»
REAL ESTATE → «Banesa & Shtëpi» or «Lokale & Zyrë»
PHONES → «Telefona» | LAPTOPS → «Kompjuterë & Laptopë» | OTHER ELECTRONICS → «Elektronikë & Pajisje Shtëpiake»
HOME → «Mobilje & Dekorime»
BABY → «Fëmijë» | SPORTS → «Sport & Outdoor» | PETS → «Kafshë»
MUSIC & HOBBY → instruments/art supplies only — NEVER clothing

═══ TEXT OUTPUT (Albanian sq) ═══
title: 5–80 chars | description: 40–400 chars; no phone/email/price

Reply ONLY JSON:
{"parent_category_id":number,"category_id":number,"brand_category_id":number|null,"title":"...","description":"...","confidence":"high"|"medium"|"low"}`;

function isExcludedParent(row: CategoryRow): boolean {
  return Boolean(row.slug && EXCLUDED_PARENT_SLUGS.has(row.slug));
}

type CatalogNode = {
  id: number;
  name: string;
  slug: string;
  children?: CatalogNode[];
};

function buildCategorySubtree(rows: CategoryRow[], parentId: number): CatalogNode[] {
  return rows
    .filter((c) => c.parent_id === parentId)
    .map((row) => {
      const grandchildren = buildCategorySubtree(rows, row.id);
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        ...(grandchildren.length > 0 ? { children: grandchildren } : {}),
      };
    });
}

function buildCategoryCatalog(rows: CategoryRow[]): CatalogNode[] {
  const parents = rows.filter((c) => !c.parent_id && !isExcludedParent(c));
  return parents.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    children: buildCategorySubtree(rows, p.id),
  }));
}

function categoryChain(rows: CategoryRow[], leafId: number): CategoryRow[] | null {
  const leaf = rows.find((c) => c.id === leafId);
  if (!leaf) return null;

  const chain: CategoryRow[] = [leaf];
  let current = leaf;
  while (current.parent_id) {
    const parent = rows.find((c) => c.id === current.parent_id);
    if (!parent) return null;
    chain.unshift(parent);
    current = parent;
  }

  if (chain[0]?.parent_id) return null;
  return chain;
}

function mapChainToForm(chain: CategoryRow[]): {
  parent: CategoryRow;
  category: CategoryRow;
  brand?: CategoryRow;
} | null {
  if (chain.length === 0) return null;
  if (chain.length === 1) {
    return { parent: chain[0], category: chain[0] };
  }
  return {
    parent: chain[0],
    category: chain[1],
    brand: chain.length >= 3 ? chain[chain.length - 1] : undefined,
  };
}

function parentHasChildren(rows: CategoryRow[], parentId: number): boolean {
  return rows.some((c) => c.parent_id === parentId);
}

function resolveLeafId(rows: CategoryRow[], parsed: VisionAiPayload): number | null {
  const candidates = [
    Number(parsed.brand_category_id) || 0,
    Number(parsed.category_id) || 0,
    Number(parsed.parent_category_id) || 0,
  ].filter((id) => id > 0);

  let bestId: number | null = null;
  let bestDepth = 0;
  for (const id of candidates) {
    const chain = categoryChain(rows, id);
    if (!chain) continue;
    if (chain.length >= bestDepth) {
      bestDepth = chain.length;
      bestId = id;
    }
  }

  return bestId;
}

function validateHierarchy(
  rows: CategoryRow[],
  parsed: VisionAiPayload,
): ListingImageAnalyzeResult | null {
  const leafId = resolveLeafId(rows, parsed);
  if (!leafId) return null;

  const chain = categoryChain(rows, leafId);
  if (!chain) return null;

  const mapped = mapChainToForm(chain);
  if (!mapped || isExcludedParent(mapped.parent)) return null;

  if (parentHasChildren(rows, mapped.parent.id) && mapped.category.id === mapped.parent.id) {
    return null;
  }

  const title = parsed.title?.trim() ?? "";
  const description = parsed.description?.trim() ?? "";
  if (title.length < 5 || description.length < 10) return null;

  return {
    parent_category_id: mapped.parent.id,
    category_id: mapped.category.id,
    brand_category_id: mapped.brand?.id,
    parent_name: mapped.parent.name,
    category_name: mapped.category.name,
    brand_name: mapped.brand?.name,
    title: title.slice(0, 120),
    description: description.slice(0, 2000),
    confidence:
      parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
        ? parsed.confidence
        : "low",
  };
}

function visionTextFromDetect(result: GoogleVisionDetectResult): string {
  return formatVisionDetectResult(result).toLowerCase();
}

function isUnderParentTree(rows: CategoryRow[], nodeId: number, parentId: number): boolean {
  const chain = categoryChain(rows, nodeId);
  return chain?.[0]?.id === parentId;
}

function matchBrandChildFromLabels(
  text: string,
  parentId: number,
  categoryId: number,
  rows: CategoryRow[],
): number | undefined {
  const brandAliases: Array<{ pattern: RegExp; slug: string }> = [
    { pattern: /\b(iphone|ipad|airpods|apple\s*watch)\b/i, slug: "telefona-apple" },
    { pattern: /\bsamsung\b/i, slug: "telefona-samsung" },
    { pattern: /\bxiaomi\b|\bredmi\b/i, slug: "telefona-xiaomi" },
    { pattern: /\bhuawei\b/i, slug: "telefona-huawei" },
    { pattern: /\bgoogle\s*pixel\b|\bpixel\b/i, slug: "telefona-google" },
    { pattern: /\bbmw\b/i, slug: "bmw" },
    { pattern: /\baudi\b/i, slug: "audi" },
    { pattern: /\bmercedes\b/i, slug: "mercedes-benz" },
  ];

  for (const alias of brandAliases) {
    if (!alias.pattern.test(text)) continue;
    const brand = rows.find((c) => c.slug === alias.slug);
    if (brand && isUnderParentTree(rows, brand.id, parentId)) return brand.id;
  }

  const children = rows.filter((c) => c.parent_id === parentId || c.parent_id === categoryId);
  for (const child of children) {
    const name = child.name.toLowerCase();
    if (name.length >= 3 && text.includes(name)) return child.id;
  }

  const parent = rows.find((c) => c.id === parentId);
  if (parent?.slug === "telefona" && /\b(iphone|ipad|smartphone|mobile\s*phone)\b/i.test(text)) {
    const apple = rows.find((c) => c.slug === "telefona-apple");
    if (apple && apple.parent_id === parentId) return apple.id;
  }

  return undefined;
}

async function classifyCategoryFromLabels(
  vision: GoogleVisionDetectResult,
  rows: CategoryRow[],
  catalog: CatalogNode[],
): Promise<CategoryPickPayload | null> {
  const labelText = visionTextFromDetect(vision);
  const searchText = labelText.slice(0, 400);

  const fromRules = await suggestListingCategory({
    title: searchText.slice(0, 200),
    description: searchText,
  });

  if (fromRules) {
    let categoryId = fromRules.category_id;
    let brandId = fromRules.brand_category_id;

    const matched = matchBrandChildFromLabels(
      labelText,
      fromRules.parent_category_id,
      fromRules.category_id,
      rows,
    );
    if (matched) {
      const matchedRow = rows.find((c) => c.id === matched);
      if (matchedRow?.parent_id === fromRules.parent_category_id) {
        categoryId = matched;
        brandId = undefined;
      } else if (!brandId) {
        brandId = matched;
      }
    }

    return {
      parent_category_id: fromRules.parent_category_id,
      category_id: categoryId,
      brand_category_id: brandId ?? null,
      confidence: fromRules.confidence,
    };
  }

  if (!isClaudeConfigured()) return null;

  const parsed = await claudeJsonCompletion<CategoryPickPayload>({
    system: CATEGORY_FROM_LABELS_SYSTEM,
    user: JSON.stringify({
      google_vision: formatVisionDetectResult(vision),
      categories: catalog,
    }),
    maxTokens: 500,
  });

  if (!parsed?.parent_category_id || !parsed?.category_id) return null;

  const matched = matchBrandChildFromLabels(
    labelText,
    parsed.parent_category_id,
    parsed.category_id,
    rows,
  );
  if (matched) {
    const matchedRow = rows.find((c) => c.id === matched);
    if (matchedRow?.parent_id === parsed.parent_category_id) {
      parsed.category_id = matched;
      parsed.brand_category_id = null;
    } else if (!parsed.brand_category_id) {
      parsed.brand_category_id = matched;
    }
  }

  return parsed;
}

async function generateCopyFromLabels(
  vision: GoogleVisionDetectResult,
  category: { parent_name: string; category_name: string; brand_name?: string },
  shop?: { shop_name: string; shop_category: string | null },
): Promise<CopyPayload | null> {
  if (!isClaudeConfigured()) return null;

  return claudeJsonCompletion<CopyPayload>({
    system: COPY_FROM_LABELS_SYSTEM,
    user: JSON.stringify({
      google_vision: formatVisionDetectResult(vision),
      category: {
        parent: category.parent_name,
        subcategory: category.category_name,
        brand: category.brand_name ?? null,
      },
      ...(shop
        ? {
            seller_type: "shop",
            shop_name: shop.shop_name,
            shop_category: shop.shop_category,
          }
        : { seller_type: "private" }),
    }),
    maxTokens: 500,
  });
}

async function analyzeWithGoogleVisionHybrid(
  imageBase64: string,
  rows: CategoryRow[],
  catalog: CatalogNode[],
  shop?: { shop_name: string; shop_category: string | null },
): Promise<ListingImageAnalyzeResult | null> {
  const vision = await detectImageLabels(imageBase64);
  if (!vision) return null;

  const categoryPick = await classifyCategoryFromLabels(vision, rows, catalog);
  if (!categoryPick?.parent_category_id || !categoryPick.category_id) return null;

  const chain = categoryChain(
    rows,
    Number(categoryPick.brand_category_id) || categoryPick.category_id,
  );
  const mapped = chain ? mapChainToForm(chain) : null;
  if (!mapped) return null;

  const copy = await generateCopyFromLabels(
    vision,
    {
      parent_name: mapped.parent.name,
      category_name: mapped.category.name,
      brand_name: mapped.brand?.name,
    },
    shop,
  );
  if (!copy?.title || !copy.description) return null;

  return validateHierarchy(rows, {
    parent_category_id: categoryPick.parent_category_id,
    category_id: categoryPick.category_id,
    brand_category_id: categoryPick.brand_category_id,
    title: copy.title,
    description: copy.description,
    confidence: copy.confidence ?? categoryPick.confidence ?? "medium",
  });
}

async function analyzeWithClaudeVision(
  imageBase64: string,
  mediaType: string,
  rows: CategoryRow[],
  catalog: CatalogNode[],
  shop?: { shop_name: string; shop_category: string | null },
): Promise<ListingImageAnalyzeResult | null> {
  const parsed = await claudeVisionJsonCompletionFromBase64<VisionAiPayload>({
    system: AI_VISION_FALLBACK_SYSTEM,
    userText: JSON.stringify({
      instruction:
        "Classify the main sellable object in the image. Pick parent_category_id, category_id (direct child of parent), and brand_category_id (deepest leaf when available).",
      categories: catalog,
      ...(shop
        ? {
            seller_type: "shop",
            shop_name: shop.shop_name,
            shop_category: shop.shop_category,
          }
        : { seller_type: "private" }),
    }),
    imageBase64,
    mediaType,
    maxTokens: 900,
  });

  if (!parsed) return null;
  return validateHierarchy(rows, parsed);
}

export async function analyzeListingImage(input: {
  imageBase64: string;
  mediaType: string;
  shop_name?: string | null;
  shop_category?: string | null;
}): Promise<ListingImageAnalyzeResult | null> {
  const imageBase64 = input.imageBase64.trim();
  if (imageBase64.length < 100 || imageBase64.length > 6_000_000) return null;
  if (!isClaudeConfigured()) return null;

  const cats = await db.select().from(categoriesTable);
  const rows: CategoryRow[] = cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parent_id,
  }));

  const catalog = buildCategoryCatalog(rows);
  const shopName = input.shop_name?.trim() ?? "";
  const shopCategory = input.shop_category?.trim() ?? "";
  const shop =
    shopName.length > 0
      ? { shop_name: shopName, shop_category: shopCategory || null }
      : undefined;

  try {
    if (isGoogleVisionConfigured()) {
      const hybrid = await analyzeWithGoogleVisionHybrid(imageBase64, rows, catalog, shop);
      if (hybrid) return hybrid;
    }

    return analyzeWithClaudeVision(imageBase64, input.mediaType, rows, catalog, shop);
  } catch {
    return null;
  }
}
