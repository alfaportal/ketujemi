import { logger } from "./logger.js";
import { claudeJsonCompletion, claudeVisionJsonCompletionFromBase64, isClaudeConfigured } from "./claude-client";
import { getCachedCategoryRows, type CategoryRow } from "./category-rows-cache";
import {
  detectImageLabels,
  formatVisionDetectResult,
  isGoogleVisionConfigured,
  type GoogleVisionDetectResult,
} from "./google-vision-client";
import { matchListingCategoryFromRules } from "./listing-category-suggest";
import {
  buildClaudeVisionSystem,
  buildCopyFromLabelsSystem,
  fallbackListingDescription,
  parseListingCopyLang,
  type ListingCopyLang,
} from "./listing-copy-lang";
import { matchVisionLabelsToCategory } from "./vision-category-rules";

export type ListingImageAnalyzePipeline = "google" | "claude" | null;

export type ListingImageAnalyzeOutcome = {
  result: ListingImageAnalyzeResult | null;
  pipeline: ListingImageAnalyzePipeline;
};

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

/** Hubs where product types and brands are siblings under the parent (not type → brand). */
const FLAT_TYPE_BRAND_HUB_SLUGS = new Set(["telefona", "kompjutere-laptope"]);

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
    if (chain.length > bestDepth) {
      bestDepth = chain.length;
      bestId = id;
    }
  }

  return bestId;
}

function mapFlatHubForm(
  rows: CategoryRow[],
  parentId: number,
  typeId: number,
  brandId: number | null | undefined,
): { parent: CategoryRow; category: CategoryRow; brand?: CategoryRow } | null {
  const parent = rows.find((c) => c.id === parentId);
  if (!parent || !FLAT_TYPE_BRAND_HUB_SLUGS.has(parent.slug)) return null;

  const brandRow = brandId ? rows.find((c) => c.id === brandId) : undefined;
  if (brandRow && brandRow.parent_id === parentId) {
    return { parent, category: brandRow };
  }

  const typeRow = typeId ? rows.find((c) => c.id === typeId) : undefined;
  if (typeRow && typeRow.parent_id === parentId) {
    return { parent, category: typeRow };
  }

  return null;
}

function mapParsedToForm(
  rows: CategoryRow[],
  parsed: VisionAiPayload,
): { parent: CategoryRow; category: CategoryRow; brand?: CategoryRow } | null {
  const parentId = Number(parsed.parent_category_id) || 0;
  const typeId = Number(parsed.category_id) || 0;
  const brandId = parsed.brand_category_id ? Number(parsed.brand_category_id) : 0;

  const flat = mapFlatHubForm(rows, parentId, typeId, brandId || null);
  if (flat) return flat;

  const leafId = resolveLeafId(rows, parsed);
  if (!leafId) return null;

  const chain = categoryChain(rows, leafId);
  if (!chain) return null;

  return mapChainToForm(chain);
}

function ensureCopyMinimums(
  title: string,
  description: string,
  mapped: { parent: CategoryRow; category: CategoryRow; brand?: CategoryRow },
  lang: ListingCopyLang,
): { title: string; description: string } | null {
  let nextTitle = title.trim();
  let nextDescription = description.trim();

  if (nextTitle.length < 5) {
    nextTitle = (mapped.brand?.name ?? mapped.category.name).slice(0, 80);
  }
  if (nextDescription.length < 15) {
    const label = mapped.brand?.name ?? mapped.category.name;
    nextDescription = fallbackListingDescription(
      lang,
      label,
      mapped.parent.name,
      mapped.category.name,
    ).slice(0, 400);
  }

  if (nextTitle.length < 5 || nextDescription.length < 15) return null;
  return { title: nextTitle, description: nextDescription };
}

function validateHierarchy(
  rows: CategoryRow[],
  parsed: VisionAiPayload,
  lang: ListingCopyLang,
): ListingImageAnalyzeResult | null {
  const mapped = mapParsedToForm(rows, parsed);
  if (!mapped || isExcludedParent(mapped.parent)) return null;

  if (parentHasChildren(rows, mapped.parent.id) && mapped.category.id === mapped.parent.id) {
    return null;
  }

  const copy = ensureCopyMinimums(
    parsed.title?.trim() ?? "",
    parsed.description?.trim() ?? "",
    mapped,
    lang,
  );
  if (!copy) return null;

  return {
    parent_category_id: mapped.parent.id,
    category_id: mapped.category.id,
    brand_category_id: mapped.brand?.id,
    parent_name: mapped.parent.name,
    category_name: mapped.category.name,
    brand_name: mapped.brand?.name,
    title: copy.title.slice(0, 120),
    description: copy.description.slice(0, 2000),
    confidence:
      parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
        ? parsed.confidence
        : "low",
  };
}

