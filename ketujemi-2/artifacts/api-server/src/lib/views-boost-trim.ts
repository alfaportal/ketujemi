import { db, listingsTable } from "@workspace/db";
import { and, gte, sql } from "drizzle-orm";
import { activeListingSqlCondition } from "./listing-visibility.js";
import {
  VIEWS_BOOST_TRIM_AMOUNT,
  VIEWS_BOOST_TRIM_MIN_VIEWS,
} from "./views-constants.js";
import {
  listingCreatedInTrimWindow,
  viewsTrimListingRangeBounds,
} from "./views-listing-date-range.js";
import { logger } from "./logger.js";

/**
 * Lower ~20 views only on listings created 13–14.06 (over-boosted batch). Shops untouched.
 */
export async function trimExcessBoostedViews(): Promise<{ listings: number; shops: number }> {
  const trimSql = sql`GREATEST(${listingsTable.views} - ${VIEWS_BOOST_TRIM_AMOUNT}, 0)`;
  const { start, endExclusive } = viewsTrimListingRangeBounds();

  const listingRows = await db
    .update(listingsTable)
    .set({ views: trimSql })
    .where(
      and(
        activeListingSqlCondition(),
        listingCreatedInTrimWindow(),
        gte(listingsTable.views, VIEWS_BOOST_TRIM_MIN_VIEWS),
      ),
    )
    .returning({ id: listingsTable.id });

  const result = { listings: listingRows.length, shops: 0 };
  logger.info(
    {
      ...result,
      trim: VIEWS_BOOST_TRIM_AMOUNT,
      min_views: VIEWS_BOOST_TRIM_MIN_VIEWS,
      trim_window_start: start.toISOString(),
      trim_window_end_exclusive: endExclusive.toISOString(),
    },
    "views boost trim finished (13–14.06 listings only)",
  );
  return result;
}
