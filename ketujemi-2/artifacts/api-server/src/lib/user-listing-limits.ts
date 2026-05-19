import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { gt } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";

/** Max active (non-expired) listings per user at once. */
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

export async function assertUserActiveListingCap(user: User): Promise<void> {
  const used = await countUserActiveListings(user);
  if (used >= MAX_ACTIVE_LISTINGS_PER_USER) {
    const err = new Error("LISTING_MONTHLY_CAP") as Error & {
      used: number;
      limit: number;
      publicMessage: string;
    };
    err.used = used;
    err.limit = MAX_ACTIVE_LISTINGS_PER_USER;
    err.publicMessage = `Keni arritur ${MAX_ACTIVE_LISTINGS_PER_USER} njoftime aktive. Fshini një njoftim para se të postoni të ri.`;
    throw err;
  }
}
