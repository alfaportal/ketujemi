import { db, listingsTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";
import { logger } from "./logger";
import { deleteListingCascade } from "./delete-listing-cascade";

/** Neon quota errors may appear on message, cause chain, or pg error fields. */
function isNeonComputeQuotaError(err: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = err;

  while (current != null && !seen.has(current)) {
    seen.add(current);

    const parts: string[] = [];
    if (typeof current === "string") {
      parts.push(current);
    } else if (current instanceof Error) {
      parts.push(current.message);
      if (current.name) parts.push(current.name);
    } else if (typeof current === "object") {
      const record = current as Record<string, unknown>;
      for (const key of ["message", "detail", "code", "severity", "routine"]) {
        const value = record[key];
        if (typeof value === "string") parts.push(value);
      }
    }

    const haystack = parts.join(" ").toLowerCase();
    if (
      haystack.includes("exceeded compute time quota") ||
      haystack.includes("compute time quota") ||
      (haystack.includes("neon") && haystack.includes("quota"))
    ) {
      return true;
    }

    current = current instanceof Error ? current.cause : undefined;
  }

  return false;
}

function warnNeonQuotaSkipped(context: string, err: unknown): void {
  logger.warn(
    { err, context },
    "Neon compute quota exceeded — skipping expired listings job",
  );
}

function logPurgeFailure(context: string, err: unknown): void {
  if (isNeonComputeQuotaError(err)) {
    warnNeonQuotaSkipped(context, err);
    return;
  }
  logger.error({ err, context }, "purgeExpiredListings failed");
}

/** Delete listings past expires_at (90-day max lifetime) and their listing storage assets. */
export async function purgeExpiredListings(): Promise<number> {
  try {
    let expiring: { id: number }[];
    try {
      expiring = await db
        .select({ id: listingsTable.id })
        .from(listingsTable)
        .where(lt(listingsTable.expires_at, new Date()));
    } catch (err) {
      if (isNeonComputeQuotaError(err)) {
        warnNeonQuotaSkipped("purgeExpiredListings.select", err);
        return 0;
      }
      throw err;
    }

    let removed = 0;
    for (const row of expiring) {
      try {
        if (await deleteListingCascade(row.id, "expiry")) removed++;
      } catch (err) {
        if (isNeonComputeQuotaError(err)) {
          warnNeonQuotaSkipped("purgeExpiredListings.delete", err);
          continue;
        }
        throw err;
      }
    }

    if (removed > 0) {
      logger.info({ count: removed }, "Purged expired listings");
    }
    return removed;
  } catch (err) {
    if (isNeonComputeQuotaError(err)) {
      warnNeonQuotaSkipped("purgeExpiredListings", err);
      return 0;
    }
    throw err;
  }
}

/** Delete one listing immediately when past expires_at (e.g. guest opens expired URL). */
export async function purgeExpiredListingById(listingId: number): Promise<boolean> {
  try {
    let row: { id: number; expires_at: Date | null } | undefined;
    try {
      [row] = await db
        .select({ id: listingsTable.id, expires_at: listingsTable.expires_at })
        .from(listingsTable)
        .where(eq(listingsTable.id, listingId))
        .limit(1);
    } catch (err) {
      if (isNeonComputeQuotaError(err)) {
        warnNeonQuotaSkipped("purgeExpiredListingById.select", err);
        return false;
      }
      throw err;
    }

    if (!row?.expires_at || new Date(row.expires_at) >= new Date()) {
      return false;
    }

    try {
      return await deleteListingCascade(listingId, "expiry");
    } catch (err) {
      if (isNeonComputeQuotaError(err)) {
        warnNeonQuotaSkipped("purgeExpiredListingById.delete", err);
        return false;
      }
      throw err;
    }
  } catch (err) {
    if (isNeonComputeQuotaError(err)) {
      warnNeonQuotaSkipped("purgeExpiredListingById", err);
      return false;
    }
    throw err;
  }
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
      logPurgeFailure("purgeExpiredListings.on-demand", err);
    })
    .finally(() => {
      onDemandPurgeInFlight = false;
    });
}

export function startExpiredListingsScheduler(): void {
  const intervalMs = expireListingsIntervalMs();
  logger.info({ intervalMs }, "Expired listings scheduler started");
  void purgeExpiredListings().catch((err) => {
    logPurgeFailure("purgeExpiredListings.scheduler.initial", err);
  });
  setInterval(() => {
    void purgeExpiredListings().catch((err) => {
      logPurgeFailure("purgeExpiredListings.scheduler", err);
    });
  }, intervalMs);
}
