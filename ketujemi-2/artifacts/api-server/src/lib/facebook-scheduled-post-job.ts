import { db, listingsTable, categoriesTable, shopsTable } from "@workspace/db";
import { and, asc, eq, gt, isNull, or } from "drizzle-orm";
import {
  facebookPostSkipReason,
  isFacebookAutoPostConfigured,
  postNewListingToFacebook,
} from "../services/socialMedia.js";
import { loadAllCategories, resolveRootCategoryId } from "./category-quota";
import { logger } from "./logger";

const CANDIDATE_BATCH = 20;

export async function markListingFbPosted(listingId: number): Promise<void> {
  await db
    .update(listingsTable)
    .set({ fb_posted: true })
    .where(eq(listingsTable.id, listingId));
}

/** Pick one active, unposted listing and publish to the Facebook Page. */
export async function runFacebookScheduledPost(): Promise<{
  posted: boolean;
  listingId?: number;
  reason?: string;
}> {
  if (!isFacebookAutoPostConfigured()) {
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
      seller_name: listingsTable.seller_name,
      property_subtype: listingsTable.property_subtype,
      property_txn: listingsTable.property_txn,
      shop_name: shopsTable.shop_name,
    })
    .from(listingsTable)
    .leftJoin(categoriesTable, eq(listingsTable.category_id, categoriesTable.id))
    .leftJoin(shopsTable, eq(listingsTable.shop_id, shopsTable.id))
    .where(
      and(
        eq(listingsTable.status, "active"),
        eq(listingsTable.moderation_status, "approved"),
        eq(listingsTable.fb_posted, false),
        or(isNull(listingsTable.expires_at), gt(listingsTable.expires_at, now)),
      ),
    )
    .orderBy(asc(listingsTable.created_at))
    .limit(CANDIDATE_BATCH);

  if (rows.length === 0) {
    logger.info("facebook scheduled post: no pending listings");
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
      seller_name: row.seller_name,
      shop_name: row.shop_name,
      property_subtype: row.property_subtype,
      property_txn: row.property_txn,
      listing_country: null as string | null,
    };

    const skip = facebookPostSkipReason(listing);
    if (skip) {
      logger.info({ listingId: row.id, skip }, "facebook scheduled post: skip candidate");
      continue;
    }

    const postId = await postNewListingToFacebook(listing);
    if (!postId) {
      logger.warn({ listingId: row.id }, "facebook scheduled post: Graph API failed");
      return { posted: false, listingId: row.id, reason: "graph_api_failed" };
    }

    await markListingFbPosted(row.id);
    logger.info({ listingId: row.id, facebookPostId: postId }, "facebook scheduled post ok");
    return { posted: true, listingId: row.id };
  }

  logger.info("facebook scheduled post: no eligible listings in batch");
  return { posted: false, reason: "no_eligible" };
}
