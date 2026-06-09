import { db, listingsTable, categoriesTable, shopsTable } from "@workspace/db";
import { and, asc, eq, gt, isNull, or } from "drizzle-orm";
import { loadAllCategories, resolveRootCategoryId } from "./category-quota.js";
import { parseListingImageUrls } from "./listing-images.js";
import { markListingFbPosted } from "./facebook-scheduled-post-job.js";
import { markListingIgPosted } from "./instagram-scheduled-post-job.js";
import { resolveSocialFlairLines } from "./social-listing-caption.js";
import {
  buildFacebookCaption,
  buildInstagramCaption,
  facebookPostSkipReason,
  isFacebookManualPostConfigured,
  isInstagramManualPostConfigured,
  listingSlug,
  postNewListingToFacebook,
  postNewListingToInstagram,
  resolveListingMarketForSocial,
} from "../services/socialMedia.js";
import { getCanonicalOrigin } from "./canonical-host.js";
import { verifyListingOwnerIntegrity } from "./listing-ownership-guard.js";

export type AdminSocialListingRow = {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  seller_name: string;
  shop_name: string | null;
  category_name: string | null;
  category_slug: string | null;
  root_category_slug: string | null;
  image_urls: string[];
  fb_posted: boolean;
  ig_posted: boolean;
  status: string;
  moderation_status: string;
  skip_reason: string | null;
  queue: "pending_fb" | "pending_ig" | "done" | "ineligible";
  created_at: string;
};

function queueStatus(
  row: { fb_posted: boolean; ig_posted: boolean },
  skip: string | null,
): AdminSocialListingRow["queue"] {
  if (skip) return "ineligible";
  if (!row.fb_posted) return "pending_fb";
  if (!row.ig_posted) return "pending_ig";
  return "done";
}

async function enrichListingRow(
  row: {
    id: number;
    title: string;
    description: string;
    price: string | number;
    location: string;
    seller_name: string;
    image_url: string | null;
    fb_posted: boolean;
    ig_posted: boolean;
    status: string;
    moderation_status: string;
    category_id: number;
    created_at: Date;
    category_name: string | null;
    category_slug: string | null;
    shop_name: string | null;
    property_subtype: string | null;
    property_txn: string | null;
  },
  rootSlug: string | null,
): Promise<AdminSocialListingRow> {
  const socialPayload = {
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
  const skip = facebookPostSkipReason(socialPayload);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    location: row.location,
    seller_name: row.seller_name,
    shop_name: row.shop_name,
    category_name: row.category_name,
    category_slug: row.category_slug,
    root_category_slug: rootSlug,
    image_urls: parseListingImageUrls(row.image_url),
    fb_posted: row.fb_posted,
    ig_posted: row.ig_posted,
    status: row.status,
    moderation_status: row.moderation_status,
    skip_reason: skip,
    queue: queueStatus(row, skip),
    created_at: row.created_at.toISOString(),
  };
}

export async function listAdminSocialPostListings(opts?: {
  search?: string;
  filter?: "all" | "pending_fb" | "pending_ig" | "posted";
  page?: number;
  limit?: number;
}): Promise<{ total: number; page: number; listings: AdminSocialListingRow[]; configured: { facebook: boolean; instagram: boolean } }> {
  const page = Math.max(1, opts?.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts?.limit ?? 50));
  const now = new Date();
  const { byId: categoriesById } = await loadAllCategories();

  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      location: listingsTable.location,
      seller_name: listingsTable.seller_name,
      image_url: listingsTable.image_url,
      fb_posted: listingsTable.fb_posted,
      ig_posted: listingsTable.ig_posted,
      status: listingsTable.status,
      moderation_status: listingsTable.moderation_status,
      category_id: listingsTable.category_id,
      created_at: listingsTable.created_at,
      category_name: categoriesTable.name,
      category_slug: categoriesTable.slug,
      shop_name: shopsTable.shop_name,
      property_subtype: listingsTable.property_subtype,
      property_txn: listingsTable.property_txn,
    })
    .from(listingsTable)
    .leftJoin(categoriesTable, eq(listingsTable.category_id, categoriesTable.id))
    .leftJoin(shopsTable, eq(listingsTable.shop_id, shopsTable.id))
    .where(
      and(
        eq(listingsTable.status, "active"),
        eq(listingsTable.moderation_status, "approved"),
        or(isNull(listingsTable.expires_at), gt(listingsTable.expires_at, now)),
      ),
    )
    .orderBy(asc(listingsTable.created_at));

  let enriched: AdminSocialListingRow[] = [];
  for (const row of rows) {
    const rootId = resolveRootCategoryId(row.category_id, categoriesById);
    const rootSlug = categoriesById.get(rootId)?.slug?.trim() ?? null;
    enriched.push(await enrichListingRow(row, rootSlug));
  }

  if (opts?.search?.trim()) {
    const s = opts.search.trim().toLowerCase();
    enriched = enriched.filter(
      (l) =>
        l.title.toLowerCase().includes(s) ||
        l.seller_name.toLowerCase().includes(s) ||
        (l.shop_name?.toLowerCase().includes(s) ?? false),
    );
  }

  if (opts?.filter === "pending_fb") {
    enriched = enriched.filter((l) => l.queue === "pending_fb");
  } else if (opts?.filter === "pending_ig") {
    enriched = enriched.filter((l) => l.queue === "pending_ig");
  } else if (opts?.filter === "posted") {
    enriched = enriched.filter((l) => l.queue === "done");
  }

  const total = enriched.length;
  const offset = (page - 1) * limit;
  const listings = enriched.slice(offset, offset + limit);

  return {
    total,
    page,
    listings,
    configured: {
      facebook: isFacebookManualPostConfigured(),
      instagram: isInstagramManualPostConfigured(),
    },
  };
}

