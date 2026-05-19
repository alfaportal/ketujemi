import { db, listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { eq, gt } from "drizzle-orm";
import { userOwnsListing } from "./listing-ownership";
import { normalizeTitleForDuplicate } from "./business-rules";

export async function findDuplicateActiveListing(
  user: User,
  title: string,
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
    if (!userOwnsListing(user, row)) continue;
    if (normalizeTitleForDuplicate(row.title) === norm) {
      return row.id;
    }
  }
  return null;
}

/**
 * If user already has a similar active listing: delete the old one and allow the new post.
 */
export async function replaceDuplicateListingIfAny(
  user: User,
  title: string,
): Promise<{ replaced: boolean; deletedListingId?: number }> {
  const dupId = await findDuplicateActiveListing(user, title);
  if (dupId == null) {
    return { replaced: false };
  }

  await db.delete(listingsTable).where(eq(listingsTable.id, dupId));
  return { replaced: true, deletedListingId: dupId };
}
