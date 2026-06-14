import { db, listingsTable, shopsTable } from "@workspace/db";
import { and, lt, sql } from "drizzle-orm";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import { VIEWS_DAILY_INCREMENT_CAP } from "./views-constants.js";
import { listingCreatedOutsideTrimWindow } from "./views-listing-date-range.js";
import { logger } from "./logger.js";

/**
 * One-time: spread low counts by id (not one flat random band) for active rows below 30 views.
 * Listings from 13–14.06 are excluded; all eligible shops are boosted.
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
    .where(
      and(
        activeListingSqlCondition(),
        lt(listingsTable.views, 30),
        listingCreatedOutsideTrimWindow(),
      ),
    )
    .returning({ id: listingsTable.id });

  const shopRows = await db
    .update(shopsTable)
    .set({ views: SHOP_BOOST_VIEWS_SQL })
    .where(and(activeShopSqlCondition(), lt(shopsTable.views, 30)))
    .returning({ id: shopsTable.id });

  const result = { listings: listingRows.length, shops: shopRows.length };
  logger.info(
    { ...result, cap: VIEWS_DAILY_INCREMENT_CAP, exclude: "listings created 13–14.06" },
    "views boost: low-count listings (except 13–14.06) and all eligible shops updated",
  );
  return result;
}
