import { categoriesTable, db, listingsTable, pool } from "@workspace/db";
import { and, desc, eq, gt, isNull, notInArray, or, sql } from "drizzle-orm";
import { buildCategorySocialCaption } from "./listing-category-social-caption";
import { createListingReelVideo, type ReelSlideInput } from "./cloudinary-slideshow";
import { loadAllCategories, resolveRootCategoryId } from "./category-quota";
import { isCloudinaryAdminConfigured } from "./cloudinary-config";
import { logger } from "./logger";
import { parseListingImageUrls } from "./listing-images";
import { postReelToInstagram, isInstagramAutoPostConfigured } from "../services/socialMedia.js";
import { postVideoToTikTok, isTikTokContentPostConfigured } from "./tiktok-content-post";

const REEL_LISTING_COUNT = 5;
const REEL_COOLDOWN_DAYS = 1;

function formatReelPriceLabel(price: string | number): string {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return "Me marrëveshje";
  const formatted = n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
  return `${formatted}€`;
}

async function recentlyUsedListingIds(): Promise<number[]> {
  const cutoff = new Date(Date.now() - REEL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  const { rows } = await pool.query<{ listing_id: number }>(
    `SELECT DISTINCT unnest(listing_ids) AS listing_id
     FROM social_reel_posts
     WHERE created_at >= $1`,
    [cutoff],
  );
  return rows.map((r) => Number(r.listing_id)).filter((id) => Number.isFinite(id));
}

export async function selectListingsForReel(count = REEL_LISTING_COUNT): Promise<
  Array<{
    id: number;
    title: string;
    price: string;
    imageUrl: string;
    category_id: number | null;
    category_name: string | null;
    category_slug: string | null;
    root_category_slug: string | null;
  }>
> {
  const excludeIds = await recentlyUsedListingIds();
  const now = new Date();
  const { byId: categoriesById } = await loadAllCategories();

  const baseWhere = and(
    eq(listingsTable.status, "active"),
    eq(listingsTable.moderation_status, "approved"),
    or(isNull(listingsTable.expires_at), gt(listingsTable.expires_at, now)),
    sql`${listingsTable.image_url} IS NOT NULL AND trim(${listingsTable.image_url}) <> ''`,
  );

  // Automated reel posts run on behalf of the platform — skip per-listing contact/owner checks.
  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      price: listingsTable.price,
      image_url: listingsTable.image_url,
      category_id: listingsTable.category_id,
      category_name: categoriesTable.name,
      category_slug: categoriesTable.slug,
    })
    .from(listingsTable)
    .leftJoin(categoriesTable, eq(listingsTable.category_id, categoriesTable.id))
    .where(
      excludeIds.length > 0
        ? and(baseWhere, notInArray(listingsTable.id, excludeIds))
        : baseWhere,
    )
    .orderBy(desc(listingsTable.listed_at))
    .limit(count);

  const picked: Array<{
    id: number;
    title: string;
    price: string;
    imageUrl: string;
    category_id: number | null;
    category_name: string | null;
    category_slug: string | null;
    root_category_slug: string | null;
  }> = [];

  for (const row of rows) {
    const urls = parseListingImageUrls(row.image_url);
    const imageUrl = urls[0];
    if (!imageUrl) continue;
    const rootId =
      row.category_id != null ? resolveRootCategoryId(row.category_id, categoriesById) : null;
    const rootSlug =
      rootId != null ? (categoriesById.get(rootId)?.slug?.trim() ?? null) : null;
    picked.push({
      id: row.id,
      title: row.title,
      price: String(row.price),
      imageUrl,
      category_id: row.category_id ?? null,
      category_name: row.category_name ?? null,
      category_slug: row.category_slug ?? null,
      root_category_slug: rootSlug,
    });
    if (picked.length >= count) break;
  }

  return picked;
}

export function isListingReelConfigured(): boolean {
  return (
    isCloudinaryAdminConfigured() &&
    (isInstagramAutoPostConfigured() || isTikTokContentPostConfigured())
  );
}

