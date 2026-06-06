import { db, listingsTable, shopApplicationsTable, shopsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { deleteListingCascade } from "./delete-listing-cascade";

export async function deleteShopCascade(
  shopId: number,
  source: "admin" | "owner" = "admin",
): Promise<boolean> {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, shopId)).limit(1);
  if (!shop) return false;

  const listingRows = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.shop_id, shopId));

  const listingSource = source === "admin" ? "admin" : "system";
  for (const row of listingRows) {
    await deleteListingCascade(row.id, listingSource);
  }

  await db.delete(shopsTable).where(eq(shopsTable.id, shopId));

  if (shop.application_id) {
    await db
      .update(shopApplicationsTable)
      .set({
        shop_id: null,
        status: "rejected",
        rejected_reason: "Dyqani u fshi",
      })
      .where(eq(shopApplicationsTable.id, shop.application_id));
  } else {
    await db
      .update(shopApplicationsTable)
      .set({ shop_id: null, status: "rejected", rejected_reason: "Dyqani u fshi" })
      .where(eq(shopApplicationsTable.shop_id, shopId));
  }

  return true;
}
