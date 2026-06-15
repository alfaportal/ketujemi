import { db, categoriesTable, listingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCategoryTreeIds } from "./category-tree.js";
import { hubCategoryRuleMatch } from "./hub-category-suggest-rules.js";
import { activeListingSqlCondition } from "./listing-visibility.js";

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

let categoriesCache: CategoryRow[] | null = null;
let categoriesCacheAt = 0;
const CACHE_MS = 60_000;

async function loadCategoryRows(): Promise<CategoryRow[]> {
  const now = Date.now();
  if (categoriesCache && now - categoriesCacheAt < CACHE_MS) return categoriesCache;
  const rows = await db.select().from(categoriesTable);
  categoriesCache = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parent_id,
  }));
  categoriesCacheAt = now;
  return categoriesCache;
}

function isHubTypeParent(cat: CategoryRow, children: CategoryRow[]): boolean {
  if (children.length === 0) return false;
  return children.some(
    (c) => typeof c.slug === "string" && c.slug.includes("-type-"),
  );
}

/** Expand category_ids filter to include each id's full subtree (union). */
export async function expandCategoryIdsForFilter(ids: number[]): Promise<number[]> {
  const expanded = new Set<number>();
  for (const id of ids) {
    if (!Number.isFinite(id) || id < 1) continue;
    for (const tid of await getCategoryTreeIds(id)) {
      expanded.add(tid);
    }
  }
  return [...expanded];
}

/**
 * Resolve hub / group category to the best leaf type using title rules.
 * Cross-hub correction (e.g. fridge under Mobilje → Elektronikë) when rules match.
 */
export async function resolveListingCategoryToLeaf(
  categoryId: number,
  title: string,
  description: string,
): Promise<number> {
  if (!Number.isFinite(categoryId) || categoryId < 1) return categoryId;

  const cats = await loadCategoryRows();
  const cat = cats.find((c) => c.id === categoryId);
  if (!cat) return categoryId;

  const children = cats.filter((c) => c.parent_id === categoryId);
  if (children.length === 0) return categoryId;

  const text = `${title} ${description}`.trim();
  const match = hubCategoryRuleMatch(text, cats);
  if (match) {
    if (match.parent_category_id === categoryId) {
      return match.category_id;
    }
    if (match.confidence === "high" || match.confidence === "medium") {
      return match.category_id;
    }
  }

  const typeChildren = children.filter(
    (c) => typeof c.slug === "string" && c.slug.includes("-type-"),
  );
  if (typeChildren.length === 1) {
    return typeChildren[0]!.id;
  }

  return categoryId;
}

/** Repair a listing row stored on a hub parent instead of a leaf type. Returns new category id or null. */
export async function repairListingCategoryIfNeeded(
  row: Pick<typeof listingsTable.$inferSelect, "id" | "category_id" | "title" | "description">,
): Promise<number | null> {
  const cats = await loadCategoryRows();
  const cat = cats.find((c) => c.id === row.category_id);
  if (!cat) return null;

  const children = cats.filter((c) => c.parent_id === row.category_id);
  if (!isHubTypeParent(cat, children)) return null;

  const resolved = await resolveListingCategoryToLeaf(
    row.category_id,
    row.title,
    row.description ?? "",
  );
  if (resolved === row.category_id) return null;

  await db
    .update(listingsTable)
    .set({ category_id: resolved })
    .where(eq(listingsTable.id, row.id));

  return resolved;
}

/** Repair active listings still on hub parent when browsing a type subcategory. */
export async function repairHubListingsForTypeCategory(typeCategoryId: number): Promise<void> {
  const cats = await loadCategoryRows();
  const typeCat = cats.find((c) => c.id === typeCategoryId);
  if (!typeCat?.parent_id) return;

  const hubId = typeCat.parent_id;
  const hub = cats.find((c) => c.id === hubId);
  if (!hub) return;

  const typeSiblings = cats.filter(
    (c) =>
      c.parent_id === hubId &&
      typeof c.slug === "string" &&
      c.slug.includes("-type-"),
  );
  if (typeSiblings.length === 0) return;

  const hubListings = await db
    .select({
      id: listingsTable.id,
      category_id: listingsTable.category_id,
      title: listingsTable.title,
      description: listingsTable.description,
    })
    .from(listingsTable)
    .where(and(eq(listingsTable.category_id, hubId), activeListingSqlCondition()))
    .limit(80);

  for (const listing of hubListings) {
    await repairListingCategoryIfNeeded(listing);
  }
}

export async function repairListingCategoriesInBatch(
  rows: Array<typeof listingsTable.$inferSelect>,
): Promise<typeof listingsTable.$inferSelect[]> {
  const cats = await loadCategoryRows();
  const hubParentIds = new Set<number>();

  for (const row of rows) {
    const children = cats.filter((c) => c.parent_id === row.category_id);
    const cat = cats.find((c) => c.id === row.category_id);
    if (cat && isHubTypeParent(cat, children)) {
      hubParentIds.add(row.category_id);
    }
  }

  if (hubParentIds.size === 0) return rows;

  const repairedById = new Map<number, number>();
  for (const row of rows) {
    if (!hubParentIds.has(row.category_id)) continue;
    const nextId = await repairListingCategoryIfNeeded(row);
    if (nextId) repairedById.set(row.id, nextId);
  }

  if (repairedById.size === 0) return rows;

  return rows.map((row) =>
    repairedById.has(row.id) ? { ...row, category_id: repairedById.get(row.id)! } : row,
  );
}
