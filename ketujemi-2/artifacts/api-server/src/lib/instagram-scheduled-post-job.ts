import { db, listingsTable, categoriesTable } from "@workspace/db";
import { and, asc, eq, gt, isNull, or } from "drizzle-orm";
import {
  facebookPostSkipReason,
  isInstagramAutoPostConfigured,
  postNewListingToInstagram,
} from "../services/socialMedia.js";
import { loadAllCategories, resolveRootCategoryId } from "./category-quota";
import { logger } from "./logger";

const CANDIDATE_BATCH = 20;

export async function markListingIgPosted(listingId: number): Promise<void> {
  await db
    .update(listingsTable)
    .set({ ig_posted: true })
    .where(eq(listingsTable.id, listingId));
}

/** Post one listing that already went to Facebook but not yet to Instagram. */
export async function runInstagramScheduledPost(): Promise<{
  posted: boolean;
  listingId?: number;
  reason?: string;
}> {
  if (!isInstagramAutoPostConfigured()) {
    return { posted: false, reason: "not_configured" };
  }

  const now = new Date();
  const { byId: categoriesById } = await loadAllCategories();
  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      location: listingsTable.location,
      image_url: listingsTable.image_url,
      category_id: listingsTable.category_id,
      category_name: categoriesTable.name,
      category_slug: categoriesTable.slug,
    })
    .from(listingsTable)
    .leftJoin(categoriesTable, eq(listingsTable.category_id, categoriesTable.id))
    .where(
      and(
        eq(listingsTable.status, "active"),
        eq(listingsTable.moderation_status, "approved"),
        eq(listingsTable.fb_posted, true),
        eq(listingsTable.ig_posted, false),
        or(isNull(listingsTable.expires_at), gt(listingsTable.expires_at, now)),
      ),
    )
    .orderBy(asc(listingsTable.created_at))
    .limit(CANDIDATE_BATCH);

  if (rows.length === 0) {
    logger.info("instagram scheduled post: no pending listings");
    return { posted: false, reason: "no_pending" };
  }

  for (const row of rows) {
    const rootId =
      row.category_id != null ? resolveRootCategoryId(row.category_id, categoriesById) : null;
    const rootSlug =
      rootId != null ? (categoriesById.get(rootId)?.slug?.trim() ?? null) : null;

    const listing = {
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      location: row.location,
      image_url: row.image_url,
      category_name: row.category_name,
      category_slug: row.category_slug,
      root_category_slug: rootSlug,
      listing_country: null as string | null,
    };

    const skip = facebookPostSkipReason(listing);
    if (skip) {
      logger.info({ listingId: row.id, skip }, "instagram scheduled post: skip candidate");
      continue;
    }

    const mediaId = await postNewListingToInstagram(listing);
    if (!mediaId) {
      logger.warn({ listingId: row.id }, "instagram scheduled post: Graph API failed");
      return { posted: false, listingId: row.id, reason: "graph_api_failed" };
    }

    await markListingIgPosted(row.id);
    logger.info({ listingId: row.id, instagramMediaId: mediaId }, "instagram scheduled post ok");
    return { posted: true, listingId: row.id };
  }

  logger.info("instagram scheduled post: no eligible listings in batch");
  return { posted: false, reason: "no_eligible" };
}
