import { db } from "@workspace/db";
import {
  homepagePartnersTable,
  listingsTable,
  usersTable,
} from "@workspace/db";
import { and, eq, ne, sql } from "drizzle-orm";
import { isPermanentCloudinaryUrl } from "../../../../lib/cloudinary-asset.js";
import { parseB2ObjectKeyFromPublicUrl, isPermanentB2ObjectKey } from "../../../../lib/b2-asset.js";
import { parseListingImageUrls } from "./listing-images";

/** True when URL is used by homepage partners or business partner profiles (never delete). */
export async function isPartnerProtectedStorageUrl(url: string): Promise<boolean> {
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (isPermanentCloudinaryUrl(trimmed)) return true;

  const b2Key = parseB2ObjectKeyFromPublicUrl(trimmed);
  if (b2Key && isPermanentB2ObjectKey(b2Key)) return true;

  const [hp] = await db
    .select({ id: homepagePartnersTable.id })
    .from(homepagePartnersTable)
    .where(eq(homepagePartnersTable.logo_url, trimmed))
    .limit(1);
  if (hp) return true;

  const [userLogo] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.partner_logo_url, trimmed))
    .limit(1);
  if (userLogo) return true;

  const bannerPattern = `%${trimmed.replace(/[%_\\]/g, "\\$&")}%`;
  const bannerRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      and(
        sql`${usersTable.partner_banner_urls} IS NOT NULL`,
        sql`${usersTable.partner_banner_urls} LIKE ${bannerPattern}`,
      ),
    )
    .limit(1);
  if (bannerRows.length > 0) return true;

  return false;
}

/** True when the same URL is still used on another listing. */
export async function isListingImageUrlUsedElsewhere(
  url: string,
  excludeListingId: number,
): Promise<boolean> {
  const trimmed = url.trim();
  if (!trimmed) return false;

  const pattern = `%${trimmed}%`;
  const rows = await db
    .select({ id: listingsTable.id, image_url: listingsTable.image_url })
    .from(listingsTable)
    .where(and(ne(listingsTable.id, excludeListingId), sql`${listingsTable.image_url} LIKE ${pattern}`))
    .limit(20);

  for (const row of rows) {
    if (parseListingImageUrls(row.image_url).includes(trimmed)) return true;
  }
  return false;
}

export async function shouldDeleteListingStorageUrl(
  url: string,
  listingId: number,
): Promise<boolean> {
  if (await isPartnerProtectedStorageUrl(url)) return false;
  if (await isListingImageUrlUsedElsewhere(url, listingId)) return false;
  return true;
}
