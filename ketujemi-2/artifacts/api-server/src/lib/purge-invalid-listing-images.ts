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

export async function purgeInvalidListingImagesOnStartup(): Promise<void> {
  try {
    const result = await purgeInvalidListingImages({ activeOnly: false });
    if (result.cleared > 0) {
      logger.warn(
        { cleared: result.cleared, scanned: result.scanned, sampleIds: result.sampleIds },
        "Startup purge removed invalid/stock listing image_url values",
      );
    }
  } catch (err) {
    logger.error({ err }, "Listing image_url purge failed on startup");
  }
}
