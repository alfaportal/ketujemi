import { db, categoriesTable } from "@workspace/db";

export type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
let cachedRows: CategoryRow[] | null = null;
let cachedAt = 0;

/** In-memory cache — categories change rarely. */
export async function getCachedCategoryRows(): Promise<CategoryRow[]> {
  const now = Date.now();
  if (cachedRows && now - cachedAt < CACHE_TTL_MS) return cachedRows;

  const cats = await db.select().from(categoriesTable);
  cachedRows = cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent_id: c.parent_id,
  }));
  cachedAt = now;
  return cachedRows!;
}
