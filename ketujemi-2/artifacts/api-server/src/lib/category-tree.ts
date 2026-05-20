import { db, categoriesTable } from "@workspace/db";
import type { Category } from "@workspace/db";

let categoriesCache: Category[] | null = null;
let categoriesCacheAt = 0;
const CACHE_MS = 60_000;

async function loadCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoriesCache && now - categoriesCacheAt < CACHE_MS) return categoriesCache;
  categoriesCache = await db.select().from(categoriesTable);
  categoriesCacheAt = now;
  return categoriesCache;
}

/** Category id plus all descendants (for hub pages like Mobilje). */
export async function getCategoryTreeIds(rootCategoryId: number): Promise<number[]> {
  if (!Number.isFinite(rootCategoryId) || rootCategoryId < 1) return [];

  const cats = await loadCategories();
  const childrenByParent = new Map<number, number[]>();
  for (const c of cats) {
    if (c.parent_id == null) continue;
    const list = childrenByParent.get(c.parent_id) ?? [];
    list.push(c.id);
    childrenByParent.set(c.parent_id, list);
  }

  const ids: number[] = [];
  const stack = [rootCategoryId];
  const seen = new Set<number>();

  while (stack.length > 0) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    for (const childId of childrenByParent.get(id) ?? []) {
      stack.push(childId);
    }
  }

  return ids;
}