export async function runListingReelPost(): Promise<{
  posted: boolean;
  reelId?: number;
  listingIds?: number[];
  reason?: string;
  igMediaId?: string | null;
  tiktokPublishId?: string | null;
  videoUrl?: string;
  error?: string;
}> {
  if (!isCloudinaryAdminConfigured()) {
    return { posted: false, reason: "cloudinary_not_configured" };
  }
  if (!isInstagramAutoPostConfigured() && !isTikTokContentPostConfigured()) {
    return { posted: false, reason: "social_not_configured" };
  }

  const listings = await selectListingsForReel();
  if (listings.length < 4) {
    logger.info("listing reel: not enough listings with photos");
    return { posted: false, reason: "not_enough_listings" };
  }

  const slides: ReelSlideInput[] = listings.map((l) => ({
    imageUrl: l.imageUrl,
    title: l.title,
    priceLabel: formatReelPriceLabel(l.price),
  }));

  const batchKey = `${Date.now()}`;
  const videoResult = await createListingReelVideo(slides, batchKey);
  if ("error" in videoResult) {
    return { posted: false, reason: "video_generation_failed", error: videoResult.error };
  }

  const listingIds = listings.map((l) => l.id);
  const primaryListing = listings[0];
  const caption = buildCategorySocialCaption({
    category_id: primaryListing?.category_id ?? null,
    category_name: primaryListing?.category_name ?? null,
    category_slug: primaryListing?.category_slug ?? null,
    root_category_slug: primaryListing?.root_category_slug ?? null,
  });

  const insertRows = await pool.query<{ id: number }>(
    `INSERT INTO social_reel_posts (listing_ids, video_url, video_public_id, caption, status)
     VALUES ($1::int[], $2, $3, $4, 'processing')
     RETURNING id`,
    [listingIds, videoResult.videoUrl, videoResult.publicId, caption],
  );
  const reelId = Number(insertRows.rows[0]?.id);
  if (!Number.isFinite(reelId)) {
    return { posted: false, reason: "db_insert_failed" };
  }

  let igMediaId: string | null = null;
  let tiktokPublishId: string | null = null;
  let igPosted = false;
  let tiktokPosted = false;
  const errors: string[] = [];

  if (isInstagramAutoPostConfigured()) {
    igMediaId = await postReelToInstagram({
      videoUrl: videoResult.videoUrl,
      caption,
      reelId,
    });
    igPosted = !!igMediaId;
    if (!igPosted) errors.push("instagram_failed");
  }

  if (isTikTokContentPostConfigured()) {
    const tiktok = await postVideoToTikTok(videoResult.videoUrl, caption);
    tiktokPublishId = tiktok.publishId;
    tiktokPosted = !!tiktok.publishId && !tiktok.error;
    if (!tiktokPosted) errors.push(tiktok.error ?? "tiktok_failed");
  }
  const anyPosted = igPosted || tiktokPosted;
  const status = anyPosted ? "posted" : "failed";
  const errorMessage = errors.length > 0 ? errors.join("; ") : null;

  await pool.query(
    `UPDATE social_reel_posts
     SET ig_media_id = $1,
         tiktok_publish_id = $2,
         ig_posted = $3,
         tiktok_posted = $4,
         status = $5,
         error_message = $6
     WHERE id = $7`,
    [igMediaId, tiktokPublishId, igPosted, tiktokPosted, status, errorMessage, reelId],
  );

  if (!anyPosted) {
    logger.warn({ reelId, errors }, "listing reel: no platform published");
    return {
      posted: false,
      reelId,
      listingIds,
      reason: "publish_failed",
      videoUrl: videoResult.videoUrl,
      error: errorMessage ?? undefined,
    };
  }

  logger.info({ reelId, listingIds, igMediaId, tiktokPublishId }, "listing reel posted");
  return {
    posted: true,
    reelId,
    listingIds,
    igMediaId,
    tiktokPublishId,
    videoUrl: videoResult.videoUrl,
  };
}
