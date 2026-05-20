import { db, usersTable } from "@workspace/db";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { isVipBusinessActive } from "./business-rules";
import {
  normalizePhoneDigits,
  parseSpecsEmailFromDescription,
} from "./listing-ownership";

export type VipSellerLookup = {
  phones: Set<string>;
  emails: Set<string>;
};

function addPhoneKey(set: Set<string>, raw: string | null | undefined): void {
  const d = normalizePhoneDigits(raw ?? "");
  if (d.length < 8) return;
  set.add(d);
  set.add(d.slice(-8));
}

export async function getVipSellerLookup(): Promise<VipSellerLookup> {
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

  const phones = new Set<string>();
  const emails = new Set<string>();

  for (const u of rows) {
    if (!isVipBusinessActive(u)) continue;
    addPhoneKey(phones, u.phone_e164_digits);
    addPhoneKey(phones, u.contact_phone);
    const email = u.email?.trim().toLowerCase();
    if (email) emails.add(email);
  }

  return { phones, emails };
}

export function isVipSellerListing(
  listing: { seller_phone: string; description: string },
  lookup: VipSellerLookup,
): boolean {
  const d = normalizePhoneDigits(listing.seller_phone);
  if (d.length >= 8) {
    if (lookup.phones.has(d) || lookup.phones.has(d.slice(-8))) return true;
  }

  const specEmail = parseSpecsEmailFromDescription(listing.description);
  if (specEmail && lookup.emails.has(specEmail)) return true;

  return false;
}

export async function annotateListingsWithVipFlag<
  T extends { seller_phone: string; description: string },
>(listings: T[]): Promise<(T & { is_vip_seller: boolean })[]> {
  if (listings.length === 0) return [];
  const lookup = await getVipSellerLookup();
  return listings.map((l) => ({
    ...l,
    is_vip_seller: isVipSellerListing(l, lookup),
  }));
}
