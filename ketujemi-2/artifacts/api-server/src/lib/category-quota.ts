import { db } from "@workspace/db";
import { categoriesTable, listingsTable } from "@workspace/db";
import type { Category, User } from "@workspace/db";
import { and, gte, gt, inArray } from "drizzle-orm";
import { LISTING_ACTIVE_LIFETIME_DAYS } from "./listing-lifetime.js";
import { userOwnsListing } from "./listing-ownership";
import { isBusinessAccount } from "./business-rules";
import { getUserExtraListingSlots, effectiveCategoryLimit } from "./listing-packages";
import {
  DHURATA_ACTIVE_LIFETIME_DAYS,
  isDhurataFalasSlug,
} from "../../../../lib/special-listing-categories.js";

/** Free posts per calendar month (UTC) per parent category — subcategories share this pool. */
export const DEFAULT_FREE_LISTING_LIMIT = 20;

export function countParentCategories(categories: Category[]): number {
  return categories.filter((c) => c.parent_id == null).length;
}

function startOfCurrentUtcMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

export type CategoryPostingQuota = {
  rootId: number;
  active_used: number;
  active_limit: number;
  monthly_posts_used: number;
  monthly_posts_limit: number;
  base_limit: number;
  extra_slots: number;
  listing_lifetime_days: number;
  /** Free post this month without wallet (10/muaj për kategori kryesore). */
  allowed: boolean;
  active_remaining: number;
  monthly_remaining: number;
};

export async function getCategoryPostingQuota(
  user: User,
  categoryId: number,
): Promise<CategoryPostingQuota> {
  const { byId } = await loadAllCategories();
  const rootId = resolveRootCategoryId(categoryId, byId);
  const root = byId.get(rootId);
  if (isDhurataFalasSlug(root?.slug)) {
    return {
      rootId,
      active_used: 0,
      active_limit: Number.MAX_SAFE_INTEGER,
      monthly_posts_used: 0,
      monthly_posts_limit: Number.MAX_SAFE_INTEGER,
      base_limit: Number.MAX_SAFE_INTEGER,
      extra_slots: 0,
      listing_lifetime_days: DHURATA_ACTIVE_LIFETIME_DAYS,
      allowed: true,
      active_remaining: Number.MAX_SAFE_INTEGER,
      monthly_remaining: Number.MAX_SAFE_INTEGER,
    };
  }

  const active = await countUserActiveListingsInCategoryRoot(user, categoryId);
  const monthly = await countUserPostsInCategoryRootThisMonth(user, categoryId);
  const active_remaining = Math.max(0, active.limit - active.used);
  const monthly_remaining = Math.max(0, monthly.limit - monthly.used);
  return {
    rootId: monthly.rootId,
    active_used: active.used,
    active_limit: active.limit,
    monthly_posts_used: monthly.used,
    monthly_posts_limit: monthly.limit,
    base_limit: monthly.limit,
    extra_slots: active.extra_slots,
    listing_lifetime_days: LISTING_ACTIVE_LIFETIME_DAYS,
    allowed: monthly_remaining > 0,
    active_remaining,
    monthly_remaining,
  };
}

/** Posts created this calendar month (UTC) in parent category tree — includes reposts. */
export async function countUserPostsInCategoryRootThisMonth(
  user: User,
  categoryId: number,
): Promise<{ rootId: number; used: number; limit: number }> {
  const { list, byId } = await loadAllCategories();
  const rootId = resolveRootCategoryId(categoryId, byId);
  const root = byId.get(rootId);
  const limit = effectiveCategoryLimit(freeLimitForRoot(root), 0);
  const treeIds = [...collectDescendantCategoryIds(rootId, list)];
  const since = startOfCurrentUtcMonth();

  if (treeIds.length === 0) {
    return { rootId, used: 0, limit };
  }

  const rows = await db
    .select({
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
      created_at: listingsTable.created_at,
    })
    .from(listingsTable)
    .where(
      and(inArray(listingsTable.category_id, treeIds), gte(listingsTable.created_at, since)),
    );

  const used = rows.filter((l) => userOwnsListing(user, l)).length;
  return { rootId, used, limit };
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
  if (typeof n === "number" && n >= 0) {
    return Math.max(n, DEFAULT_FREE_LISTING_LIMIT);
  }
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
  const { byId } = await loadAllCategories();
  const rootId = resolveRootCategoryId(categoryId, byId);
  const root = byId.get(rootId);
  if (isDhurataFalasSlug(root?.slug)) return;

  const q = await getCategoryPostingQuota(user, categoryId);
  if (q.allowed) return;

  const err = new Error("FREE_QUOTA_EXCEEDED") as Error & {
    used: number;
    limit: number;
    base_limit: number;
    extra_slots: number;
    show_packages: boolean;
    monthly_posts_used: number;
    monthly_posts_limit: number;
    publicMessage: string;
  };
  err.used = q.monthly_posts_used;
  err.limit = q.monthly_posts_limit;
  err.base_limit = q.base_limit;
  err.extra_slots = q.extra_slots;
  err.monthly_posts_used = q.monthly_posts_used;
  err.monthly_posts_limit = q.monthly_posts_limit;
  err.show_packages = true;
  err.publicMessage = `Keni përdorur ${q.monthly_posts_used}/${q.monthly_posts_limit} postimet falas këtë muaj për këtë kategori. Mund të vazhdoni me €0.30/postim nga portofoli (Profili → Paketa) ose të prisni muajin e ri.`;
  throw err;
}
