import { db, listingsTable, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { and, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { isVipBusinessActive } from "./business-rules";
import { isBusinessPartnerActive, parsePartnerBannerUrls } from "./business-partner";
import { partnerProfilePath } from "./partner-public-profile";
import { getCategoryTreeIds } from "./category-tree";
import { userOwnsListing } from "./listing-ownership";
import {
  loadBusinessPartnerCategoryMap,
  userHasAdminPartnerCategories,
  userMatchesAdminPartnerCategory,
} from "./business-partner-categories";
import { fetchActiveHomepagePartners } from "./homepage-partners";

export type TrustedPartnerDto = {
  id: number;
  business_name: string;
  partner_logo_url: string | null;
  profile_photo_url: string | null;
  profile_path: string;
  click_url: string | null;
  tier: PartnerTier;
  banner_urls: string[];
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

  return rows.filter(
    (u) => isVipBusinessActive(u) && isAccountActive(u) && isBusinessPartnerActive(u),
  );
}

/** VIP partners with at least one active listing in the given category tree. */
export async function fetchTrustedVipPartnersForCategory(
  categoryId: number,
): Promise<User[]> {
  const categoryIds = await getCategoryTreeIds(categoryId);
  if (categoryIds.length === 0) return [];

  const vipUsers = await fetchTrustedVipPartners();
  if (vipUsers.length === 0) return [];

  const categoryMap = await loadBusinessPartnerCategoryMap();
  const adminPlaced: User[] = [];
  const autoCandidates: User[] = [];

  for (const user of vipUsers) {
    if (userHasAdminPartnerCategories(user.id, categoryMap)) {
      if (await userMatchesAdminPartnerCategory(user.id, categoryId, categoryMap)) {
        adminPlaced.push(user);
      }
    } else {
      autoCandidates.push(user);
    }
  }

  if (autoCandidates.length === 0) return adminPlaced;

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

  const listingMatched: User[] = [];
  if (listings.length > 0) {
    for (const user of autoCandidates) {
      const hasListing = listings.some((l) => userOwnsListing(user, l));
      if (hasListing) listingMatched.push(user);
    }
  }

  const seen = new Set<number>();
  const merged: User[] = [];
  for (const u of [...adminPlaced, ...listingMatched]) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    merged.push(u);
  }
  return merged;
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

  return rows.filter(
    (u) => !isVipBusinessActive(u) && isAccountActive(u) && isBusinessPartnerActive(u),
  );
}

/** Standard partners with at least one active listing in the given category tree. */
export async function fetchTrustedStandardPartnersForCategory(
  categoryId: number,
): Promise<User[]> {
  const categoryIds = await getCategoryTreeIds(categoryId);
  if (categoryIds.length === 0) return [];

  const standardUsers = await fetchTrustedStandardPartners();
  if (standardUsers.length === 0) return [];

  const categoryMap = await loadBusinessPartnerCategoryMap();
  const adminPlaced: User[] = [];
  const autoCandidates: User[] = [];

  for (const user of standardUsers) {
    if (userHasAdminPartnerCategories(user.id, categoryMap)) {
      if (await userMatchesAdminPartnerCategory(user.id, categoryId, categoryMap)) {
        adminPlaced.push(user);
      }
    } else {
      autoCandidates.push(user);
    }
  }

  if (autoCandidates.length === 0) return adminPlaced;

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

  const listingMatched: User[] = [];
  if (listings.length > 0) {
    for (const user of autoCandidates) {
      const hasListing = listings.some((l) => userOwnsListing(user, l));
      if (hasListing) listingMatched.push(user);
    }
  }

  const seen = new Set<number>();
  const merged: User[] = [];
  for (const u of [...adminPlaced, ...listingMatched]) {
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    merged.push(u);
  }
  return merged;
}

export function toTrustedPartnerDto(user: User, tier: PartnerTier): TrustedPartnerDto {
  return {
    id: user.id,
    business_name: partnerDisplayName(user),
    partner_logo_url: user.partner_logo_url?.trim() || null,
    profile_photo_url: user.profile_photo_url?.trim() || null,
    profile_path: partnerProfilePath(user.id),
    click_url: null,
    tier,
    banner_urls:
      tier === "vip" ? parsePartnerBannerUrls(user.partner_banner_urls) : [],
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
  const scoped =
    categoryId != null && Number.isFinite(categoryId) && categoryId > 0;

  if (!scoped) {
    const curated = await fetchActiveHomepagePartners(tier, cap);
    if (curated.length >= cap) {
      return curated.slice(0, cap);
    }
    const remaining = cap - curated.length;
    const pool = await fetchTrustedPartnersPool(tier);
    const business = shuffle(pool)
      .slice(0, remaining)
      .map((u) => toTrustedPartnerDto(u, tier));
    return [...curated, ...business];
  }

  const curated = await fetchActiveHomepagePartners(tier, cap, categoryId);
  if (curated.length >= cap) {
    return curated.slice(0, cap);
  }
  const remaining = cap - curated.length;
  const pool = await fetchTrustedPartnersPool(tier, categoryId);
  const business = shuffle(pool)
    .slice(0, remaining)
    .map((u) => toTrustedPartnerDto(u, tier));
  return [...curated, ...business];
}
