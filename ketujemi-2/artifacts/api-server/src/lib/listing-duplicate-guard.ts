import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { gt } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";
import { normalizeTitleForDuplicate } from "./business-rules";

export async function findDuplicateActiveListing(
  user: User,
  title: string,
  excludeListingId?: number,
): Promise<number | null> {
  const norm = normalizeTitleForDuplicate(title);
  if (!norm) return null;

  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      seller_phone: listingsTable.seller_phone,
      description: listingsTable.description,
    })
    .from(listingsTable)
    .where(gt(listingsTable.expires_at, new Date()));

  for (const row of rows) {
    if (excludeListingId != null && row.id === excludeListingId) continue;
    if (!userOwnsListing(user, row)) continue;
    if (normalizeTitleForDuplicate(row.title) === norm) {
      return row.id;
    }
  }
  return null;
}

/** Block post if user already has the same active listing. */
export async function assertNoDuplicateListing(
  user: User,
  title: string,
  excludeListingId?: number,
): Promise<void> {
  const dupId = await findDuplicateActiveListing(user, title, excludeListingId);
  if (dupId == null) return;

  const err = new Error("DUPLICATE_LISTING") as Error & {
    duplicateListingId: number;
    publicMessage: string;
  };
  err.duplicateListingId = dupId;
  err.publicMessage =
    "Keni një njoftim të ngjashëm aktiv. Fshijeni atë para se të postoni të riun.";
  throw err;
}
