import {
  db,
  homepagePartnerCategoriesTable,
  homepagePartnersTable,
} from "@workspace/db";
import type { HomepagePartner } from "@workspace/db";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getCategoryTreeIds } from "./category-tree";
import type { PartnerTier, TrustedPartnerDto } from "./trusted-partners";

export type HomepagePartnerInput = {
  business_name: string;
  logo_url: string;
  link_url: string;
  tier: PartnerTier;
  sort_order?: number;
  category_ids?: number[];
};

export type HomepagePartnerAdmin = HomepagePartner & {
  category_ids: number[];
};

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeTier(tier: string): PartnerTier | null {
  const t = tier.trim().toLowerCase();
  if (t === "vip" || t === "standard") return t;
  return null;
}

function normalizeCategoryIds(ids: unknown): number[] {
  if (!Array.isArray(ids)) return [];
  const out = new Set<number>();
  for (const raw of ids) {
    const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
    if (Number.isFinite(n) && n > 0) out.add(n);
  }
  return [...out];
}

/** Negative id avoids collision with user ids in analytics. */
export function homepagePartnerPublicId(rowId: number): number {
  return -Math.abs(rowId);
}

export function toHomepagePartnerDto(row: HomepagePartner): TrustedPartnerDto {
  const tier = normalizeTier(row.tier) ?? "standard";
  const link = normalizeUrl(row.link_url);
  return {
    id: homepagePartnerPublicId(row.id),
    business_name: row.business_name.trim(),
    partner_logo_url: row.logo_url.trim(),
    profile_photo_url: null,
    profile_path: "/",
    click_url: link,
    tier,
    banner_urls: [],
  };
}

async function loadPartnerCategoryMap(): Promise<Map<number, number[]>> {
  const rows = await db
    .select({
      partner_id: homepagePartnerCategoriesTable.partner_id,
      category_id: homepagePartnerCategoriesTable.category_id,
    })
    .from(homepagePartnerCategoriesTable);

  const map = new Map<number, number[]>();
  for (const row of rows) {
    const list = map.get(row.partner_id) ?? [];
    list.push(row.category_id);
    map.set(row.partner_id, list);
  }
  return map;
}

export async function setPartnerCategories(
  partnerId: number,
  categoryIds: number[],
): Promise<void> {
  const ids = normalizeCategoryIds(categoryIds);
  await db
    .delete(homepagePartnerCategoriesTable)
    .where(eq(homepagePartnerCategoriesTable.partner_id, partnerId));

  if (ids.length === 0) return;

  await db.insert(homepagePartnerCategoriesTable).values(
    ids.map((category_id) => ({ partner_id: partnerId, category_id })),
  );
}

export async function listHomepagePartnersAdmin(): Promise<HomepagePartnerAdmin[]> {
  const [rows, categoryMap] = await Promise.all([
    db
      .select()
      .from(homepagePartnersTable)
      .orderBy(
        asc(homepagePartnersTable.tier),
        asc(homepagePartnersTable.sort_order),
        asc(homepagePartnersTable.id),
      ),
    loadPartnerCategoryMap(),
  ]);

  return rows.map((row) => ({
    ...row,
    category_ids: categoryMap.get(row.id) ?? [],
  }));
}

export async function fetchActiveHomepagePartners(
  tier: PartnerTier,
  limit: number,
  categoryId?: number,
): Promise<TrustedPartnerDto[]> {
  const cap = Math.max(1, Math.min(24, Math.floor(limit)));
  const scoped =
    categoryId != null && Number.isFinite(categoryId) && categoryId > 0;

  if (!scoped) {
    const rows = await db
      .select()
      .from(homepagePartnersTable)
      .where(
        and(eq(homepagePartnersTable.tier, tier), eq(homepagePartnersTable.is_active, true)),
      )
      .orderBy(asc(homepagePartnersTable.sort_order), asc(homepagePartnersTable.id))
      .limit(cap);

    return rows.map(toHomepagePartnerDto);
  }

  const treeIds = await getCategoryTreeIds(categoryId!);
  if (treeIds.length === 0) return [];

  const links = await db
    .select({ partner_id: homepagePartnerCategoriesTable.partner_id })
    .from(homepagePartnerCategoriesTable)
    .where(inArray(homepagePartnerCategoriesTable.category_id, treeIds));

  const partnerIds = [...new Set(links.map((l) => l.partner_id))];
  if (partnerIds.length === 0) return [];

  const rows = await db
    .select()
    .from(homepagePartnersTable)
    .where(
      and(
        eq(homepagePartnersTable.tier, tier),
        eq(homepagePartnersTable.is_active, true),
        inArray(homepagePartnersTable.id, partnerIds),
      ),
    )
    .orderBy(asc(homepagePartnersTable.sort_order), asc(homepagePartnersTable.id))
    .limit(cap);

  return rows.map(toHomepagePartnerDto);
}

