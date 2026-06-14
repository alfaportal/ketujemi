import { db, listingsTable, shopsTable } from "@workspace/db";
import { and, lt, sql } from "drizzle-orm";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import { VIEWS_DAILY_INCREMENT_CAP } from "./views-constants.js";
import { logger } from "./logger.js";

export { VIEWS_DAILY_INCREMENT_CAP };

/**
 * Per-row varied bump (4–10) from id spread + random — avoids every listing/shop climbing in lockstep.
 * LEAST(..., cap) so automatic traffic never exceeds the cap.
 */
const LISTING_DAILY_VIEWS_SQL = sql`LEAST(
  ${listingsTable.views} + (4 + (${listingsTable.id} % 4) + floor(random() * 4)::int),
  ${VIEWS_DAILY_INCREMENT_CAP}
)`;

const SHOP_DAILY_VIEWS_SQL = sql`LEAST(
  ${shopsTable.views} + (4 + (${shopsTable.id} % 4) + floor(random() * 4)::int),
  ${VIEWS_DAILY_INCREMENT_CAP}
)`;

/** Daily baseline on active listings/shops still below the cap. */
export async function incrementDailyViewBaselines(): Promise<{
  listings: number;
  shops: number;
}> {
  const listingRows = await db
    .update(listingsTable)
    .set({ views: LISTING_DAILY_VIEWS_SQL })
    .where(
      and(activeListingSqlCondition(), lt(listingsTable.views, VIEWS_DAILY_INCREMENT_CAP)),
    )
    .returning({ id: listingsTable.id });

  const shopRows = await db
    .update(shopsTable)
    .set({ views: SHOP_DAILY_VIEWS_SQL })
    .where(
      and(activeShopSqlCondition(), lt(shopsTable.views, VIEWS_DAILY_INCREMENT_CAP)),
    )
    .returning({ id: shopsTable.id });

  const result = { listings: listingRows.length, shops: shopRows.length };
  logger.info({ ...result, cap: VIEWS_DAILY_INCREMENT_CAP }, "views daily increment finished");
  return result;
}
