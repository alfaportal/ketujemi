import { db, listingsTable, shopsTable } from "@workspace/db";
import { and, gte, sql } from "drizzle-orm";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import {
  VIEWS_BOOST_TRIM_AMOUNT,
  VIEWS_BOOST_TRIM_MIN_VIEWS,
} from "./views-constants.js";
import { logger } from "./logger.js";

/**
 * One-time correction: pull back ~20 views on artificially boosted rows (organic low counts untouched).
 */
export async function trimExcessBoostedViews(): Promise<{ listings: number; shops: number }> {
  const trimSql = (tableViews: typeof listingsTable.views) =>
    sql`GREATEST(${tableViews} - ${VIEWS_BOOST_TRIM_AMOUNT}, 0)`;

  const listingRows = await db
    .update(listingsTable)
    .set({ views: trimSql(listingsTable.views) })
    .where(and(activeListingSqlCondition(), gte(listingsTable.views, VIEWS_BOOST_TRIM_MIN_VIEWS)))
    .returning({ id: listingsTable.id });

  const shopRows = await db
    .update(shopsTable)
    .set({ views: trimSql(shopsTable.views) })
    .where(and(activeShopSqlCondition(), gte(shopsTable.views, VIEWS_BOOST_TRIM_MIN_VIEWS)))
    .returning({ id: shopsTable.id });

  const result = { listings: listingRows.length, shops: shopRows.length };
  logger.info(
    { ...result, trim: VIEWS_BOOST_TRIM_AMOUNT, min_views: VIEWS_BOOST_TRIM_MIN_VIEWS },
    "views boost trim finished",
  );
  return result;
}