function visionTextFromDetect(result: GoogleVisionDetectResult): string {
  const objects = result.objects
    .slice(0, 12)
    .map((o) => o.name)
    .join(" ");
  const labels = result.labels
    .slice(0, 20)
    .map((l) => l.description)
    .join(" ");
  return `${objects} ${labels} ${formatVisionDetectResult(result)}`.toLowerCase();
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
  const searchText = labelText.slice(0, 600);

  const fromVision = matchVisionLabelsToCategory(searchText, rows);
  const fromRules = matchListingCategoryFromRules(searchText, rows);
  if (!fromVision && !fromRules) return null;

  const confidenceScore = (c: "high" | "medium" | "low") =>
    c === "high" ? 3 : c === "medium" ? 2 : 1;

  const base =
    fromVision && fromRules
      ? confidenceScore(fromVision.confidence) >= confidenceScore(fromRules.confidence)
        ? fromVision
        : {
            parent_category_id: fromRules.parent_category_id,
            category_id: fromRules.category_id,
            parent_name: fromRules.parent_name,
            category_name: fromRules.category_name,
            confidence: fromRules.confidence,
          }
      : fromVision ?? {
          parent_category_id: fromRules!.parent_category_id,
          category_id: fromRules!.category_id,
          parent_name: fromRules!.parent_name,
          category_name: fromRules!.category_name,
          confidence: fromRules!.confidence,
        };

  const fromRulesCompat = {
    parent_category_id: base.parent_category_id,
    category_id: base.category_id,
    parent_name: base.parent_name,
    category_name: base.category_name,
    confidence: base.confidence,
    source: "rules" as const,
  };

  let categoryId = fromRulesCompat.category_id;
  let brandId: number | undefined;

  const matched = matchBrandChildFromLabels(
    labelText,
    fromRulesCompat.parent_category_id,
    fromRulesCompat.category_id,
    rows,
  );
  if (matched) {
    const matchedRow = rows.find((c) => c.id === matched);
    const parentRow = rows.find((c) => c.id === fromRulesCompat.parent_category_id);
    if (
      matchedRow &&
      parentRow &&
      FLAT_TYPE_BRAND_HUB_SLUGS.has(parentRow.slug) &&
      matchedRow.parent_id === fromRulesCompat.parent_category_id
    ) {
      categoryId = matched;
      brandId = undefined;
    } else if (!brandId) {
      brandId = matched;
    }
  }

  return {
    parent_category_id: fromRulesCompat.parent_category_id,
    category_id: categoryId,
    brand_category_id: brandId ?? null,
    confidence: fromRulesCompat.confidence,
  };
}

function fallbackCopyFromGoogleLabels(
  vision: GoogleVisionDetectResult,
  category: { parent_name: string; category_name: string },
  lang: ListingCopyLang,
): CopyPayload {
  const topLabel =
    vision.labels[0]?.description ??
    vision.objects[0]?.name ??
    category.category_name;
  const title = `${topLabel}`.slice(0, 80);
  const description = fallbackListingDescription(
    lang,
    topLabel,
    category.parent_name,
    category.category_name,
  ).slice(0, 400);
  return { title, description, confidence: "low" };
}

