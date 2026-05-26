import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { gt } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";
import { isBusinessAccount } from "./business-rules";
import { getUserExtraListingSlots } from "./listing-packages";

/** Max active (non-expired) listings per user at once (before package extras). */
export const MAX_ACTIVE_LISTINGS_PER_USER = 10;

export async function countUserActiveListings(user: User): Promise<number> {
  const rows = await db
    .select({
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
    })
    .from(listingsTable)
    .where(gt(listingsTable.expires_at, new Date()));

  return rows.filter((l) => userOwnsListing(user, l)).length;
}

export async function getEffectiveActiveListingCap(user: User): Promise<number> {
  const extra = isBusinessAccount(user) ? 0 : await getUserExtraListingSlots(user.id);
  return MAX_ACTIVE_LISTINGS_PER_USER + extra;
}

export async function assertUserActiveListingCap(user: User): Promise<void> {
  const used = await countUserActiveListings(user);
  const limit = await getEffectiveActiveListingCap(user);
  if (used >= limit) {
    const err = new Error("LISTING_MONTHLY_CAP") as Error & {
      used: number;
      limit: number;
      base_limit: number;
      publicMessage: string;
      show_packages: boolean;
    };
    err.used = used;
    err.limit = limit;
    err.base_limit = MAX_ACTIVE_LISTINGS_PER_USER;
    err.show_packages = true;
    err.publicMessage =
      limit > MAX_ACTIVE_LISTINGS_PER_USER
        ? `Keni arritur ${limit} njoftime aktive (me paketë shtesë). Fshini një njoftim ose blini paketë të re.`
        : `Ke arritur limitin falas. Zgjero me një paketë shtesë.`;
    throw err;
  }
}
