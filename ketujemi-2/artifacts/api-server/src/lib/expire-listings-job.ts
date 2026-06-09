import { db, listingsTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";
import { logger } from "./logger";
import { deleteListingCascade } from "./delete-listing-cascade";

/** Delete listings past expires_at (90-day max lifetime) and their listing storage assets. */
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

/** Delete one listing immediately when past expires_at (e.g. guest opens expired URL). */
export async function purgeExpiredListingById(listingId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: listingsTable.id, expires_at: listingsTable.expires_at })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row?.expires_at || new Date(row.expires_at) >= new Date()) {
    return false;
  }

  return deleteListingCascade(listingId, "expiry");
}

function expireListingsIntervalMs(): number {
  const raw = Number(process.env.EXPIRE_LISTINGS_INTERVAL_MS);
  if (Number.isFinite(raw) && raw >= 60_000) return Math.floor(raw);
  return process.env.NODE_ENV === "production" ? 15 * 60 * 1000 : 60 * 1000;
}

/** Throttle on-demand purge when users browse listings (max once per 15s). */
const ON_DEMAND_MIN_GAP_MS = 15 * 1000;
let lastOnDemandPurgeAt = 0;
let onDemandPurgeInFlight = false;

export function requestPurgeExpiredListings(): void {
  const now = Date.now();
  if (onDemandPurgeInFlight || now - lastOnDemandPurgeAt < ON_DEMAND_MIN_GAP_MS) {
    return;
  }

  lastOnDemandPurgeAt = now;
  onDemandPurgeInFlight = true;
  void purgeExpiredListings()
    .catch((err) => {
      logger.error({ err }, "purgeExpiredListings failed (on-demand)");
    })
    .finally(() => {
      onDemandPurgeInFlight = false;
    });
}

export function startExpiredListingsScheduler(): void {
  const intervalMs = expireListingsIntervalMs();
  logger.info({ intervalMs }, "Expired listings scheduler started");
  void purgeExpiredListings();
  setInterval(() => {
    void purgeExpiredListings().catch((err) => {
      logger.error({ err }, "purgeExpiredListings failed");
    });
  }, intervalMs);
}
