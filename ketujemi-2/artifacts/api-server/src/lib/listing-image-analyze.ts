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

/** Parents that must never be auto-selected from a product photo. */
const EXCLUDED_PARENT_SLUGS = new Set(["kerkoj-te-blej", "dhurata-falas"]);

const AI_SYSTEM = `You analyze product photos for second-hand listings on KetuJemi.com (Albanian marketplace).

TASK: Look at the MAIN OBJECT being sold. Classify by what the item IS (material product type), not by cultural context, decoration style, or where it might be used.

Use ONLY numeric ids from the provided JSON catalog. Never invent ids.

═══ CATEGORY ID RULES (critical) ═══
parent_category_id = top-level hub (root row in catalog, no parent)
category_id = the DIRECT child of that parent (type/subcategory row). REQUIRED whenever the parent has children.
brand_category_id = deepest leaf when the catalog has 3+ levels under the parent (grandchild or deeper). Use null only when the tree stops at category_id.

Examples:
• Traditional dress / kostum / fustan → parent «Rroba & Këpucë» → category «Veshje për Femra» or «Veshje për Meshkuj» → leaf e.g. «Veshje festive», «Veshje Ceremoniale», «Kostume & Sako»
• Car → parent «Vetura» → body type (Sedan, SUV…) → brand if visible (BMW, Audi…)
• Phone → parent «Telefona» → brand/model leaf under Telefona

Always pick the MOST SPECIFIC leaf available. Never stop at parent only when children exist.

═══ VISUAL OBJECT → PARENT HUB (use exact catalog names) ═══
CLOTHING & WEARABLES → «Rroba & Këpucë»
  Dresses, shirts, pants, shoes, jackets, costumes, traditional/folk clothing (kostum tradicional, fustan, xhaketë, xhubleta), accessories, bags, watches, jewelry, sunglasses.
  NOT «Muzikë & Hobby» — clothing is NEVER hobby even if ornate, cultural, or handmade.

VEHICLES → pick the correct vehicle hub:
  Cars → «Vetura» | Motorcycles/scooters → «Motorr & Skuter» | Trucks/vans/buses → «Kamionë & Furgonë»

AUTO PARTS → «Auto Pjesë»
  Tires, engines, brakes, batteries, body parts, filters, tools for vehicles.

REAL ESTATE → «Banesa & Shtëpi» (apartments, houses, land, residential) or «Lokale & Zyrë» (commercial/office).

ELECTRONICS & TECH → pick the best hub:
  Phones → «Telefona»
  Laptops/PCs/tablets → «Kompjuterë & Laptopë»
  TVs, cameras, gaming consoles, speakers, appliances, smartwatches → «Elektronikë & Pajisje Shtëpiake»
  Speakers/headphones → sub «Audio & Pajisje Zëri» (NOT TVs)
  TVs/projectors → sub «Televizorë & Projektorë»
  Cameras → sub «Kamera, Foto & Smart Watch» (NOT Muzikë & Hobby unless clearly pro studio-only and not consumer electronics)

HOME → «Mobilje & Dekorime»
  Furniture, sofas, beds, kitchen items, decor, lighting, carpets.

JOBS & SERVICES → «Punë & Shërbime» (only if image shows a service/job ad, not a physical product).

BABY & KIDS → «Fëmijë»
  Strollers, baby gear, toys, children's clothes (NOT adult clothing).

SPORTS & OUTDOOR → «Sport & Outdoor»
  Sports gear, bicycles, camping, fitness equipment.

PETS → «Kafshë» (live animals, pet supplies).

MUSIC & HOBBY → «Muzikë & Hobby» ONLY for:
  Musical instruments, studio/audio gear, art supplies, hobby craft materials, collectible books/coins, hobby model kits.
  NEVER for clothing, costumes, dresses, or jewelry.

AGRICULTURE → «Bujqësi & Blegtori» (farm animals, tractors as farm equipment, seeds, feed).

EDUCATION → «Arsim & Kurse» (courses, tutoring, textbooks, study materials).

CONSTRUCTION → «Ndërtim & Instalime» (building services, installations — not furniture).

═══ COMMON MISTAKES — AVOID ═══
✗ Folk/traditional/ceremonial costume → NOT Muzikë & Hobby → USE Rroba & Këpucë
✗ Embroidered dress or formal wear → NOT Art & Kreativitet → USE Rroba & Këpucë
✗ Car tire or engine → NOT Vetura → USE Auto Pjesë
✗ Bicycle → NOT Vetura → USE Sport & Outdoor › Biçikleta
✗ Children's toy → NOT Muzikë & Hobby puzzle section unless clearly adult collectible
✗ iPhone → NOT Kompjuterë if Telefona exists with matching brand leaf

═══ SHOP SELLERS ═══
If seller_type is "shop", write title/description as a clear shop product listing.

═══ TEXT OUTPUT (Albanian sq) ═══
title: 5–80 chars, product-focused (e.g. "BMW X5 3.0d 2018", "Kostum tradicional femrash")
description: 40–400 chars, condition + visible features; no phone/email/price

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
        instruction:
          "Classify the main sellable object in the image. Pick parent_category_id, category_id (direct child of parent), and brand_category_id (deepest leaf when available). Match subcategory precisely to what is visible — e.g. folk costume → Rroba & Këpucë › Veshje për Femra/Meshkuj › festive/ceremonial leaf.",
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
      maxTokens: 900,
    });

    if (!parsed) return null;
    return validateHierarchy(rows, parsed);
  } catch {
    return null;
  }
}
