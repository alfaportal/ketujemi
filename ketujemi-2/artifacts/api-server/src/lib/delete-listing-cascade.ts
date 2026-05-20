import { db } from "@workspace/db";
import {
  listingsTable,
  listingReportsTable,
  listingModerationFlagsTable,
  sellerComplaintsTable,
  businessPaymentsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

/** Remove dependent rows so listing delete is not blocked by FK constraints. */
export async function deleteListingCascade(listingId: number): Promise<boolean> {
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

  return deleted.length > 0;
}
