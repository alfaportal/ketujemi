import { db, listingsTable } from "@workspace/db";
import { lt } from "drizzle-orm";
import { logger } from "./logger";

/** Delete listings past expires_at (1 month rule). */
export async function purgeExpiredListings(): Promise<number> {
  const deleted = await db
    .delete(listingsTable)
    .where(lt(listingsTable.expires_at, new Date()))
    .returning({ id: listingsTable.id });

  if (deleted.length > 0) {
    logger.info({ count: deleted.length }, "Purged expired listings");
  }
  return deleted.length;
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
