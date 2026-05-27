import { db } from "@workspace/db";
import { listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";
import {
  listingImageUrlNeedsPurge,
  sanitizeListingImageUrlField,
} from "./listing-images.js";

export type PurgeInvalidListingImagesResult = {
  scanned: number;
  cleared: number;
  sampleIds: number[];
};

/** Remove stock/external URLs from `listings.image_url` (active listings by default). */
export async function purgeInvalidListingImages(opts?: {
  activeOnly?: boolean;
}): Promise<PurgeInvalidListingImagesResult> {
  const activeOnly = opts?.activeOnly !== false;

  const rows = activeOnly
    ? await db
        .select({
          id: listingsTable.id,
          image_url: listingsTable.image_url,
        })
        .from(listingsTable)
        .where(eq(listingsTable.status, "active"))
    : await db
        .select({
          id: listingsTable.id,
          image_url: listingsTable.image_url,
        })
        .from(listingsTable);
  let cleared = 0;
  const sampleIds: number[] = [];

  for (const row of rows) {
    if (!listingImageUrlNeedsPurge(row.image_url)) continue;
    const cleaned = sanitizeListingImageUrlField(row.image_url);
    await db
      .update(listingsTable)
      .set({ image_url: cleaned })
      .where(eq(listingsTable.id, row.id));
    cleared += 1;
    if (sampleIds.length < 25) sampleIds.push(row.id);
  }

  return { scanned: rows.length, cleared, sampleIds };
}

function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Hourly watchdog + daily full DB sweep (all statuses). */
const PURGE_ACTIVE_INTERVAL_MS = envInt("LISTING_IMAGE_GUARD_INTERVAL_MS", 60 * 60 * 1000);
const PURGE_FULL_EVERY_N_TICKS = envInt("LISTING_IMAGE_GUARD_FULL_EVERY_HOURS", 24);

let purgeInFlight = false;
let purgeTick = 0;

async function runListingImageGuardPass(fullDbSweep: boolean): Promise<void> {
  const result = await purgeInvalidListingImages({ activeOnly: !fullDbSweep });
  if (result.cleared > 0) {
    logger.warn(
      {
        cleared: result.cleared,
        scanned: result.scanned,
        sampleIds: result.sampleIds,
        full_db_sweep: fullDbSweep,
      },
      "Listing image guard removed invalid/stock image_url values",
    );
  }
}

export async function purgeInvalidListingImagesOnStartup(): Promise<void> {
  try {
    await runListingImageGuardPass(false);
  } catch (err) {
    logger.error({ err }, "Listing image_url purge failed on startup");
  }
}

/** Runs continuously while API is up — blocks stock/external listing photos from persisting. */
export function startListingImageGuardScheduler(): void {
  const run = () => {
    if (purgeInFlight) return;
    purgeInFlight = true;
    purgeTick += 1;
    const fullDbSweep = purgeTick % PURGE_FULL_EVERY_N_TICKS === 0;
    void runListingImageGuardPass(fullDbSweep)
      .catch((err) => {
        logger.error({ err, fullDbSweep }, "Listing image guard scheduled pass failed");
      })
      .finally(() => {
        purgeInFlight = false;
      });
  };

  run();
  setInterval(run, PURGE_ACTIVE_INTERVAL_MS);
  logger.info(
    {
      activeIntervalMs: PURGE_ACTIVE_INTERVAL_MS,
      fullSweepEveryHours: PURGE_FULL_EVERY_N_TICKS,
    },
    "Listing image guard scheduler started (24/7)",
  );
}
