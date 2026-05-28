import { db, homepagePartnersTable } from "@workspace/db";
import type { HomepagePartner } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import type { PartnerTier, TrustedPartnerDto } from "./trusted-partners";

export type HomepagePartnerInput = {
  business_name: string;
  logo_url: string;
  link_url: string;
  tier: PartnerTier;
  sort_order?: number;
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
    profile_path: link,
    click_url: link,
    tier,
    banner_urls: [],
  };
}

export async function listHomepagePartnersAdmin(): Promise<HomepagePartner[]> {
  return db
    .select()
    .from(homepagePartnersTable)
    .orderBy(asc(homepagePartnersTable.tier), asc(homepagePartnersTable.sort_order), asc(homepagePartnersTable.id));
}

export async function fetchActiveHomepagePartners(
  tier: PartnerTier,
  limit: number,
): Promise<TrustedPartnerDto[]> {
  const cap = Math.max(1, Math.min(24, Math.floor(limit)));
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

export async function createHomepagePartner(
  input: HomepagePartnerInput,
): Promise<HomepagePartner> {
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
  return row;
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
): Promise<HomepagePartner | null> {
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

  if (Object.keys(updates).length === 0) {
    const [existing] = await db
      .select()
      .from(homepagePartnersTable)
      .where(eq(homepagePartnersTable.id, id))
      .limit(1);
    return existing ?? null;
  }

  const [row] = await db
    .update(homepagePartnersTable)
    .set(updates)
    .where(eq(homepagePartnersTable.id, id))
    .returning();

  return row ?? null;
}
