import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { and, gte, inArray } from "drizzle-orm";
import {
  collectDescendantCategoryIds,
  DEFAULT_FREE_LISTING_LIMIT,
  freeLimitForRoot,
  loadAllCategories,
  nextQuotaResetUtcDate,
} from "./category-quota";
import { userOwnsListing } from "./listing-ownership";

function startOfCurrentUtcMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

export type MonthlyPostingHistory = {
  quota_resets_at: string;
  free_limit_per_category: number;
  categories: Array<{
    root_category_id: number;
    root_category_name: string;
    used: number;
    limit: number;
    posts: Array<{
      id: number;
      title: string;
      created_at: string;
    }>;
  }>;
};

export async function getUserMonthlyPostingHistory(user: User): Promise<MonthlyPostingHistory> {
  const { list, byId } = await loadAllCategories();
  const parents = list
    .filter((c) => c.parent_id == null)
    .sort((a, b) => a.name.localeCompare(b.name, "sq"));
  const since = startOfCurrentUtcMonth();

  const categories: MonthlyPostingHistory["categories"] = [];

  for (const parent of parents) {
    const treeIds = [...collectDescendantCategoryIds(parent.id, list)];
    const limit = freeLimitForRoot(parent);

    if (treeIds.length === 0) {
      categories.push({
        root_category_id: parent.id,
        root_category_name: parent.name,
        used: 0,
        limit,
        posts: [],
      });
      continue;
    }

    const rows = await db
      .select({
        id: listingsTable.id,
        title: listingsTable.title,
        created_at: listingsTable.created_at,
        seller_phone: listingsTable.seller_phone,
        description: listingsTable.description,
        user_id: listingsTable.user_id,
      })
      .from(listingsTable)
      .where(
        and(inArray(listingsTable.category_id, treeIds), gte(listingsTable.created_at, since)),
      );

    const owned = rows
      .filter((r) => userOwnsListing(user, r))
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    categories.push({
      root_category_id: parent.id,
      root_category_name: parent.name,
      used: owned.length,
      limit,
      posts: owned.map((r) => ({
        id: r.id,
        title: r.title,
        created_at: r.created_at.toISOString(),
      })),
    });
  }

  return {
    quota_resets_at: nextQuotaResetUtcDate().toISOString(),
    free_limit_per_category: DEFAULT_FREE_LISTING_LIMIT,
    categories,
  };
}
