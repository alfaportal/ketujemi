import { db } from "@workspace/db";
import {
  listingsTable,
  listingReportsTable,
  listingModerationFlagsTable,
  sellerComplaintsTable,
  businessPaymentsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logListingDeletion, type ListingDeletionSource } from "./listing-deletion-log";

/** Remove dependent rows so listing delete is not blocked by FK constraints. */
export async function deleteListingCascade(
  listingId: number,
  source: ListingDeletionSource = "system",
): Promise<boolean> {
  const [existing] = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      category_id: listingsTable.category_id,
      price: listingsTable.price,
    })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  await db
    .delete(listingReportsTable)
    .where(eq(listingReportsTable.listing_id, listingId));

  await db
    .delete(listingModerationFlagsTable)
    .where(eq(listingModerationFlagsTable.listing_id, listingId));

  await db
    .update(sellerComplaintsTable)
    .set({ listing_id: null })
    .where(eq(sellerComplaintsTable.listing_id, listingId));

  await db
    .update(businessPaymentsTable)
    .set({ listing_id: null })
    .where(eq(businessPaymentsTable.listing_id, listingId));

  const deleted = await db
    .delete(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .returning({ id: listingsTable.id });

  if (deleted.length > 0 && existing) {
    await logListingDeletion({
      listingId: existing.id,
      title: existing.title,
      categoryId: existing.category_id,
      price: existing.price,
      source,
    });
  }

  return deleted.length > 0;
}