export async function loadListingForSocialPost(listingId: number) {
  const { byId: categoriesById } = await loadAllCategories();
  const [row] = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      location: listingsTable.location,
      seller_name: listingsTable.seller_name,
      seller_phone: listingsTable.seller_phone,
      user_id: listingsTable.user_id,
      image_url: listingsTable.image_url,
      fb_posted: listingsTable.fb_posted,
      ig_posted: listingsTable.ig_posted,
      status: listingsTable.status,
      moderation_status: listingsTable.moderation_status,
      category_id: listingsTable.category_id,
      created_at: listingsTable.created_at,
      category_name: categoriesTable.name,
      category_slug: categoriesTable.slug,
      shop_name: shopsTable.shop_name,
      property_subtype: listingsTable.property_subtype,
      property_txn: listingsTable.property_txn,
    })
    .from(listingsTable)
    .leftJoin(categoriesTable, eq(listingsTable.category_id, categoriesTable.id))
    .leftJoin(shopsTable, eq(listingsTable.shop_id, shopsTable.id))
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) return null;

  const rootId = resolveRootCategoryId(row.category_id, categoriesById);
  const rootSlug = categoriesById.get(rootId)?.slug?.trim() ?? null;
  const enriched = await enrichListingRow(row, rootSlug);

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

  return {
    enriched,
    listing,
    integrity: {
      id: row.id,
      user_id: row.user_id,
      seller_name: row.seller_name,
      seller_phone: row.seller_phone,
      description: row.description,
    },
  };
}

export async function buildAdminSocialPostPreview(listingId: number) {
  const loaded = await loadListingForSocialPost(listingId);
  if (!loaded) return null;

  const { enriched, listing } = loaded;
  const photoUrl = parseListingImageUrls(listing.image_url)[0] ?? null;
  const market = resolveListingMarketForSocial(listing.location, listing.listing_country);
  const slug = listingSlug(listing.id, listing.title);
  const listingLink = `${getCanonicalOrigin()}/listings/${listing.id}`;

  const flairLines = await resolveSocialFlairLines({
    title: listing.title,
    description: listing.description ?? "",
    categoryName: listing.category_name ?? null,
    categorySlug: listing.category_slug ?? null,
    rootCategorySlug: listing.root_category_slug ?? null,
    propertySubtype: listing.property_subtype ?? null,
    propertyTxn: listing.property_txn ?? null,
    sellerName: listing.seller_name ?? null,
    shopName: listing.shop_name ?? null,
    imageUrl: photoUrl,
    market,
  });

  const facebookCaption = buildFacebookCaption(market, {
    title: listing.title,
    price: listing.price,
    location: listing.location,
    slug,
    categoryName: listing.category_name ?? null,
    flairLine: flairLines.fb,
  });

  const instagramCaption = buildInstagramCaption(market, {
    title: listing.title,
    price: listing.price,
    location: listing.location,
    slug,
    categoryName: listing.category_name ?? null,
    flairLine: flairLines.ig,
    listingLink,
  });

  return {
    listing: enriched,
    preview: {
      facebook: `${facebookCaption}\n\n${listingLink}`,
      instagram: instagramCaption,
      theme: flairLines.theme,
      caption_source: flairLines.source,
      market,
      primary_image: photoUrl,
    },
  };
}

export async function executeAdminSocialPost(
  listingId: number,
  platforms: { facebook?: boolean; instagram?: boolean },
): Promise<{
  listing_id: number;
  facebook?: { ok: boolean; post_id?: string | null; error?: string };
  instagram?: { ok: boolean; media_id?: string | null; error?: string };
}> {
  const loaded = await loadListingForSocialPost(listingId);
  if (!loaded) {
    throw new Error("LISTING_NOT_FOUND");
  }

  const { listing, integrity: integrityRow } = loaded;
  const skip = facebookPostSkipReason(listing, true);
  if (skip) {
    throw new Error(`INELIGIBLE:${skip}`);
  }

  const integrity = await verifyListingOwnerIntegrity(integrityRow, "admin_social_post");
  if (!integrity.ok) {
    throw new Error(`OWNERSHIP_VIOLATION:${integrity.reason}`);
  }

  const result: {
    listing_id: number;
    facebook?: { ok: boolean; post_id?: string | null; error?: string };
    instagram?: { ok: boolean; media_id?: string | null; error?: string };
  } = { listing_id: listingId };

  const postFb = platforms.facebook !== false;
  const postIg = platforms.instagram !== false;

  if (postFb) {
    const fbResult = await postNewListingToFacebook(listing, { manual: true });
    if (fbResult.postId) {
      await markListingFbPosted(listingId);
      result.facebook = { ok: true, post_id: fbResult.postId };
    } else {
      result.facebook = {
        ok: false,
        error: fbResult.graphError ?? "graph_api_failed",
      };
    }
  }

  if (postIg) {
    if (!isInstagramManualPostConfigured()) {
      result.instagram = { ok: false, error: "not_configured" };
    } else {
      const mediaId = await postNewListingToInstagram(listing, { manual: true });
      if (mediaId) {
        await markListingIgPosted(listingId);
        result.instagram = { ok: true, media_id: mediaId };
      } else {
        result.instagram = { ok: false, error: "graph_api_failed" };
      }
    }
  }

  return result;
}
