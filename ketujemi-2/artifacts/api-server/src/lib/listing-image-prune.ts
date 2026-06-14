import { LISTING_MAX_PHOTOS } from "../../../../lib/special-listing-categories.js";
import {
  droppedListingImageUrls,
  listingImageUrlExceedsMax,
  sanitizeListingImageUrlField,
} from "./listing-images.js";
import { deleteListingStorageUrls } from "./delete-listing-storage.js";
import { notifyListingExcessPhotosRemoved } from "./engagement-notifications.js";

export type PruneListingImagesResult = {
  removedCount: number;
  notified: boolean;
};

/** Delete Cloudinary/B2 objects dropped when image_url is capped or sanitized. */
export async function pruneDroppedListingImagesFromStorage(
  raw: string | null | undefined,
  cleaned: string | null | undefined,
  listingId: number,
): Promise<number> {
  const dropped = droppedListingImageUrls(raw, cleaned ?? null);
  if (dropped.length === 0) return 0;
  await deleteListingStorageUrls(dropped, listingId);
  return dropped.length;
}

/** Prune storage and notify owner when photos exceeded the per-listing max. */
export async function pruneListingImagesAndNotifyOwner(opts: {
  raw: string | null | undefined;
  cleaned: string | null | undefined;
  listingId: number;
  userId: number | null | undefined;
  listingTitle: string;
  notifySource?: ListingOwnerNotifySource;
}): Promise<PruneListingImagesResult> {
  const hadExcess = listingImageUrlExceedsMax(opts.raw);
  const removedCount = await pruneDroppedListingImagesFromStorage(
    opts.raw,
    opts.cleaned,
    opts.listingId,
  );

  let notified = false;
  if (hadExcess && removedCount > 0 && opts.userId != null && opts.userId > 0) {
    await notifyListingExcessPhotosRemoved({
      userId: opts.userId,
      listingId: opts.listingId,
      listingTitle: opts.listingTitle,
      removedCount,
      maxPhotos: LISTING_MAX_PHOTOS,
      notifySource: opts.notifySource ?? "owner_self_service",
    });
    notified = true;
  }

  return { removedCount, notified };
}

/** Sanitize image_url and delete any valid uploads that no longer belong on the listing. */
export async function sanitizeListingImageUrlFieldAndPruneStorage(
  raw: string | null | undefined,
  listingId: number,
): Promise<string | null> {
  const cleaned = sanitizeListingImageUrlField(raw);
  await pruneDroppedListingImagesFromStorage(raw, cleaned, listingId);
  return cleaned;
}