async function generateCopyFromLabels(
  vision: GoogleVisionDetectResult,
  category: { parent_name: string; category_name: string; brand_name?: string },
  lang: ListingCopyLang,
  shop?: { shop_name: string; shop_category: string | null },
): Promise<CopyPayload | null> {
  if (!isClaudeConfigured()) return null;

  return claudeJsonCompletion<CopyPayload>({
    system: buildCopyFromLabelsSystem(lang),
    user: JSON.stringify({
      output_lang: lang,
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
  lang: ListingCopyLang,
  shop?: { shop_name: string; shop_category: string | null },
): Promise<ListingImageAnalyzeResult | null> {
  const vision = await detectImageLabels(imageBase64);
  if (!vision) return null;

  const categoryPick = classifyCategoryFromGoogleLabels(vision, rows);
  if (!categoryPick?.parent_category_id || !categoryPick.category_id) {
    logger.info(
      { sample: visionTextFromDetect(vision).slice(0, 240) },
      "google vision labels ok but no category rule matched",
    );
    return null;
  }

  const mapped = mapParsedToForm(rows, {
    parent_category_id: categoryPick.parent_category_id,
    category_id: categoryPick.category_id,
    brand_category_id: categoryPick.brand_category_id,
  });
  if (!mapped) return null;

  const categoryInfo = {
    parent_name: mapped.parent.name,
    category_name: mapped.category.name,
    brand_name: mapped.brand?.name,
  };

  let copy: CopyPayload = fallbackCopyFromGoogleLabels(vision, categoryInfo, lang);
  if (isClaudeConfigured()) {
    const enhanced = await Promise.race([
      generateCopyFromLabels(vision, categoryInfo, lang, shop),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2_500)),
    ]);
    if (enhanced?.title && enhanced.description) {
      copy = enhanced;
    }
  }

  return validateHierarchy(
    rows,
    {
      parent_category_id: categoryPick.parent_category_id,
      category_id: categoryPick.category_id,
      brand_category_id: categoryPick.brand_category_id,
      title: copy.title,
      description: copy.description,
      confidence: copy.confidence ?? categoryPick.confidence ?? "medium",
    },
    lang,
  );
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
  lang: ListingCopyLang,
  shop?: { shop_name: string; shop_category: string | null },
): Promise<ListingImageAnalyzeResult | null> {
  const parsed = await claudeVisionJsonCompletionFromBase64<VisionAiPayload>({
    system: buildClaudeVisionSystem(lang),
    userText: JSON.stringify({
      instruction:
        "Classify the main sellable object in the image. Pick parent_category_id, category_id (direct child of parent), and brand_category_id (deepest leaf when available). Write title and description in the requested output language.",
      output_lang: lang,
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
    maxTokens: 1200,
  });

  if (!parsed) {
    logger.warn("listing-image-analyze: claude vision returned no JSON");
    return null;
  }

  const result = validateHierarchy(rows, parsed, lang);
  if (!result) {
    logger.warn(
      {
        parent_category_id: parsed.parent_category_id,
        category_id: parsed.category_id,
        brand_category_id: parsed.brand_category_id,
        title_len: parsed.title?.trim().length ?? 0,
        description_len: parsed.description?.trim().length ?? 0,
      },
      "listing-image-analyze: claude vision JSON failed validation",
    );
  }
  return result;
}

export function isListingImageAnalyzeConfigured(): boolean {
  return isGoogleVisionConfigured() || isClaudeConfigured();
}

function emptyOutcome(): ListingImageAnalyzeOutcome {
  return { result: null, pipeline: null };
}

/**
 * Run Google + Claude in parallel. Prefer Claude when both succeed — Google labels
 * sometimes match the wrong category before Claude vision finishes.
 */
async function analyzeWithParallelFallback(input: {
  imageBase64: string;
  mediaType: string;
  rows: CategoryRow[];
  catalog: CatalogNode[];
  lang: ListingCopyLang;
  shop?: { shop_name: string; shop_category: string | null };
}): Promise<ListingImageAnalyzeOutcome> {
  const [google, claude] = await Promise.allSettled([
    analyzeWithGoogleVisionPipeline(input.imageBase64, input.rows, input.lang, input.shop).catch(
      (err) => {
        logger.warn({ err }, "listing-image-analyze google vision failed");
        return null;
      },
    ),
    analyzeWithClaudeVision(
      input.imageBase64,
      input.mediaType,
      input.rows,
      input.catalog,
      input.lang,
      input.shop,
    ).catch((err) => {
      logger.warn({ err }, "listing-image-analyze claude vision failed");
      return null;
    }),
  ]);

  const claudeResult = claude.status === "fulfilled" ? claude.value : null;
  const googleResult = google.status === "fulfilled" ? google.value : null;

  if (claudeResult) return { result: claudeResult, pipeline: "claude" };
  if (googleResult) return { result: googleResult, pipeline: "google" };
  return emptyOutcome();
}

export async function analyzeListingImage(input: {
  imageBase64: string;
  mediaType: string;
  lang?: string | null;
  shop_name?: string | null;
  shop_category?: string | null;
}): Promise<ListingImageAnalyzeOutcome> {
  const imageBase64 = input.imageBase64.trim();
  if (imageBase64.length < 100 || imageBase64.length > 6_000_000) return emptyOutcome();

  const canGoogle = isGoogleVisionConfigured();
  const canClaude = isClaudeConfigured();
  if (!canGoogle && !canClaude) return emptyOutcome();

  const lang = parseListingCopyLang(input.lang);
  const rows = await getCachedCategoryRows();
  const catalog = buildCategoryCatalog(rows);
  const shopName = input.shop_name?.trim() ?? "";
  const shopCategory = input.shop_category?.trim() ?? "";
  const shop =
    shopName.length > 0
      ? { shop_name: shopName, shop_category: shopCategory || null }
      : undefined;

  try {
    if (canGoogle && canClaude) {
      return analyzeWithParallelFallback({
        imageBase64,
        mediaType: input.mediaType,
        rows,
        catalog,
        lang,
        shop,
      });
    }

    if (canClaude) {
      const claudeResult = await analyzeWithClaudeVision(
        imageBase64,
        input.mediaType,
        rows,
        catalog,
        lang,
        shop,
      );
      return claudeResult
        ? { result: claudeResult, pipeline: "claude" }
        : emptyOutcome();
    }

    const googleResult = await analyzeWithGoogleVisionPipeline(imageBase64, rows, lang, shop);
    return googleResult
      ? { result: googleResult, pipeline: "google" }
      : emptyOutcome();
  } catch (err) {
    logger.warn({ err }, "listing-image-analyze unexpected error");
    return emptyOutcome();
  }
}
