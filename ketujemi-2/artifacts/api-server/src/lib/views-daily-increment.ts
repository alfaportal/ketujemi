import { db, listingsTable, shopsTable } from "@workspace/db";
import { and, lt, sql } from "drizzle-orm";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import { logger } from "./logger.js";

/** Automatic daily baseline stops once views reach this — real traffic still increments above it. */
export const VIEWS_DAILY_INCREMENT_CAP = 100;

const DAILY_INCREMENT_SQL = sql`CASE WHEN random() < 0.5 THEN 6 ELSE 7 END`;

/** Batch +6 or +7 views on active listings/shops below the cap (baseline, independent of traffic). */
export async function incrementDailyViewBaselines(): Promise<{
  listings: number;
  shops: number;
}> {
  const listingRows = await db
    .update(listingsTable)
    .set({ views: sql`${listingsTable.views} + ${DAILY_INCREMENT_SQL}` })
    .where(
      and(activeListingSqlCondition(), lt(listingsTable.views, VIEWS_DAILY_INCREMENT_CAP)),
    )
    .returning({ id: listingsTable.id });

  const shopRows = await db
    .update(shopsTable)
    .set({ views: sql`${shopsTable.views} + ${DAILY_INCREMENT_SQL}` })
    .where(and(activeShopSqlCondition(), lt(shopsTable.views, VIEWS_DAILY_INCREMENT_CAP)))
    .returning({ id: shopsTable.id });

  const result = { listings: listingRows.length, shops: shopRows.length };
  logger.info(result, "views daily increment finished");
  return result;
}
