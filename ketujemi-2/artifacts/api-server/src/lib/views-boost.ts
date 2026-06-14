import { db, listingsTable, shopsTable } from "@workspace/db";
import { and, lt, sql } from "drizzle-orm";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import { logger } from "./logger.js";

/** One-time: set views to 25–40 for active listings/shops currently below 30. */
export async function boostLowViewCounts(): Promise<{ listings: number; shops: number }> {
  const listingRows = await db
    .update(listingsTable)
    .set({ views: sql`25 + floor(random() * 16)::int` })
    .where(and(activeListingSqlCondition(), lt(listingsTable.views, 30)))
    .returning({ id: listingsTable.id });

  const shopRows = await db
    .update(shopsTable)
    .set({ views: sql`25 + floor(random() * 16)::int` })
    .where(and(activeShopSqlCondition(), lt(shopsTable.views, 30)))
    .returning({ id: shopsTable.id });

  const result = { listings: listingRows.length, shops: shopRows.length };
  logger.info(result, "views boost: low-count listings and shops updated");
  return result;
}
