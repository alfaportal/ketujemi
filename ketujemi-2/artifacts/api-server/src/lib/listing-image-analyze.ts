import { db, categoriesTable } from "@workspace/db";
import { claudeJsonCompletion, claudeVisionJsonCompletionFromBase64, isClaudeConfigured } from "./claude-client";
import {
  detectImageLabels,
  formatVisionDetectResult,
  isGoogleVisionConfigured,
  type GoogleVisionDetectResult,
} from "./google-vision-client";
import { matchListingCategoryFromRules } from "./listing-category-suggest";

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

const COPY_FROM_LABELS_SYSTEM = `You write Albanian (sq) listing copy for KetuJemi.com second-hand marketplace.

You receive Google Vision labels and the already-chosen category. Write based on what was detected — do NOT invent features not suggested by the labels.

title: 5–80 chars, product-focused (e.g. "iPhone 7 me ekran të thyer", "Kostum tradicional femrash")
description: 40–400 chars, condition + visible features from labels; no phone/email/price

If seller_type is "shop", write as a clear shop product listing.

Reply ONLY JSON:
{"title":"...","description":"...","confidence":"high"|"medium"|"low"}`;

const CLAUDE_VISION_SYSTEM = `You analyze product photos for second-hand listings on KetuJemi.com (Albanian marketplace).

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

function classifyCategoryFromGoogleLabels(
  vision: GoogleVisionDetectResult,
  rows: CategoryRow[],
): CategoryPickPayload | null {
  const labelText = visionTextFromDetect(vision);
  const searchText = labelText.slice(0, 400);

  const fromRules = matchListingCategoryFromRules(searchText, rows);
  if (!fromRules) return null;

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

function fallbackCopyFromGoogleLabels(
  vision: GoogleVisionDetectResult,
  category: { parent_name: string; category_name: string },
): CopyPayload {
  const topLabel =
    vision.labels[0]?.description ??
    vision.objects[0]?.name ??
    category.category_name;
  const title = `${topLabel}`.slice(0, 80);
  const description =
    `Shitet ${topLabel}. Kategori: ${category.parent_name} › ${category.category_name}.`.slice(
      0,
      400,
    );
  return { title, description, confidence: "low" };
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

/**
 * Pipeline A — Google Vision only for detection/classification.
 * Claude TEXT (not vision) may write Albanian copy from labels when configured.
 */
async function analyzeWithGoogleVisionPipeline(
  imageBase64: string,
  rows: CategoryRow[],
  shop?: { shop_name: string; shop_category: string | null },
): Promise<ListingImageAnalyzeResult | null> {
  const vision = await detectImageLabels(imageBase64);
  if (!vision) return null;

  const categoryPick = classifyCategoryFromGoogleLabels(vision, rows);
  if (!categoryPick?.parent_category_id || !categoryPick.category_id) return null;

  const chain = categoryChain(
    rows,
    Number(categoryPick.brand_category_id) || categoryPick.category_id,
  );
  const mapped = chain ? mapChainToForm(chain) : null;
  if (!mapped) return null;

  const categoryInfo = {
    parent_name: mapped.parent.name,
    category_name: mapped.category.name,
    brand_name: mapped.brand?.name,
  };

  let copy: CopyPayload | null = null;
  if (isClaudeConfigured()) {
    copy = await generateCopyFromLabels(vision, categoryInfo, shop);
  }
  if (!copy?.title || !copy.description) {
    copy = fallbackCopyFromGoogleLabels(vision, categoryInfo);
  }

  return validateHierarchy(rows, {
    parent_category_id: categoryPick.parent_category_id,
    category_id: categoryPick.category_id,
    brand_category_id: categoryPick.brand_category_id,
    title: copy.title,
    description: copy.description,
    confidence: copy.confidence ?? categoryPick.confidence ?? "medium",
  });
}

/**
 * Pipeline B — Claude Vision analyzes the image directly (category + copy together).
 * Never mixed with Google Vision labels.
 */
async function analyzeWithClaudeVision(
  imageBase64: string,
  mediaType: string,
  rows: CategoryRow[],
  catalog: CatalogNode[],
  shop?: { shop_name: string; shop_category: string | null },
): Promise<ListingImageAnalyzeResult | null> {
  const parsed = await claudeVisionJsonCompletionFromBase64<VisionAiPayload>({
    system: CLAUDE_VISION_SYSTEM,
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

export function isListingImageAnalyzeConfigured(): boolean {
  return isGoogleVisionConfigured() || isClaudeConfigured();
}

export async function analyzeListingImage(input: {
  imageBase64: string;
  mediaType: string;
  shop_name?: string | null;
  shop_category?: string | null;
}): Promise<ListingImageAnalyzeResult | null> {
  const imageBase64 = input.imageBase64.trim();
  if (imageBase64.length < 100 || imageBase64.length > 6_000_000) return null;

  const canGoogle = isGoogleVisionConfigured();
  const canClaudeVision = isClaudeConfigured();
  if (!canGoogle && !canClaudeVision) return null;

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
    // Pipeline A: Google Vision (fast) — fully separate from Claude Vision.
    if (canGoogle) {
      const googleResult = await analyzeWithGoogleVisionPipeline(imageBase64, rows, shop);
      if (googleResult) return googleResult;
    }

    // Pipeline B: Claude Vision fallback when Google is unavailable or inconclusive.
    if (canClaudeVision) {
      return analyzeWithClaudeVision(imageBase64, input.mediaType, rows, catalog, shop);
    }

    return null;
  } catch {
    return null;
  }
}
