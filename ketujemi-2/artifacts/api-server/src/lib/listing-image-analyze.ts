import { db, categoriesTable } from "@workspace/db";
import { claudeVisionJsonCompletionFromBase64, isClaudeConfigured } from "./claude-client";

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

const AI_SYSTEM = `You analyze product photos for second-hand listings on KetuJemi.com (Albanian marketplace).

From the image, identify what is being sold and pick the BEST matching categories from the provided JSON catalog.
Use exact numeric ids from the catalog only.

Hierarchy:
- parent_category_id = top-level category (no parent in catalog)
- category_id = subcategory directly under that parent, OR the deepest child if only two levels exist
- brand_category_id = optional third level (brand/model/leaf) when catalog has grandchildren; omit or null if not applicable

If seller_type is "shop", the photo is inventory for that shop — title/description should suit a shop product listing (professional, clear product name).

Also write in Albanian (sq):
- title: concise listing title (5–80 chars), e.g. "BMW X5 3.0d 2018" or "iPhone 14 Pro 128GB"
- description: helpful description (40–400 chars) mentioning condition, key features visible; no phone/email; no price

Electronics rules:
- Speakers/headphones/JBL/Bose → Audio & Pajisje Zëri, NOT TVs
- TVs/projectors → Televizorë & Projektorë
- Phones → under Telefona

Reply ONLY JSON:
{"parent_category_id":number,"category_id":number,"brand_category_id":number|null,"title":"...","description":"...","confidence":"high"|"medium"|"low"}`;

function buildCategoryCatalog(rows: CategoryRow[]) {
  const parents = rows.filter((c) => !c.parent_id);
  return parents.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    children: rows
      .filter((c) => c.parent_id === p.id)
      .map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        children: rows
          .filter((c) => c.parent_id === child.id)
          .map((leaf) => ({ id: leaf.id, name: leaf.name, slug: leaf.slug })),
      })),
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
  if (chain.length === 2) {
    return { parent: chain[0], category: chain[1] };
  }
  return {
    parent: chain[0],
    category: chain[chain.length - 2],
    brand: chain[chain.length - 1],
  };
}

function validateHierarchy(
  rows: CategoryRow[],
  parsed: VisionAiPayload,
): ListingImageAnalyzeResult | null {
  if (!parsed.parent_category_id || !parsed.category_id) return null;

  const brandId = Number(parsed.brand_category_id) || 0;
  const leafId = brandId > 0 ? brandId : parsed.category_id;
  const chain = categoryChain(rows, leafId);
  if (!chain) return null;

  const mapped = mapChainToForm(chain);
  if (!mapped || mapped.parent.id !== parsed.parent_category_id) return null;

  const title = parsed.title?.trim() ?? "";
  const description = parsed.description?.trim() ?? "";
  if (title.length < 5 || description.length < 15) return null;

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

  try {
    const shopName = input.shop_name?.trim() ?? "";
    const shopCategory = input.shop_category?.trim() ?? "";
    const parsed = await claudeVisionJsonCompletionFromBase64<VisionAiPayload>({
      system: AI_SYSTEM,
      userText: JSON.stringify({
        categories: catalog,
        ...(shopName
          ? {
              seller_type: "shop",
              shop_name: shopName,
              shop_category: shopCategory || null,
            }
          : { seller_type: "private" }),
      }),
      imageBase64,
      mediaType: input.mediaType,
      maxTokens: 700,
    });

    if (!parsed) return null;
    return validateHierarchy(rows, parsed);
  } catch {
    return null;
  }
}
