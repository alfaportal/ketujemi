import { db } from "@workspace/db";
import {
  categoriesTable,
  homepagePartnersTable,
  listingsTable,
  usersTable,
} from "@workspace/db";
import { and, eq, ne, sql } from "drizzle-orm";
import { isProtectedCloudinaryUrl } from "../../../../lib/cloudinary-asset.js";
import { isProtectedB2ObjectKey, parseB2ObjectKeyFromPublicUrl } from "../../../../lib/b2-asset.js";
import { parseListingImageUrls } from "./listing-images";

/**
 * True when URL must never be removed by listing cleanup:
 * protected Cloudinary/B2 folders, partner profiles, or category/site assets in DB.
 */
export async function isProtectedStorageUrl(url: string): Promise<boolean> {
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (isProtectedCloudinaryUrl(trimmed)) return true;

  const b2Key = parseB2ObjectKeyFromPublicUrl(trimmed);
  if (b2Key && isProtectedB2ObjectKey(b2Key)) return true;

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

  const [categoryRow] = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.image_url, trimmed))
    .limit(1);
  if (categoryRow) return true;

  return false;
}

/** @deprecated Use {@link isProtectedStorageUrl} */
export const isPartnerProtectedStorageUrl = isProtectedStorageUrl;

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
  if (await isProtectedStorageUrl(url)) return false;
  if (await isListingImageUrlUsedElsewhere(url, listingId)) return false;
  return true;
}
