import { db, listingsTable } from "@workspace/db";
import { lt } from "drizzle-orm";
import { logger } from "./logger";
import { deleteListingCascade } from "./delete-listing-cascade";

/** Delete listings past expires_at (1 month rule). */
export async function purgeExpiredListings(): Promise<number> {
  const expiring = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(lt(listingsTable.expires_at, new Date()));

  let removed = 0;
  for (const row of expiring) {
    if (await deleteListingCascade(row.id, "expiry")) removed++;
  }

  if (removed > 0) {
    logger.info({ count: removed }, "Purged expired listings");
  }
  return removed;
}

const INTERVAL_MS = 60 * 60 * 1000;

export function startExpiredListingsScheduler(): void {
  void purgeExpiredListings();
  setInterval(() => {
    void purgeExpiredListings().catch((err) => {
      logger.error({ err }, "purgeExpiredListings failed");
    });
  }, INTERVAL_MS);
}
