import { db, listingsTable, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { and, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { isVipBusinessActive } from "./business-rules";
import { getCategoryTreeIds } from "./category-tree";
import { userOwnsListing } from "./listing-ownership";

export type TrustedPartnerDto = {
  id: number;
  business_name: string;
  partner_logo_url: string | null;
  profile_photo_url: string | null;
  profile_path: string;
};

export function partnerDisplayName(user: Pick<User, "business_name" | "display_name">): string {
  return user.business_name?.trim() || user.display_name?.trim() || "Biznes";
}

export function resolvePartnerLogoUrl(
  user: Pick<User, "partner_logo_url" | "profile_photo_url">,
): string | null {
  const url = user.partner_logo_url?.trim() || user.profile_photo_url?.trim();
  return url || null;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a_i = a[i]!;
    const a_j = a[j]!;
    a[i] = a_j;
    a[j] = a_i;
  }
  return a;
}

function isAccountActive(user: User): boolean {
  if (user.banned_at) return false;
  if (user.suspended_until && new Date(user.suspended_until) > new Date()) return false;
  return true;
}

export type PartnerTier = "vip" | "standard";

/** Active VIP business accounts eligible for the trusted partners strip. */
export async function fetchTrustedVipPartners(): Promise<User[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.account_type, "business"),
        eq(usersTable.business_tier, "vip"),
        gt(usersTable.vip_expires_at, now),
        isNull(usersTable.banned_at),
        or(isNull(usersTable.suspended_until), sql`${usersTable.suspended_until} <= ${now}`),
      ),
    );

  return rows.filter((u) => isVipBusinessActive(u) && isAccountActive(u));
}

/** VIP partners with at least one active listing in the given category tree. */
export async function fetchTrustedVipPartnersForCategory(
  categoryId: number,
): Promise<User[]> {
  const categoryIds = await getCategoryTreeIds(categoryId);
  if (categoryIds.length === 0) return [];

  const vipUsers = await fetchTrustedVipPartners();
  if (vipUsers.length === 0) return [];

  const now = new Date();
  const listings = await db
    .select({
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
    })
    .from(listingsTable)
    .where(
      and(
        inArray(listingsTable.category_id, categoryIds),
        gt(listingsTable.expires_at, now),
        eq(listingsTable.status, "active"),
      ),
    );

  if (listings.length === 0) return [];

  const matched: User[] = [];
  for (const user of vipUsers) {
    const hasListing = listings.some((l) => userOwnsListing(user, l));
    if (hasListing) matched.push(user);
  }
  return matched;
}

/** Active standard (non-VIP) business accounts for the partner strip. */
export async function fetchTrustedStandardPartners(): Promise<User[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.account_type, "business"),
        isNull(usersTable.banned_at),
        or(isNull(usersTable.suspended_until), sql`${usersTable.suspended_until} <= ${now}`),
      ),
    );

  return rows.filter((u) => !isVipBusinessActive(u) && isAccountActive(u));
}

/** Standard partners with at least one active listing in the given category tree. */
export async function fetchTrustedStandardPartnersForCategory(
  categoryId: number,
): Promise<User[]> {
  const categoryIds = await getCategoryTreeIds(categoryId);
  if (categoryIds.length === 0) return [];

  const standardUsers = await fetchTrustedStandardPartners();
  if (standardUsers.length === 0) return [];

  const now = new Date();
  const listings = await db
    .select({
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
    })
    .from(listingsTable)
    .where(
      and(
        inArray(listingsTable.category_id, categoryIds),
        gt(listingsTable.expires_at, now),
        eq(listingsTable.status, "active"),
      ),
    );

  if (listings.length === 0) return [];

  const matched: User[] = [];
  for (const user of standardUsers) {
    const hasListing = listings.some((l) => userOwnsListing(user, l));
    if (hasListing) matched.push(user);
  }
  return matched;
}

export function toTrustedPartnerDto(user: User): TrustedPartnerDto {
  return {
    id: user.id,
    business_name: partnerDisplayName(user),
    partner_logo_url: user.partner_logo_url?.trim() || null,
    profile_photo_url: user.profile_photo_url?.trim() || null,
    profile_path: `/biznes/${user.id}`,
  };
}

async function fetchTrustedPartnersPool(
  tier: PartnerTier,
  categoryId?: number,
): Promise<User[]> {
  const scoped =
    categoryId != null && Number.isFinite(categoryId) && categoryId > 0;
  if (tier === "standard") {
    return scoped
      ? await fetchTrustedStandardPartnersForCategory(categoryId!)
      : await fetchTrustedStandardPartners();
  }
  return scoped
    ? await fetchTrustedVipPartnersForCategory(categoryId!)
    : await fetchTrustedVipPartners();
}

/** Random order on every request — fair rotation for VIP / standard partners. */
export async function getTrustedPartnersShuffled(
  limit: number,
  categoryId?: number,
  tier: PartnerTier = "vip",
): Promise<TrustedPartnerDto[]> {
  const cap = Math.max(1, Math.min(24, Math.floor(limit)));
  const pool = await fetchTrustedPartnersPool(tier, categoryId);
  const partners = shuffle(pool).slice(0, cap);
  return partners.map(toTrustedPartnerDto);
}