export async function createHomepagePartner(
  input: HomepagePartnerInput,
): Promise<HomepagePartnerAdmin> {
  const tier = normalizeTier(input.tier);
  if (!tier) throw new Error("INVALID_TIER");

  const business_name = input.business_name.trim();
  const logo_url = input.logo_url.trim();
  const link_url = normalizeUrl(input.link_url);
  if (!business_name || !logo_url || !link_url) {
    throw new Error("MISSING_FIELDS");
  }

  const [row] = await db
    .insert(homepagePartnersTable)
    .values({
      business_name,
      logo_url,
      link_url,
      tier,
      sort_order: input.sort_order ?? 0,
      is_active: true,
    })
    .returning();

  if (!row) throw new Error("INSERT_FAILED");

  const category_ids = normalizeCategoryIds(input.category_ids);
  if (category_ids.length > 0) {
    await setPartnerCategories(row.id, category_ids);
  }

  return { ...row, category_ids };
}

export async function deleteHomepagePartner(id: number): Promise<boolean> {
  const result = await db
    .delete(homepagePartnersTable)
    .where(eq(homepagePartnersTable.id, id))
    .returning({ id: homepagePartnersTable.id });
  return result.length > 0;
}

export async function updateHomepagePartner(
  id: number,
  input: Partial<HomepagePartnerInput> & { is_active?: boolean },
): Promise<HomepagePartnerAdmin | null> {
  const updates: Partial<typeof homepagePartnersTable.$inferInsert> = {};
  if (input.business_name !== undefined) {
    const name = input.business_name.trim();
    if (!name) throw new Error("MISSING_FIELDS");
    updates.business_name = name;
  }
  if (input.logo_url !== undefined) {
    const logo = input.logo_url.trim();
    if (!logo) throw new Error("MISSING_FIELDS");
    updates.logo_url = logo;
  }
  if (input.link_url !== undefined) {
    const link = normalizeUrl(input.link_url);
    if (!link) throw new Error("MISSING_FIELDS");
    updates.link_url = link;
  }
  if (input.tier !== undefined) {
    const tier = normalizeTier(input.tier);
    if (!tier) throw new Error("INVALID_TIER");
    updates.tier = tier;
  }
  if (input.sort_order !== undefined) {
    updates.sort_order = input.sort_order;
  }
  if (input.is_active !== undefined) {
    updates.is_active = input.is_active;
  }

  let row: HomepagePartner | undefined;

  if (Object.keys(updates).length > 0) {
    const [updated] = await db
      .update(homepagePartnersTable)
      .set(updates)
      .where(eq(homepagePartnersTable.id, id))
      .returning();
    row = updated;
  } else {
    const [existing] = await db
      .select()
      .from(homepagePartnersTable)
      .where(eq(homepagePartnersTable.id, id))
      .limit(1);
    row = existing;
  }

  if (!row) return null;

  if (input.category_ids !== undefined) {
    await setPartnerCategories(id, normalizeCategoryIds(input.category_ids));
  }

  const categoryRows = await db
    .select({ category_id: homepagePartnerCategoriesTable.category_id })
    .from(homepagePartnerCategoriesTable)
    .where(eq(homepagePartnerCategoriesTable.partner_id, id));

  return {
    ...row,
    category_ids: categoryRows.map((r) => r.category_id),
  };
}
