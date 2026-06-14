import { db, listingsTable, shopsTable } from "@workspace/db";
import { and, lt, sql } from "drizzle-orm";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import {
  VIEWS_DAILY_INCREMENT_CAP,
  VIEWS_DAILY_STAGGER_BUCKETS,
} from "./views-constants.js";
import { logger } from "./logger.js";

export { VIEWS_DAILY_INCREMENT_CAP };

/** UTC day index — rotates which id-bucket receives the automatic bump today. */
export function viewsDailyStaggerBucket(nowMs = Date.now()): number {
  const dayIndex = Math.floor(nowMs / 86_400_000);
  return dayIndex % VIEWS_DAILY_STAGGER_BUCKETS;
}

/**
 * Per-row varied bump (4–10). Only ~1/7 of inventory per day (id % 7 = today's bucket).
 * LEAST(..., cap) so automatic traffic never exceeds the cap.
 */
function listingDailyViewsSql() {
  return sql`LEAST(
    ${listingsTable.views} + (4 + (${listingsTable.id} % 4) + floor(random() * 4)::int),
    ${VIEWS_DAILY_INCREMENT_CAP}
  )`;
}

function shopDailyViewsSql() {
  return sql`LEAST(
    ${shopsTable.views} + (4 + (${shopsTable.id} % 4) + floor(random() * 4)::int),
    ${VIEWS_DAILY_INCREMENT_CAP}
  )`;
}

function staggerCondition(tableId: typeof listingsTable.id, bucket: number) {
  return sql`(${tableId} % ${VIEWS_DAILY_STAGGER_BUCKETS}) = ${bucket}`;
}

/** Daily baseline on a staggered subset of active listings/shops still below the cap. */
export async function incrementDailyViewBaselines(nowMs = Date.now()): Promise<{
  listings: number;
  shops: number;
  bucket: number;
  stagger_buckets: number;
}> {
  const bucket = viewsDailyStaggerBucket(nowMs);

  const listingRows = await db
    .update(listingsTable)
    .set({ views: listingDailyViewsSql() })
    .where(
      and(
        activeListingSqlCondition(),
        lt(listingsTable.views, VIEWS_DAILY_INCREMENT_CAP),
        staggerCondition(listingsTable.id, bucket),
      ),
    )
    .returning({ id: listingsTable.id });

  const shopRows = await db
    .update(shopsTable)
    .set({ views: shopDailyViewsSql() })
    .where(
      and(
        activeShopSqlCondition(),
        lt(shopsTable.views, VIEWS_DAILY_INCREMENT_CAP),
        staggerCondition(shopsTable.id, bucket),
      ),
    )
    .returning({ id: shopsTable.id });

  const result = {
    listings: listingRows.length,
    shops: shopRows.length,
    bucket,
    stagger_buckets: VIEWS_DAILY_STAGGER_BUCKETS,
  };
  logger.info({ ...result, cap: VIEWS_DAILY_INCREMENT_CAP }, "views daily increment finished");
  return result;
}
