import { db, businessPartnerCategoriesTable } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
import { getCategoryTreeIds } from "./category-tree";
import type { User } from "@workspace/db";

function normalizeCategoryIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) return [];
  const out = new Set<number>();
  for (const raw of ids) {
    const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
    if (Number.isFinite(n) && n > 0) out.add(n);
  }
  return [...out];
}

export async function loadBusinessPartnerCategoryMap(): Promise<Map<number, number[]>> {
  const rows = await db
    .select({
      user_id: businessPartnerCategoriesTable.user_id,
      category_id: businessPartnerCategoriesTable.category_id,
    })
    .from(businessPartnerCategoriesTable);

  const map = new Map<number, number[]>();
  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    list.push(row.category_id);
    map.set(row.user_id, list);
  }
  return map;
}

export async function setBusinessPartnerCategories(
  userId: number,
  categoryIds: number[],
): Promise<void> {
  const ids = normalizeCategoryIds(categoryIds);
  await db
    .delete(businessPartnerCategoriesTable)
    .where(eq(businessPartnerCategoriesTable.user_id, userId));

  if (ids.length === 0) return;

  await db.insert(businessPartnerCategoriesTable).values(
    ids.map((category_id) => ({ user_id: userId, category_id })),
  );
}

export async function getBusinessPartnerCategoryIds(userId: number): Promise<number[]> {
  const rows = await db
    .select({ category_id: businessPartnerCategoriesTable.category_id })
    .from(businessPartnerCategoriesTable)
    .where(eq(businessPartnerCategoriesTable.user_id, userId));
  return rows.map((r) => r.category_id);
}

/** Users admin-placed in this category tree (ignores listings). */
export async function fetchBusinessPartnersAssignedToCategory(
  categoryId: number,
  candidateUsers: User[],
): Promise<User[]> {
  if (candidateUsers.length === 0) return [];

  const treeIds = await getCategoryTreeIds(categoryId);
  if (treeIds.length === 0) return [];

  const userIds = candidateUsers.map((u) => u.id);
  const links = await db
    .select({ user_id: businessPartnerCategoriesTable.user_id })
    .from(businessPartnerCategoriesTable)
    .where(
      and(
        inArray(businessPartnerCategoriesTable.user_id, userIds),
        inArray(businessPartnerCategoriesTable.category_id, treeIds),
      ),
    );

  const matchedIds = new Set(links.map((l) => l.user_id));
  return candidateUsers.filter((u) => matchedIds.has(u.id));
}

export function userHasAdminPartnerCategories(
  userId: number,
  categoryMap: Map<number, number[]>,
): boolean {
  return (categoryMap.get(userId)?.length ?? 0) > 0;
}

export async function userMatchesAdminPartnerCategory(
  userId: number,
  categoryId: number,
  categoryMap: Map<number, number[]>,
): Promise<boolean> {
  const assigned = categoryMap.get(userId);
  if (!assigned?.length) return false;
  const treeIds = new Set(await getCategoryTreeIds(categoryId));
  return assigned.some((id) => treeIds.has(id));
}
