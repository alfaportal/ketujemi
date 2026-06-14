import { db } from "@workspace/db";
import { listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";
import {
  droppedListingImageUrls,
  listingImageUrlExceedsMax,
  listingImageUrlNeedsPurge,
  sanitizeListingImageUrlField,
} from "./listing-images.js";
import { deleteListingStorageUrls } from "./delete-listing-storage.js";
import { notifyListingExcessPhotosRemoved } from "./engagement-notifications.js";
import { LISTING_MAX_PHOTOS } from "../../../../lib/special-listing-categories.js";

export type PurgeInvalidListingImagesResult = {
  scanned: number;
  cleared: number;
  storageUrlsDeleted: number;
  ownersNotified: number;
  sampleIds: number[];
};

/** Remove stock/external URLs from `listings.image_url` (active listings by default). */
export async function purgeInvalidListingImages(opts?: {
  activeOnly?: boolean;
  /** False when run from admin panel — do not alert listing owners. */
  notifyOwners?: boolean;
}): Promise<PurgeInvalidListingImagesResult> {
  const activeOnly = opts?.activeOnly !== false;
  const notifyOwners = opts?.notifyOwners !== false;

  const rows = activeOnly
    ? await db
        .select({
          id: listingsTable.id,
          user_id: listingsTable.user_id,
          title: listingsTable.title,
          image_url: listingsTable.image_url,
        })
        .from(listingsTable)
        .where(eq(listingsTable.status, "active"))
    : await db
        .select({
          id: listingsTable.id,
          user_id: listingsTable.user_id,
          title: listingsTable.title,
          image_url: listingsTable.image_url,
        })
        .from(listingsTable);
  let cleared = 0;
  let storageUrlsDeleted = 0;
  let ownersNotified = 0;
  const sampleIds: number[] = [];

  for (const row of rows) {
    if (!listingImageUrlNeedsPurge(row.image_url)) continue;
    const hadExcess = listingImageUrlExceedsMax(row.image_url);
    const cleaned = sanitizeListingImageUrlField(row.image_url);
    const dropped = droppedListingImageUrls(row.image_url, cleaned);
    await db
      .update(listingsTable)
      .set({ image_url: cleaned })
      .where(eq(listingsTable.id, row.id));
    if (dropped.length > 0) {
      await deleteListingStorageUrls(dropped, row.id);
      storageUrlsDeleted += dropped.length;
    }
    if (
      notifyOwners &&
      hadExcess &&
      dropped.length > 0 &&
      row.user_id != null &&
      row.user_id > 0
    ) {
      await notifyListingExcessPhotosRemoved({
        userId: row.user_id,
        listingId: row.id,
        listingTitle: row.title,
        removedCount: dropped.length,
        maxPhotos: LISTING_MAX_PHOTOS,
        notifySource: "system_cron",
      });
      ownersNotified += 1;
    }
    cleared += 1;
    if (sampleIds.length < 25) sampleIds.push(row.id);
  }

  return { scanned: rows.length, cleared, storageUrlsDeleted, ownersNotified, sampleIds };
}

export async function purgeInvalidListingImagesOnStartup(): Promise<void> {
  try {
    const result = await purgeInvalidListingImages({ activeOnly: false });
    if (result.cleared > 0) {
      logger.warn(
        {
          cleared: result.cleared,
          scanned: result.scanned,
          storageUrlsDeleted: result.storageUrlsDeleted,
          ownersNotified: result.ownersNotified,
          sampleIds: result.sampleIds,
        },
        "Startup purge trimmed invalid/excess listing image_url values",
      );
    }
  } catch (err) {
    logger.error({ err }, "Listing image_url purge failed on startup");
  }
}
