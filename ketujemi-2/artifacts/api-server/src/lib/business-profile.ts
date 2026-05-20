import { db, listingsTable, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { isBusinessAccount, isVipBusinessActive } from "./business-rules";
import { normalizePhoneDigits } from "./listing-ownership";
import { partnerDisplayName, resolvePartnerLogoUrl } from "./trusted-partners";

export type PublicBusinessProfile = {
  id: number;
  business_name: string;
  partner_logo_url: string | null;
  profile_photo_url: string | null;
  city: string | null;
  about_me: string | null;
  is_vip: boolean;
  active_listing_count: number;
};

function sellerPhoneMatchCondition(digits: string) {
  const last8 = digits.slice(-8);
  return sql`(
    regexp_replace(${listingsTable.seller_phone}, '[^0-9]', '', 'g') = ${digits}
    OR regexp_replace(${listingsTable.seller_phone}, '[^0-9]', '', 'g') LIKE ${"%" + last8}
  )`;
}

function listingOwnerConditions(user: User) {
  const parts = [];
  const seen = new Set<string>();

  for (const raw of [user.phone_e164_digits, user.contact_phone]) {
    if (!raw) continue;
    const d = normalizePhoneDigits(raw);
    if (d.length >= 8 && !seen.has(d)) {
      seen.add(d);
      parts.push(sellerPhoneMatchCondition(d));
    }
  }

  const email = user.email?.trim().toLowerCase();
  if (email) {
    parts.push(sql`${listingsTable.description} ILIKE ${"%Email: " + email + "%"}`);
  }

  return parts;
}

export async function getBusinessUserById(id: number): Promise<User | null> {
  const [row] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!row || !isBusinessAccount(row)) return null;
  if (row.banned_at) return null;
  if (row.suspended_until && new Date(row.suspended_until) > new Date()) return null;
  return row;
}

export async function getActiveListingsForBusinessUser(user: User) {
  const ownerParts = listingOwnerConditions(user);
  if (ownerParts.length === 0) return [];

  const now = new Date();
  return db
    .select()
    .from(listingsTable)
    .where(
      and(
        gt(listingsTable.expires_at, now),
        eq(listingsTable.status, "active"),
        or(...ownerParts),
      ),
    )
    .orderBy(desc(listingsTable.listed_at));
}

export async function buildPublicBusinessProfile(user: User): Promise<PublicBusinessProfile> {
  const listings = await getActiveListingsForBusinessUser(user);
  return {
    id: user.id,
    business_name: partnerDisplayName(user),
    partner_logo_url: resolvePartnerLogoUrl(user),
    profile_photo_url: user.profile_photo_url?.trim() || null,
    city: user.city?.trim() || null,
    about_me: user.about_me?.trim() || null,
    is_vip: isVipBusinessActive(user),
    active_listing_count: listings.length,
  };
}
