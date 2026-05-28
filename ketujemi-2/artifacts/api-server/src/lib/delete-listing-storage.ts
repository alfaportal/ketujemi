import { parseListingImageUrls } from "./listing-images";
import { destroyCloudinaryUrl } from "./cloudinary-destroy";
import { deleteB2ObjectByPublicUrl } from "./b2-delete-object";
import { shouldDeleteListingStorageUrl } from "./storage-url-protection";
import { logger } from "./logger";

/**
 * Remove listing photos from Cloudinary / B2 when a listing is deleted or expires (90d).
 * Never touches `partners/` or `site-assets/` (protected folders).
 */
export async function deleteListingStorageAssets(
  imageUrlField: string | null | undefined,
  listingId: number,
): Promise<void> {
  const urls = parseListingImageUrls(imageUrlField);
  if (urls.length === 0) return;

  for (const url of urls) {
    try {
      if (!(await shouldDeleteListingStorageUrl(url, listingId))) {
        logger.debug({ listingId, url }, "skip storage delete (protected or shared)");
        continue;
      }

      const cloud = await destroyCloudinaryUrl(url);
      const b2 = await deleteB2ObjectByPublicUrl(url);

      if (cloud || b2) {
        logger.info({ listingId, url, cloud, b2 }, "Deleted listing storage asset");
      }
    } catch (err) {
      logger.warn({ err, listingId, url }, "deleteListingStorageAssets failed for URL");
    }
  }
}
