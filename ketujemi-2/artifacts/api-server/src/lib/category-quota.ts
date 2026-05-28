import { db } from "@workspace/db";
import { categoriesTable, listingsTable } from "@workspace/db";
import type { Category, User } from "@workspace/db";
import { and, gt, inArray } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";
import { isBusinessAccount } from "./business-rules";
import { getUserExtraListingSlots, effectiveCategoryLimit } from "./listing-packages";

/** Free active listings per parent (root) category — subcategories share this pool. */
export const DEFAULT_FREE_LISTING_LIMIT = 10;

export function countParentCategories(categories: Category[]): number {
  return categories.filter((c) => c.parent_id == null).length;
}

export function resolveRootCategoryId(
  categoryId: number,
  catById: Map<number, Category>,
): number {
  let current = catById.get(categoryId);
  if (!current) return categoryId;
  while (current.parent_id != null) {
    const parent = catById.get(current.parent_id);
    if (!parent) break;
    current = parent;
  }
  return current.id;
}

export function collectDescendantCategoryIds(
  rootId: number,
  categories: Category[],
): Set<number> {
  const ids = new Set<number>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories) {
      if (c.parent_id != null && ids.has(c.parent_id) && !ids.has(c.id)) {
        ids.add(c.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function freeLimitForRoot(root: Category | undefined): number {
  const n = root?.free_listing_limit;
  if (typeof n === "number" && n >= 0) return n;
  return DEFAULT_FREE_LISTING_LIMIT;
}

export async function loadAllCategories(): Promise<{
  list: Category[];
  byId: Map<number, Category>;
}> {
  const list = await db.select().from(categoriesTable);
  return { list, byId: new Map(list.map((c) => [c.id, c])) };
}

export async function countUserActiveListingsInCategoryRoot(
  user: User,
  categoryId: number,
): Promise<{ rootId: number; used: number; limit: number; base_limit: number; extra_slots: number }> {
  const { list, byId } = await loadAllCategories();
  const rootId = resolveRootCategoryId(categoryId, byId);
  const root = byId.get(rootId);
  const baseLimit = freeLimitForRoot(root);
  const extra = isBusinessAccount(user) ? 0 : await getUserExtraListingSlots(user.id);
  const limit = effectiveCategoryLimit(baseLimit, extra);
  const treeIds = [...collectDescendantCategoryIds(rootId, list)];

  if (treeIds.length === 0) {
    return { rootId, used: 0, limit, base_limit: baseLimit, extra_slots: extra };
  }

  const rows = await db
    .select({
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
    })
    .from(listingsTable)
    .where(
      and(
        inArray(listingsTable.category_id, treeIds),
        gt(listingsTable.expires_at, new Date()),
      ),
    );

  const used = rows.filter((l) => userOwnsListing(user, l)).length;
  return { rootId, used, limit, base_limit: baseLimit, extra_slots: extra };
}

export async function assertFreeListingQuota(
  user: User,
  categoryId: number,
): Promise<void> {
  const { used, limit, base_limit, extra_slots } = await countUserActiveListingsInCategoryRoot(
    user,
    categoryId,
  );
  if (used >= limit) {
    const err = new Error("FREE_QUOTA_EXCEEDED") as Error & {
      used: number;
      limit: number;
      base_limit: number;
      extra_slots: number;
      show_packages: boolean;
    };
    err.used = used;
    err.limit = limit;
    err.base_limit = base_limit;
    err.extra_slots = extra_slots;
    err.show_packages = true;
    throw err;
  }
}
