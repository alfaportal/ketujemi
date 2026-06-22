import {
  db,
  pool,
  deletionFeedbackTable,
  listingsTable,
  shopApplicationsTable,
  shopRatingsTable,
  shopSocialProfileEnrichmentsTable,
  shopsTable,
} from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { deleteListingCascade } from "./delete-listing-cascade";

async function clearShopForeignReferences(shopId: number): Promise<void> {
  try {
    await pool.query(`UPDATE deletion_feedback SET shop_id = NULL WHERE shop_id = $1`, [shopId]);
  } catch {
    try {
      await db
        .update(deletionFeedbackTable)
        .set({ shop_id: null })
        .where(eq(deletionFeedbackTable.shop_id, shopId));
    } catch {
      /* optional table */
    }
  }

  try {
    await db.delete(shopRatingsTable).where(eq(shopRatingsTable.shop_id, shopId));
  } catch {
    /* optional table */
  }

  try {
    await db
      .delete(shopSocialProfileEnrichmentsTable)
      .where(eq(shopSocialProfileEnrichmentsTable.shop_id, shopId));
  } catch {
    /* optional table */
  }
}

async function deleteShopApplicationsForShop(
  shopId: number,
  applicationId: number | null,
): Promise<void> {
  const conditions = [eq(shopApplicationsTable.shop_id, shopId)];
  if (applicationId) {
    conditions.push(eq(shopApplicationsTable.id, applicationId));
  }
  await db.delete(shopApplicationsTable).where(or(...conditions));
}

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

  await clearShopForeignReferences(shopId);
  await deleteShopApplicationsForShop(shopId, shop.application_id);
  await db.delete(shopsTable).where(eq(shopsTable.id, shopId));

  return true;
}

/** Admin list is application-centric — delete application and linked shop if present. */
export async function deleteShopApplicationByAdmin(applicationId: number): Promise<boolean> {
  const [app] = await db
    .select()
    .from(shopApplicationsTable)
    .where(eq(shopApplicationsTable.id, applicationId))
    .limit(1);
  if (!app) return false;

  if (app.shop_id) {
    return deleteShopCascade(app.shop_id, "admin");
  }

  await db.delete(shopApplicationsTable).where(eq(shopApplicationsTable.id, applicationId));
  return true;
}
