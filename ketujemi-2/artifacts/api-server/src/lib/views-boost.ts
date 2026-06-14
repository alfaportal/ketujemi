import { db, listingsTable, shopsTable } from "@workspace/db";
import { and, lt, sql } from "drizzle-orm";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import { VIEWS_DAILY_INCREMENT_CAP } from "./views-constants.js";
import { logger } from "./logger.js";

/**
 * One-time: spread low counts by id (not one flat random band) for active rows below 30 views.
 * Formula: 12 + (id % 43) + random 0–8 → roughly 12–62, each id its own lane.
 */
const LISTING_BOOST_VIEWS_SQL = sql`LEAST(
  12 + (${listingsTable.id} % 43) + floor(random() * 9)::int,
  ${VIEWS_DAILY_INCREMENT_CAP}
)`;

const SHOP_BOOST_VIEWS_SQL = sql`LEAST(
  12 + (${shopsTable.id} % 43) + floor(random() * 9)::int,
  ${VIEWS_DAILY_INCREMENT_CAP}
)`;

export async function boostLowViewCounts(): Promise<{ listings: number; shops: number }> {
  const listingRows = await db
    .update(listingsTable)
    .set({ views: LISTING_BOOST_VIEWS_SQL })
    .where(and(activeListingSqlCondition(), lt(listingsTable.views, 30)))
    .returning({ id: listingsTable.id });

  const shopRows = await db
    .update(shopsTable)
    .set({ views: SHOP_BOOST_VIEWS_SQL })
    .where(and(activeShopSqlCondition(), lt(shopsTable.views, 30)))
    .returning({ id: shopsTable.id });

  const result = { listings: listingRows.length, shops: shopRows.length };
  logger.info({ ...result, cap: VIEWS_DAILY_INCREMENT_CAP }, "views boost: low-count listings and shops updated");
  return result;
}
