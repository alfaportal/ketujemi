import { Router } from "express";
import { db } from "@workspace/db";
import { listingsTable, categoriesTable, listingReportsTable, usersTable, shopsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, desc, sql, count, gt, or, isNull, inArray } from "drizzle-orm";
import {
  GetListingsQueryParams,
  CreateListingBody,
  GetListingParams,
  UpdateListingParams,
  UpdateListingBody,
  DeleteListingParams,
} from "@workspace/api-zod";
import { getSessionUser } from "../lib/session-user";
import { isSellerOnline, countUsersOnlineNow } from "../lib/user-last-active.js";
import { countSitePresenceNow } from "../lib/site-presence.js";
import { computeDisplayUsersOnlineNow } from "../../../../lib/platform-visitors-display.js";
import { resolveSellerProfileHref } from "../lib/seller-profile-href.js";
import { postListingLimiter, searchLimiter } from "../lib/express-rate-limiters";
import { canonicalSellerContactForUser, listingBelongsToUser } from "../lib/listing-ownership";
import {
  detectContactImpersonation,
  recordListingOwnershipViolation,
  sanitizeListingDescriptionEmail,
  syncSellerContactFromListingIfNeeded,
  syncSellerContactFromListingOnPost,
  userHasPostableContact,
  verifyListingOwnerIntegrity,
} from "../lib/listing-ownership-guard";
import {
  descriptionForAdminOnBehalf,
  isListingUserPlatformAdmin,
} from "../lib/admin-listing-on-behalf.js";
import {
  normalizeListingDescription,
  normalizeListingTitle,
} from "../lib/listing-text-normalize.js";
import { maskSellerPhone } from "../lib/contact-mask";
import { assertAccountActive } from "../lib/user-ban";
import { formatZodIssuesMessage } from "../lib/listing-api-errors";
import { getUserMonthlyPostingHistory } from "../lib/listing-monthly-history";
import { assertBusinessListingCreate } from "../lib/business-listing-guard";
import { removeUserDuplicateListingsForPost } from "../lib/listing-duplicate-guard";
import {
  assertListingPostUserCooldown,
  recordListingPostSuccessForUser,
} from "../lib/listing-post-user-cooldown";
import { repostListing } from "../lib/listing-repost";
import { incrementListingView } from "../lib/listing-view";
import { clientIpFromRequest } from "../lib/request-ip.js";
import { markFirstListingPosted, userListingCount } from "../lib/engagement-notifications";
import { listingFeedOrderBy } from "../lib/listing-top";
import {
  isListingMarketCode,
  LISTING_LOCATIONS_BY_COUNTRY,
} from "../lib/listing-locations.js";
import { moderateListingContent } from "../lib/listing-ai-moderation";
import { logListingModerationRejection } from "../lib/listing-moderation-rejection-log";
import {
  blockIfPriorModerationRejection,
} from "../lib/listing-moderation-repost-guard";
import { detectProhibitedListingContent } from "../../../../lib/listing-prohibited-content.js";
import { scanListingImagesForProhibitedContent } from "../lib/listing-image-prohibited-scan";
import { parseUiLang } from "../lib/claude-client";
import { effectiveListingSearchQuery } from "../../../../lib/listing-search-query.js";
import {
  listingSearchTokens,
  resolveListingHubSlug,
  resolveSearchTokenCategories,
} from "../../../../lib/listing-search-match.js";
import {
  buildListingTokenMatchCondition,
  listingTitleMatchScoreSql,
} from "../lib/listing-search-match-sql.js";
import { handleSellerComplaint } from "../lib/violation-escalation";
import { deleteListingCascade } from "../lib/delete-listing-cascade";
import type { User } from "@workspace/db";
import { finalizeListingsForApi, linkNewListingToMatchingShop, resolveShopIdForListingPoster } from "../lib/shop-listing-lookup";
import { applyViewerContact, buildCategoryRootSlugMap, formatListing } from "./listings-format";
import {
  requestPurgeExpiredListings,
} from "../lib/expire-listings-job";
import { runTwoLayerModeration } from "../lib/listing-two-layer-moderation";
import { blockSelfDuplicateListingIfNeeded } from "../lib/listing-self-duplicate";
import { sanitizeListingImageUrlField } from "../lib/listing-images";
import { pruneListingImagesAndNotifyOwner } from "../lib/listing-image-prune.js";
import { sanitizeListingVideoUrl } from "../lib/listing-video";
import {
  assertSpecialCategoryListingRules,
  expiresAtForCategoryRootSlug,
  resolveCategorySlugMeta,
} from "../lib/listing-special-categories.js";
import { getCategoryTreeIds } from "../lib/category-tree.js";
import { expiresAtAfterListingLifetime } from "../lib/listing-lifetime.js";
import { isListingPubliclyVisible, activeListingSqlCondition } from "../lib/listing-visibility.js";
import { postNewListingToFacebook } from "../services/socialMedia.js";
import { markListingFbPosted } from "../lib/facebook-scheduled-post-job";
import { logger } from "../lib/logger";

const reportRate = new Map<string, number[]>();

function clientIp(req: { ip?: string; headers: Record<string, unknown> }): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.ip ?? "unknown";
}

function rateLimitReport(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const max = 8;
  const hits = (reportRate.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  reportRate.set(ip, hits);
  return true;
}

const router = Router();

/** Backfill only null visibility fields — never flip status or extend lifetime on read. */
async function repairLegacyListingFields(
  row: typeof listingsTable.$inferSelect,
): Promise<typeof listingsTable.$inferSelect> {
  const patch: Partial<typeof listingsTable.$inferInsert> = {};
  if (!row.status) patch.status = "active";
  if (!row.moderation_status) patch.moderation_status = "approved";
  if (!row.expires_at) patch.expires_at = expiresAtAfterListingLifetime();
  if (!row.created_at) patch.created_at = new Date();
  if (!row.listed_at) patch.listed_at = row.created_at ?? new Date();

  if (Object.keys(patch).length === 0) return row;

  const [updated] = await db
    .update(listingsTable)
    .set(patch)
    .where(eq(listingsTable.id, row.id))
    .returning();
  return updated ?? { ...row, ...patch };
}

// ─── Filter: only active (non-expired) listings ───────────────────────────────
function activeCondition() {
  return activeListingSqlCondition();
}

type ListingRow = typeof listingsTable.$inferSelect;

async function buildSafeListingFeedPayloads(
  rows: ListingRow[],
  viewer: Awaited<ReturnType<typeof getSessionUser>>,
  catMap: Map<number, string>,
  catRootSlugMap: Map<number, string | null>,
) {
  const payloads = [];
  for (const l of rows) {
    try {
      payloads.push(
        applyViewerContact(
          formatListing(l, catMap.get(l.category_id) ?? null, catRootSlugMap.get(l.category_id) ?? null),
          viewer,
        ),
      );
    } catch (err) {
      logger.warn({ err, listingId: l.id }, "formatListing skipped in feed");
    }
  }
  try {
    return await finalizeListingsForApi(payloads);
  } catch (err) {
    logger.error({ err }, "finalizeListingsForApi failed in feed");
    return payloads;
  }
}

// ─── GET /listings ────────────────────────────────────────────────────────────
router.get("/listings", searchLimiter, async (req, res) => {
  try {
  requestPurgeExpiredListings();
  const parsed = GetListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const viewer = await getSessionUser(req);
  const {
    category_id,
    category_ids,
    location,
    location_search,
    listing_country,
    property_txn,
    property_subtype,
    property_sqm_min,
    property_sqm_max,
    property_floor,
    min_price,
    max_price,
    search,
    page = 1,
    limit = 20,
    year_min,
    year_max,
    mileage_max,
    mileage_min,
    truck_type_slug,
    truck_axle_config,
    truck_gvw_band,
    truck_euro_standard,
    motor_type_slug,
    motor_cc_band,
    motor_kw_min,
    motor_kw_max,
    motor_transmission,
    vehicle_body_type,
    vehicle_body_filter,
    vehicle_model,
    fuel,
    user_id: sellerUserId,
  } = parsed.data;

  const categoryIdList =
    typeof category_ids === "string" && category_ids.trim().length > 0
      ? category_ids
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];

  const fuelList =
    typeof fuel === "string" && fuel.trim().length > 0
      ? fuel.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const motorTransmissionList =
    typeof motor_transmission === "string" && motor_transmission.trim().length > 0
      ? motor_transmission.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const conditions = [activeCondition()];
  if (sellerUserId != null && Number.isFinite(sellerUserId) && sellerUserId > 0) {
    conditions.push(eq(listingsTable.user_id, sellerUserId));
  }
  if (categoryIdList.length > 0) {
    conditions.push(inArray(listingsTable.category_id, categoryIdList));
  } else if (category_id) {
    const treeIds = await getCategoryTreeIds(category_id);
    if (treeIds.length > 0) {
      conditions.push(inArray(listingsTable.category_id, treeIds));
    } else {
      conditions.push(eq(listingsTable.category_id, category_id));
    }
  }
  if (location) conditions.push(eq(listingsTable.location, location));
  if (location_search && String(location_search).trim()) {
    const locTerm = `%${String(location_search).trim()}%`;
    conditions.push(ilike(listingsTable.location, locTerm));
  }
  if (
    listing_country &&
    isListingMarketCode(String(listing_country).trim()) &&
    !location_search?.trim() &&
    !location
  ) {
    const cities = LISTING_LOCATIONS_BY_COUNTRY[String(listing_country).trim()] ?? [];
    if (cities.length > 0) {
      conditions.push(
        or(...cities.map((city) => ilike(listingsTable.location, `%${city}%`)))!,
      );
    }
  }
  if (min_price != null) conditions.push(gte(listingsTable.price, String(min_price)));
  if (max_price != null) conditions.push(lte(listingsTable.price, String(max_price)));
  const searchTerm = effectiveListingSearchQuery(
    typeof search === "string" ? search : search != null ? String(search) : "",
  );
  const hubSlug = searchTerm ? resolveListingHubSlug(searchTerm) : null;
  const searchTokens = searchTerm && !hubSlug ? listingSearchTokens(searchTerm) : [];

  if (hubSlug) {
    const [hubCat] = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(and(eq(categoriesTable.slug, hubSlug), isNull(categoriesTable.parent_id)))
      .limit(1);
    if (hubCat) {
      const hubTreeIds = await getCategoryTreeIds(hubCat.id);
      if (hubTreeIds.length > 0) {
        conditions.push(inArray(listingsTable.category_id, hubTreeIds));
      } else {
        conditions.push(eq(listingsTable.category_id, hubCat.id));
      }
    } else {
      conditions.push(sql`false`);
    }
  } else if (searchTokens.length > 0) {
    const searchCats = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        parent_id: categoriesTable.parent_id,
        slug: categoriesTable.slug,
      })
      .from(categoriesTable);
    const resolutionByToken = await resolveSearchTokenCategories(
      searchTokens,
      searchCats,
      getCategoryTreeIds,
    );
    const searchCond = buildListingTokenMatchCondition(
      searchTokens,
      {
        title: listingsTable.title,
        description: listingsTable.description,
        vehicleModel: listingsTable.vehicle_model,
        categoryId: listingsTable.category_id,
      },
      resolutionByToken,
    );
    if (searchCond) conditions.push(searchCond);
  }

  if (year_min != null) {
    conditions.push(or(isNull(listingsTable.vehicle_year), gte(listingsTable.vehicle_year, year_min))!);
  }
  if (year_max != null) {
    conditions.push(or(isNull(listingsTable.vehicle_year), lte(listingsTable.vehicle_year, year_max))!);
  }
  if (mileage_max != null) {
    conditions.push(
      or(isNull(listingsTable.vehicle_mileage_km), lte(listingsTable.vehicle_mileage_km, mileage_max))!,
    );
  }
  if (mileage_min != null) {
    conditions.push(
      or(isNull(listingsTable.vehicle_mileage_km), gt(listingsTable.vehicle_mileage_km, mileage_min))!,
    );
  }
  if (truck_type_slug && String(truck_type_slug).trim()) {
    const sl = String(truck_type_slug).trim();
    conditions.push(or(isNull(listingsTable.truck_type_slug), eq(listingsTable.truck_type_slug, sl))!);
  }
  if (truck_axle_config && String(truck_axle_config).trim()) {
    const ax = String(truck_axle_config).trim();
    conditions.push(or(isNull(listingsTable.truck_axle_config), eq(listingsTable.truck_axle_config, ax))!);
  }
  if (truck_gvw_band && String(truck_gvw_band).trim()) {
    const gvw = String(truck_gvw_band).trim();
    conditions.push(or(isNull(listingsTable.truck_gvw_band), eq(listingsTable.truck_gvw_band, gvw))!);
  }
  if (truck_euro_standard && String(truck_euro_standard).trim()) {
    const euro = String(truck_euro_standard).trim();
    conditions.push(or(isNull(listingsTable.truck_euro_standard), eq(listingsTable.truck_euro_standard, euro))!);
  }

  if (motor_type_slug && String(motor_type_slug).trim()) {
    const mts = String(motor_type_slug).trim();
    conditions.push(or(isNull(listingsTable.motor_type_slug), eq(listingsTable.motor_type_slug, mts))!);
  }
  if (motor_cc_band && String(motor_cc_band).trim()) {
    const mcc = String(motor_cc_band).trim();
    conditions.push(or(isNull(listingsTable.motor_cc_band), eq(listingsTable.motor_cc_band, mcc))!);
  }
  if (motor_kw_min != null) {
    conditions.push(
      or(isNull(listingsTable.motor_power_kw), gte(listingsTable.motor_power_kw, motor_kw_min))!,
    );
  }
  if (motor_kw_max != null) {
    conditions.push(
      or(isNull(listingsTable.motor_power_kw), lte(listingsTable.motor_power_kw, motor_kw_max))!,
    );
  }
  if (motorTransmissionList.length > 0) {
    conditions.push(
      or(isNull(listingsTable.motor_transmission), inArray(listingsTable.motor_transmission, motorTransmissionList))!,
    );
  }

  if (property_txn && String(property_txn).trim()) {
    const tx = String(property_txn).trim();
    conditions.push(eq(listingsTable.property_txn, tx));
  }
  if (property_subtype && String(property_subtype).trim()) {
    const st = String(property_subtype).trim();
    conditions.push(
      or(isNull(listingsTable.property_subtype), eq(listingsTable.property_subtype, st))!,
    );
  }
  if (property_sqm_min != null) {
    conditions.push(
      or(isNull(listingsTable.property_sqm), gte(listingsTable.property_sqm, property_sqm_min))!,
    );
  }
  if (property_sqm_max != null) {
    conditions.push(
      or(isNull(listingsTable.property_sqm), lte(listingsTable.property_sqm, property_sqm_max))!,
    );
  }
  if (property_floor && String(property_floor).trim()) {
    const fl = String(property_floor).trim();
    conditions.push(or(isNull(listingsTable.property_floor), eq(listingsTable.property_floor, fl))!);
  }
  if (fuelList.length > 0) {
    conditions.push(or(isNull(listingsTable.vehicle_fuel), inArray(listingsTable.vehicle_fuel, fuelList))!);
  }

  if (vehicle_body_filter === "elektrike_hibrid") {
    conditions.push(
      or(isNull(listingsTable.vehicle_fuel), inArray(listingsTable.vehicle_fuel, ["Elektrik", "Hibrid"]))!,
    );
  } else if (vehicle_body_type && vehicle_body_type.trim()) {
    conditions.push(
      or(isNull(listingsTable.vehicle_body_type), eq(listingsTable.vehicle_body_type, vehicle_body_type.trim()))!,
    );
  }

  if (vehicle_model && String(vehicle_model).trim()) {
    const m = String(vehicle_model).trim();
    conditions.push(
      or(
        eq(listingsTable.vehicle_model, m),
        and(isNull(listingsTable.vehicle_model), ilike(listingsTable.description, `%Modeli: ${m}%`)),
      )!,
    );
  }

  const where = and(...conditions);

  const feedOrder =
    searchTokens.length > 0
      ? [desc(listingTitleMatchScoreSql(listingsTable.title, searchTokens[0]!)), ...listingFeedOrderBy]
      : listingFeedOrderBy;

  const [totalResult, rows] = await Promise.all([
    db.select({ total: count() }).from(listingsTable).where(where),
    db
      .select()
      .from(listingsTable)
      .where(where)
      .orderBy(...feedOrder)
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  const cats = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      parent_id: categoriesTable.parent_id,
    })
    .from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  const catRootSlugMap = buildCategoryRootSlugMap(cats);

  const listings = await buildSafeListingFeedPayloads(rows, viewer, catMap, catRootSlugMap);
  res.json({ listings, total: totalResult[0]?.total ?? 0, page, limit });
  } catch (err) {
    logger.error({ err, query: req.query }, "GET /listings failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /listings ───────────────────────────────────────────────────────────
router.post("/listings", postListingLimiter, async (req, res) => {
  try {
  let viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({
      error: "Authentication required",
      message: "Duhet të jeni i kyçur për të postuar. Hyni në llogari dhe provoni përsëri.",
    });
    return;
  }

  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    const message = formatZodIssuesMessage(parsed.error.issues);
    res.status(400).json({
      error: "Invalid request body",
      message,
      details: parsed.error.issues,
    });
    return;
  }

  const safeImageUrl = sanitizeListingImageUrlField(parsed.data.image_url) ?? undefined;
  const safeVideoUrl = sanitizeListingVideoUrl(parsed.data.video_url) ?? undefined;

  const normalizedTitle = normalizeListingTitle(parsed.data.title);
  const normalizedDescription = normalizeListingDescription(parsed.data.description);

  viewer = await syncSellerContactFromListingIfNeeded(viewer, {
    seller_name: parsed.data.seller_name,
    seller_phone: parsed.data.seller_phone,
  });
  viewer = await syncSellerContactFromListingOnPost(viewer, {
    seller_name: parsed.data.seller_name,
    seller_phone: parsed.data.seller_phone,
  });

  if (!userHasPostableContact(viewer)) {
    res.status(400).json({
      error: "INCOMPLETE_PROFILE",
      message:
        "Plotësoni emrin dhe numrin e telefonit në profilin tuaj para se të postoni.",
    });
    return;
  }

  const impersonation = detectContactImpersonation(viewer, {
    seller_name: parsed.data.seller_name,
    seller_phone: parsed.data.seller_phone,
    description: parsed.data.description,
  });
  if (impersonation.impersonation) {
    await recordListingOwnershipViolation({
      userId: viewer.id,
      context: "listing_create",
      reason: impersonation.reason,
      req,
      submittedPhone: parsed.data.seller_phone,
      submittedName: parsed.data.seller_name,
    });
    res.status(403).json({
      error: "OWNERSHIP_VIOLATION",
      message:
        "Nuk mund të postoni me të dhëna kontakti që nuk përputhen me llogarinë tuaj.",
    });
    return;
  }

  const sellerContact = canonicalSellerContactForUser(viewer);
  const listingDescription = sanitizeListingDescriptionEmail(normalizedDescription, viewer.email);

  try {
    await assertAccountActive(viewer, sellerContact.seller_phone);
  } catch {
    res.status(403).json({
      error: "Account suspended",
      message:
        "Llogaria ose numri i telefonit është i bllokuar. Nuk mund të postoni derisa të zgjidhet me mbështetjen.",
    });
    return;
  }

  const priorRejection = await blockIfPriorModerationRejection(
    viewer.id,
    normalizedTitle,
    listingDescription,
    parsed.data.category_id,
  );
  if (priorRejection) {
    res.status(403).json({
      error: "MODERATION_REPOST_BLOCKED",
      message: priorRejection.message,
    });
    return;
  }

  const selfDuplicate = await blockSelfDuplicateListingIfNeeded(
    viewer,
    normalizedTitle,
    listingDescription,
    {
      categoryId: parsed.data.category_id,
      imageUrl: safeImageUrl ?? null,
    },
  );
  if (selfDuplicate) {
    res.status(409).json({
      error: "DUPLICATE_LISTING_SELF",
      message: selfDuplicate.message,
    });
    return;
  }

  const specialGate = await assertSpecialCategoryListingRules({
    userId: viewer.id,
    categoryId: parsed.data.category_id,
    title: normalizedTitle,
    description: listingDescription,
    price: parsed.data.price,
    imageUrl: safeImageUrl ?? null,
  });
  if (!specialGate.ok) {
    res.status(403).json({
      error: specialGate.error,
      reason: specialGate.reason,
      message: specialGate.message,
    });
    return;
  }
  const listingPrice = specialGate.price;
  const categoryMeta = await resolveCategorySlugMeta(parsed.data.category_id);

  const twoLayer = await runTwoLayerModeration({
    userId: viewer.id,
    user: viewer,
    title: normalizedTitle,
    description: listingDescription,
    sellerPhone: sellerContact.seller_phone,
    categoryId: parsed.data.category_id,
    imageUrl: safeImageUrl ?? null,
  });
  if (!twoLayer.ok) {
    void logListingModerationRejection({
      title: normalizedTitle,
      reason: twoLayer.reason,
      categoryId: parsed.data.category_id,
      userId: viewer.id,
    }).catch(() => undefined);
    res.status(409).json({
      error: twoLayer.code,
      reason: twoLayer.reason,
      message: twoLayer.message,
    });
    return;
  }

  try {
    await assertBusinessListingCreate(viewer, {
      title: normalizedTitle,
      description: listingDescription,
      price: listingPrice,
      image_url: safeImageUrl,
      categoryRootSlug: categoryMeta?.rootSlug ?? null,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.startsWith("BUSINESS_")) {
        const publicMessage = (err as Error & { publicMessage?: string }).publicMessage;
        res.status(400).json({
          error: err.message,
          message: publicMessage ?? err.message,
        });
        return;
      }
    }
    throw err;
  }

  const [catRow] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, parsed.data.category_id))
    .limit(1);

  const bodyExtra = req.body as {
    price_agreement?: boolean;
    lang?: string;
    listing_country?: string;
  };
  const priceAgreement = !!bodyExtra.price_agreement;
  const moderation = await moderateListingContent(
    {
      title: normalizedTitle,
      description: listingDescription,
      price: listingPrice,
      price_agreement: priceAgreement,
      category_name: catRow?.name ?? null,
      categoryRootSlug: categoryMeta?.rootSlug ?? null,
      image_url: safeImageUrl,
      video_url: safeVideoUrl,
      condition: parsed.data.condition,
    },
    parseUiLang(bodyExtra.lang),
  );

  if (!moderation.approved) {
    void logListingModerationRejection({
      title: normalizedTitle,
      reason: moderation.reason || "Moderim automatik",
      categoryId: parsed.data.category_id,
      userId: viewer.id,
    }).catch(() => undefined);
    res.status(403).json({
      error: "LISTING_MODERATION_REJECTED",
      moderation_status: "rejected",
      moderation_reason: moderation.reason,
      message:
        moderation.reason ||
        "Njoftimi nuk u miratua. Kontrolloni titullin, përshkrimin dhe çmimin.",
    });
    return;
  }

  try {
    assertListingPostUserCooldown(viewer);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "LISTING_POST_COOLDOWN") {
      const e = err as Error & { publicMessage?: string };
      res.status(429).json({
        error: "LISTING_POST_COOLDOWN",
        message: e.publicMessage ?? "Ki pak durim, prisni 30 sekonda për postimin tjetër.",
      });
      return;
    }
    throw err;
  }

  const listingCountBefore = await userListingCount(viewer.id);
  const is_first_listing = listingCountBefore === 0;
  const shopId = await resolveShopIdForListingPoster({
    userId: viewer.id,
    userEmail: viewer.email,
    sellerPhone: sellerContact.seller_phone,
  });

  const now = new Date();
  const [row] = await db
    .insert(listingsTable)
    .values({
      user_id: viewer.id,
      shop_id: shopId,
      title: normalizedTitle,
      description: listingDescription,
      price: String(listingPrice),
      category_id: parsed.data.category_id,
      location: parsed.data.location,
      seller_name: sellerContact.seller_name,
      seller_phone: sellerContact.seller_phone,
      condition: parsed.data.condition,
      image_url: safeImageUrl ?? null,
      video_url: safeVideoUrl ?? null,
      is_featured: parsed.data.is_featured ?? false,
      listed_at: now,
      created_at: now,
      status: "active",
      moderation_status: "approved",
      moderation_reason: moderation.reason || null,
      expires_at: expiresAtForCategoryRootSlug(categoryMeta?.rootSlug),
      vehicle_year: parsed.data.vehicle_year ?? null,
      vehicle_mileage_km: parsed.data.vehicle_mileage_km ?? null,
      vehicle_fuel: parsed.data.vehicle_fuel ?? null,
      vehicle_body_type: parsed.data.vehicle_body_type ?? null,
      vehicle_model: parsed.data.vehicle_model ?? null,
      truck_type_slug: parsed.data.truck_type_slug ?? null,
      truck_axle_config: parsed.data.truck_axle_config ?? null,
      truck_gvw_band: parsed.data.truck_gvw_band ?? null,
      truck_euro_standard: parsed.data.truck_euro_standard ?? null,
      property_txn: parsed.data.property_txn ?? null,
      property_subtype: parsed.data.property_subtype ?? null,
      property_sqm: parsed.data.property_sqm ?? null,
      property_floor: parsed.data.property_floor ?? null,
      motor_type_slug: parsed.data.motor_type_slug ?? null,
      motor_cc_band: parsed.data.motor_cc_band ?? null,
      motor_power_kw: parsed.data.motor_power_kw ?? null,
      motor_transmission: parsed.data.motor_transmission ?? null,
    })
    .returning();

  void pruneListingImagesAndNotifyOwner({
    raw: parsed.data.image_url ?? null,
    cleaned: safeImageUrl ?? null,
    listingId: row.id,
    userId: row.user_id,
    listingTitle: row.title,
  }).catch((err: unknown) => {
    logger.warn({ err, listingId: row.id }, "prune dropped listing images on create failed");
  });

  recordListingPostSuccessForUser(viewer);
  try {
    await linkNewListingToMatchingShop({
      userId: viewer.id,
      userEmail: viewer.email,
      sellerPhone: sellerContact.seller_phone,
      listingId: row.id,
    });
  } catch (linkErr) {
    logger.warn({ linkErr, userId: viewer.id, listingId: row.id }, "listing shop link after post failed");
  }
  if (is_first_listing) {
    await markFirstListingPosted(viewer.id);
  }

  let shopNameForSocial: string | null = null;
  if (shopId) {
    const [shopRow] = await db
      .select({ shop_name: shopsTable.shop_name })
      .from(shopsTable)
      .where(eq(shopsTable.id, shopId))
      .limit(1);
    shopNameForSocial = shopRow?.shop_name ?? null;
  }

  const socialIntegrity = await verifyListingOwnerIntegrity(
    {
      id: row.id,
      user_id: row.user_id,
      seller_name: row.seller_name,
      seller_phone: row.seller_phone,
      description: row.description,
    },
    "social_cron_facebook",
  );

  if (socialIntegrity.ok) {
  void postNewListingToFacebook({
    id: row.id,
    title: row.title,
    description: row.description,
    price: listingPrice,
    location: row.location,
    image_url: safeImageUrl ?? row.image_url,
    category_name: catRow?.name ?? categoryMeta?.name ?? null,
    category_slug: categoryMeta?.slug ?? null,
    root_category_slug: categoryMeta?.rootSlug ?? null,
    seller_name: row.seller_name,
    shop_name: shopNameForSocial,
    property_subtype: row.property_subtype ?? null,
    property_txn: row.property_txn ?? null,
    listing_country: bodyExtra.listing_country ?? null,
  })
    .then(async (fbResult) => {
      if (fbResult.postId) await markListingFbPosted(row.id);
    })
    .catch((err: unknown) => {
      logger.error({ err, listingId: row.id }, "facebook auto-post background error");
    });
  } else {
    logger.warn(
      { listingId: row.id, reason: socialIntegrity.reason },
      "facebook auto-post skipped — listing owner integrity failed",
    );
  }

  const cat = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, row.category_id))
    .limit(1);

  const [created] = await finalizeListingsForApi([
    applyViewerContact(
      formatListing(row, cat[0]?.name ?? null, categoryMeta?.rootSlug ?? null),
      viewer,
    ),
  ]);
  res.status(201).json({ ...created, is_first_listing });
  } catch (err) {
    logger.error({ err }, "POST /listings failed");
    if (!res.headersSent) {
      res.status(500).json({
        error: "LISTING_POST_FAILED",
        message: "Ndodhi një gabim gjatë postimit. Provoni përsëri pas pak.",
      });
    }
  }
});

// ─── GET /listings/top — all active paid TOP listings (homepage carousel) ─────
router.get("/listings/top", async (req, res) => {
  try {
    requestPurgeExpiredListings();
    const viewer = await getSessionUser(req);
    const now = new Date();

    const rows = await db
      .select()
      .from(listingsTable)
      .where(
        and(
          eq(listingsTable.is_top, true),
          gt(listingsTable.top_until, now),
          activeCondition(),
        ),
      )
      .orderBy(desc(listingsTable.top_until), desc(listingsTable.listed_at));

    const cats = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        parent_id: categoriesTable.parent_id,
      })
      .from(categoriesTable);
    const catMap = new Map(cats.map((c) => [c.id, c.name]));
    const catRootSlugMap = buildCategoryRootSlugMap(cats);
    res.json(await buildSafeListingFeedPayloads(rows, viewer, catMap, catRootSlugMap));
  } catch (err) {
    logger.error({ err }, "GET /listings/top failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /listings/featured ───────────────────────────────────────────────────
router.get("/listings/featured", async (req, res) => {
  try {
    requestPurgeExpiredListings();
    const viewer = await getSessionUser(req);
    const rows = await db
      .select()
      .from(listingsTable)
      .where(and(eq(listingsTable.is_featured, true), activeCondition()))
      .orderBy(...listingFeedOrderBy)
      .limit(8);

    const cats = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        parent_id: categoriesTable.parent_id,
      })
      .from(categoriesTable);
    const catMap = new Map(cats.map((c) => [c.id, c.name]));
    const catRootSlugMap = buildCategoryRootSlugMap(cats);
    res.json(await buildSafeListingFeedPayloads(rows, viewer, catMap, catRootSlugMap));
  } catch (err) {
    logger.error({ err }, "GET /listings/featured failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /listings/recent ─────────────────────────────────────────────────────
router.get("/listings/recent", async (req, res) => {
  try {
    requestPurgeExpiredListings();
    const viewer = await getSessionUser(req);
    const rows = await db
      .select()
      .from(listingsTable)
      .where(activeCondition())
      .orderBy(...listingFeedOrderBy)
      .limit(12);

    const cats = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        parent_id: categoriesTable.parent_id,
      })
      .from(categoriesTable);
    const catMap = new Map(cats.map((c) => [c.id, c.name]));
    const catRootSlugMap = buildCategoryRootSlugMap(cats);
    res.json(await buildSafeListingFeedPayloads(rows, viewer, catMap, catRootSlugMap));
  } catch (err) {
    logger.error({ err }, "GET /listings/recent failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /listings/stats ──────────────────────────────────────────────────────
router.get("/listings/stats", async (req, res) => {
  try {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const categoryIdRaw = Number(req.query.category_id);
  const categoryId = Number.isFinite(categoryIdRaw) && categoryIdRaw > 0 ? categoryIdRaw : null;

  const [totalRes, catRes, featuredRes, todayRes, locationRes, onlineUsersRes] = await Promise.all([
    db.select({ total: count() }).from(listingsTable).where(activeCondition()),
    db.select({ total: count() }).from(categoriesTable),
    db
      .select({ total: count() })
      .from(listingsTable)
      .where(and(eq(listingsTable.is_featured, true), activeCondition())),
    db
      .select({ total: count() })
      .from(listingsTable)
      .where(and(gte(listingsTable.created_at, today), activeCondition())),
    db
      .select({
        location: listingsTable.location,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(listingsTable)
      .where(activeCondition())
      .groupBy(listingsTable.location)
      .orderBy(desc(sql`count(*)`))
      .limit(5),
    countUsersOnlineNow(),
  ]);

  let category_listings: number | null = null;
  if (categoryId) {
    const treeIds = await getCategoryTreeIds(categoryId);
    if (treeIds.length > 0) {
      const [catCount] = await db
        .select({ total: count() })
        .from(listingsTable)
        .where(and(activeCondition(), inArray(listingsTable.category_id, treeIds)));
      category_listings = catCount?.total ?? 0;
    }
  }

  res.json({
    total_listings: totalRes[0]?.total ?? 0,
    total_categories: catRes[0]?.total ?? 0,
    featured_count: featuredRes[0]?.total ?? 0,
    listings_today: todayRes[0]?.total ?? 0,
    top_locations: locationRes,
    category_listings: category_listings,
    users_online_now: computeDisplayUsersOnlineNow(
      Date.now(),
      Math.max(onlineUsersRes, countSitePresenceNow()),
    ),
  });
  } catch (err) {
    logger.error({ err, query: req.query }, "GET /listings/stats failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /listings/free-quota ─────────────────────────────────────────────────
router.get("/listings/free-quota", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const categoryId = Number(req.query.category_id);
  if (!Number.isFinite(categoryId) || categoryId < 1) {
    res.status(400).json({ error: "category_id required" });
    return;
  }

  res.json({
    allowed: true,
    remaining: Number.POSITIVE_INFINITY,
    limit: Number.POSITIVE_INFINITY,
    monthly_posts_used: 0,
    monthly_posts_limit: Number.POSITIVE_INFINITY,
    monthly_remaining: Number.POSITIVE_INFINITY,
    block_reason: null,
    will_charge_wallet: false,
    can_post_with_wallet: false,
    wallet_balance_cents: 0,
    show_packages: false,
    business: null,
    account_type: viewer.account_type ?? "private",
    quota_scope: "unlimited",
  });
});

// ─── GET /listings/monthly-posting-history ────────────────────────────────────
router.get("/listings/monthly-posting-history", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({
      error: "Authentication required",
      message: "Duhet të jeni i kyçur.",
    });
    return;
  }
  const history = await getUserMonthlyPostingHistory(viewer);
  res.json(history);
});

// ─── GET /listings/mine ───────────────────────────────────────────────────────
router.get("/listings/mine", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({
      error: "Authentication required",
      message: "Duhet të jeni i kyçur.",
    });
    return;
  }

  const selectFields = {
    id: listingsTable.id,
    title: listingsTable.title,
    status: listingsTable.status,
    expires_at: listingsTable.expires_at,
    listed_at: listingsTable.listed_at,
    created_at: listingsTable.created_at,
    seller_phone: listingsTable.seller_phone,
    description: listingsTable.description,
    user_id: listingsTable.user_id,
  };

  const byUserId = await db
    .select(selectFields)
    .from(listingsTable)
    .where(eq(listingsTable.user_id, viewer.id))
    .orderBy(desc(listingsTable.listed_at))
    .limit(100);

  const legacyRows = await db
    .select(selectFields)
    .from(listingsTable)
    .where(isNull(listingsTable.user_id))
    .orderBy(desc(listingsTable.listed_at))
    .limit(300);

  const legacyMine = legacyRows.filter((row) =>
    listingBelongsToUser(viewer.id, viewer, row),
  );

  const seen = new Set<number>();
  const now = new Date();
  const listings: Array<{
    id: number;
    title: string;
    status: string;
    is_expired: boolean;
    expires_at: string | null;
    listed_at: string;
  }> = [];

  for (const row of [...byUserId, ...legacyMine]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const expires = row.expires_at ? new Date(row.expires_at) : null;
    listings.push({
      id: row.id,
      title: row.title,
      status: row.status ?? "active",
      is_expired: expires ? expires < now : false,
      expires_at: row.expires_at ? row.expires_at.toISOString() : null,
      listed_at: (row.listed_at ?? row.created_at).toISOString(),
    });
  }

  listings.sort((a, b) => b.listed_at.localeCompare(a.listed_at));
  res.json({ listings });
});

// ─── POST /listings/:id/report ────────────────────────────────────────────────
router.post("/listings/:id/report", async (req, res) => {
  const listingId = Number(req.params.id);
  if (!Number.isFinite(listingId) || listingId < 1) {
    res.status(400).json({ error: "Invalid listing id" });
    return;
  }

  const ip = clientIp(req);
  if (!rateLimitReport(ip)) {
    res.status(429).json({ error: "Too many reports. Try again later." });
    return;
  }

  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  if (reason.length < 10) {
    res.status(400).json({ error: "reason must be at least 10 characters" });
    return;
  }

  const [listing] = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const reporter = await getSessionUser(req);
  const reporterName =
    typeof req.body?.reporter_name === "string" && req.body.reporter_name.trim()
      ? req.body.reporter_name.trim().slice(0, 120)
      : reporter?.display_name?.trim() ?? "Anonim";

  const [created] = await db
    .insert(listingReportsTable)
    .values({
      listing_id: listingId,
      reason: reason.slice(0, 2000),
      reporter_name: reporterName,
      status: "pending",
    })
    .returning();

  res.status(201).json({
    ok: true,
    id: created.id,
    message: "Raportimi u dërgua. Do ta shqyrtojmë brenda 24 orëve.",
  });
});

// ─── POST /listings/:id/complaint ─────────────────────────────────────────────
router.post("/listings/:id/complaint", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const listingId = Number(req.params.id);
  if (!Number.isFinite(listingId) || listingId < 1) {
    res.status(400).json({ error: "Invalid listing id" });
    return;
  }

  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  if (listingBelongsToUser(viewer.id, viewer, listing)) {
    res.status(400).json({ error: "Cannot complain about your own listing" });
    return;
  }

  const phoneDigits = listing.seller_phone.replace(/\D/g, "");
  const [sellerByPhone] = phoneDigits
    ? await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.phone_e164_digits, phoneDigits))
        .limit(1)
    : [undefined];

  const specEmail = listing.description.match(/Email:\s*([^\s·]+@[^\s·]+)/i)?.[1]?.toLowerCase();
  const [sellerByEmail] = specEmail
    ? await db.select().from(usersTable).where(eq(usersTable.email, specEmail)).limit(1)
    : [undefined];

  const seller = sellerByPhone ?? sellerByEmail ?? null;

  if (!seller) {
    res.status(400).json({
      error: "SELLER_NOT_REGISTERED",
      message: "Shitësi nuk ka llogari të regjistruar për ankesë automatike.",
    });
    return;
  }

  const contact =
    typeof req.body?.contact === "string" ? req.body.contact.trim().slice(0, 200) : viewer.email ?? "";

  const result = await handleSellerComplaint(
    seller.id,
    listingId,
    typeof req.body?.reason === "string" ? req.body.reason.trim() : undefined,
    contact || undefined,
  );

  res.json({
    ok: true,
    message: "Ankesa u regjistrua.",
    total_complaints: result.total,
    action: result.action,
  });
});

// ─── POST /listings/:id/repost ──────────────────────────────────────────────────
router.post("/listings/:id/repost", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const listingId = Number(req.params.id);
  if (!Number.isFinite(listingId) || listingId < 1) {
    res.status(400).json({ error: "Invalid listing id" });
    return;
  }

  try {
    assertListingPostUserCooldown(viewer);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "LISTING_POST_COOLDOWN") {
      const e = err as Error & { publicMessage?: string };
      res.status(429).json({
        error: "LISTING_POST_COOLDOWN",
        message: e.publicMessage ?? "Ki pak durim, prisni 30 sekonda për postimin tjetër.",
      });
      return;
    }
    throw err;
  }

  const result = await repostListing(viewer, listingId);
  if (!result.ok) {
    const status =
      result.error === "NOT_FOUND" ? 404 : result.error === "FORBIDDEN" ? 403 : 409;
    res.status(status).json({ error: result.error, message: result.message });
    return;
  }

  recordListingPostSuccessForUser(viewer);

  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  const catMeta = row ? await resolveCategorySlugMeta(row.category_id) : null;

  const listingOut = row
    ? applyViewerContact(
        formatListing(row, catMeta?.name ?? null, catMeta?.rootSlug ?? null),
        viewer,
      )
    : null;
  const [listingAnnotated] = listingOut
    ? await finalizeListingsForApi([listingOut])
    : [null];
  res.json({
    ok: true,
    message: "Njoftimi u rifillua dhe shfaqet përsëri në listë si i ri.",
    listing: listingAnnotated,
  });
});

// ─── POST /listings/:id/view ──────────────────────────────────────────────────
router.post("/listings/:id/view", async (req, res) => {
  const id = Number(req.params.id);
  const viewer = await getSessionUser(req);
  const result = await incrementListingView(id, {
    viewer,
    clientIp: clientIpFromRequest(req),
  });
  if (!result.ok) {
    res.status(result.status).json({ error: result.status === 404 ? "Not found" : "Invalid id" });
    return;
  }
  res.json({ ok: true, views: result.views, counted: result.counted });
});

// ─── GET /listings/:id ────────────────────────────────────────────────────────
router.get("/listings/:id", async (req, res) => {
  const listingIdParam = req.params.id;
  try {
    const viewer = await getSessionUser(req);
    const parsed = GetListingParams.safeParse({ id: Number(listingIdParam) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    let [row] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, parsed.data.id));

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    let isOwner = false;
    try {
      isOwner = !!(viewer && listingBelongsToUser(viewer.id, viewer, {
        user_id: row.user_id,
        seller_phone: row.seller_phone ?? "",
        description: row.description ?? "",
      }));
    } catch (ownerErr) {
      logger.warn({ ownerErr, listingId: parsed.data.id }, "listingBelongsToUser failed on GET");
    }
    const canRepost = isOwner && !isListingPubliclyVisible(row);

    row = await repairLegacyListingFields(row).catch((repairErr) => {
      logger.warn({ repairErr, listingId: row.id }, "repairLegacyListingFields failed on GET");
      return row;
    });

    if (!isOwner && !isListingPubliclyVisible(row)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    let catMeta: Awaited<ReturnType<typeof resolveCategorySlugMeta>> = null;
    try {
      catMeta = await resolveCategorySlugMeta(row.category_id);
    } catch (catErr) {
      logger.warn({ catErr, listingId: row.id }, "resolveCategorySlugMeta failed on GET");
    }

    let formatted: ReturnType<typeof formatListing>;
    try {
      formatted = formatListing(row, catMeta?.name ?? null, catMeta?.rootSlug ?? null);
    } catch (formatErr) {
      logger.error({ formatErr, listingId: row.id }, "formatListing failed on GET");
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    try {
      if (await isListingUserPlatformAdmin(row.user_id)) {
        formatted = {
          ...formatted,
          description: descriptionForAdminOnBehalf(formatted.description ?? ""),
        };
      }
    } catch (adminErr) {
      logger.warn({ adminErr, listingId: row.id }, "admin description check failed on GET");
    }

    let payload = formatted as ReturnType<typeof formatListing> & { can_repost: boolean };
    try {
      payload = {
        ...(applyViewerContact(formatted, viewer) as ReturnType<typeof formatListing>),
        can_repost: canRepost,
      };
    } catch (contactErr) {
      logger.warn({ contactErr, listingId: row.id }, "applyViewerContact failed on GET");
      payload = { ...formatted, can_repost: canRepost };
    }

    const finalized = await finalizeListingsForApi([payload]).catch((finalizeErr) => {
      logger.warn({ finalizeErr, listingId: parsed.data.id }, "finalizeListingsForApi failed on GET");
      return [payload];
    });
    const out = finalized[0] ?? payload;

    let seller_is_online = false;
    let seller_profile_href: string | null = null;
    if (row.user_id != null) {
      const [seller] = await db
        .select({ last_active_at: usersTable.last_active_at })
        .from(usersTable)
        .where(eq(usersTable.id, row.user_id))
        .limit(1);
      seller_is_online = isSellerOnline(seller?.last_active_at);
    }
    seller_profile_href = await resolveSellerProfileHref({
      user_id: row.user_id,
      shop_id: row.shop_id,
    });

    res.json({ ...out, can_repost: payload.can_repost, is_owner: isOwner, seller_is_online, seller_profile_href });
  } catch (err) {
    logger.error({ err, listingId: listingIdParam }, "GET /listings/:id failed");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// ─── PATCH /listings/:id ──────────────────────────────────────────────────────
router.patch("/listings/:id", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const paramsParsed = UpdateListingParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParsed = UpdateListingBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body", details: bodyParsed.error.issues });
    return;
  }

  const existing = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, paramsParsed.data.id));

  if (!existing[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (!listingBelongsToUser(viewer.id, viewer, existing[0])) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updates: Partial<typeof listingsTable.$inferInsert> = {};
  const body = bodyParsed.data;
  const patchExtra = req.body as { price_agreement?: boolean; lang?: string };

  const nextTitle = body.title ?? existing[0].title;
  let nextDescription = body.description ?? existing[0].description;

  if (body.description != null) {
    const emailCheck = detectContactImpersonation(viewer, {
      seller_name: existing[0].seller_name,
      seller_phone: existing[0].seller_phone,
      description: body.description,
    });
    if (emailCheck.impersonation) {
      await recordListingOwnershipViolation({
        userId: viewer.id,
        listingId: paramsParsed.data.id,
        context: "listing_update",
        reason: emailCheck.reason,
        req,
      });
      res.status(403).json({
        error: "OWNERSHIP_VIOLATION",
        message:
          "Nuk mund të përdorni email kontakti që nuk përputhet me llogarinë tuaj.",
      });
      return;
    }
    nextDescription = sanitizeListingDescriptionEmail(body.description, viewer.email);
  }

  if (body.title != null || body.description != null) {
    await removeUserDuplicateListingsForPost(
      viewer,
      nextTitle,
      nextDescription,
      paramsParsed.data.id,
    );
  }

  if (body.title != null) updates.title = body.title;
  if (body.description != null) updates.description = nextDescription;
  if (body.price != null) updates.price = String(body.price);
  if (body.location != null) updates.location = body.location;
  if (body.condition != null) updates.condition = body.condition;
  if (body.image_url != null) {
    updates.image_url = sanitizeListingImageUrlField(body.image_url);
    const imageHit = await scanListingImagesForProhibitedContent(updates.image_url);
    if (imageHit) {
      void logListingModerationRejection({
        title: nextTitle,
        reason: `PROHIBITED_IMAGE:${imageHit.label}`,
        categoryId: existing[0].category_id,
        userId: viewer.id,
      }).catch(() => undefined);
      res.status(403).json({
        error: "PROHIBITED_CONTENT",
        message: imageHit.reason,
      });
      return;
    }
  }
  if (body.is_featured != null) updates.is_featured = body.is_featured;

  const nextPrice =
    body.price != null ? body.price : Number(existing[0].price);
  const contentChanged =
    body.title != null || body.description != null || body.price != null;

  if (contentChanged) {
    const prohibited = detectProhibitedListingContent(nextTitle, nextDescription);
    if (prohibited) {
      void logListingModerationRejection({
        title: nextTitle,
        reason: `PROHIBITED:${prohibited.label}`,
        categoryId: existing[0].category_id,
        userId: viewer.id,
      }).catch(() => undefined);
      res.status(403).json({
        error: "PROHIBITED_CONTENT",
        message: prohibited.reason,
      });
      return;
    }

    const [catRow] = await db
      .select({ name: categoriesTable.name })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, existing[0].category_id))
      .limit(1);

    const moderation = await moderateListingContent(
      {
        title: nextTitle,
        description: nextDescription,
        price: nextPrice,
        price_agreement: !!patchExtra.price_agreement,
        category_name: catRow?.name ?? null,
        image_url:
          body.image_url != null
            ? sanitizeListingImageUrlField(body.image_url)
            : sanitizeListingImageUrlField(existing[0].image_url),
        condition: body.condition ?? existing[0].condition,
      },
      parseUiLang(patchExtra.lang),
    );

    if (!moderation.approved) {
      void logListingModerationRejection({
        title: nextTitle,
        reason: moderation.reason || "Moderim automatik",
        categoryId: existing[0].category_id,
        userId: viewer.id,
      }).catch(() => undefined);
      res.status(403).json({
        error: "LISTING_MODERATION_REJECTED",
        moderation_status: "rejected",
        moderation_reason: moderation.reason,
        message:
          moderation.reason ||
          "Njoftimi nuk u miratua. Kontrolloni titullin, përshkrimin dhe çmimin.",
      });
      return;
    }
  }

  const [updated] = await db
    .update(listingsTable)
    .set(updates)
    .where(eq(listingsTable.id, paramsParsed.data.id))
    .returning();

  if (body.image_url != null) {
    void pruneListingImagesAndNotifyOwner({
      raw: body.image_url,
      cleaned: updated.image_url,
      listingId: updated.id,
      userId: updated.user_id,
      listingTitle: updated.title,
    }).catch((err: unknown) => {
      logger.warn({ err, listingId: updated.id }, "prune dropped listing images on update failed");
    });
  }

  const catMeta = await resolveCategorySlugMeta(updated.category_id);

  const [patched] = await finalizeListingsForApi([
    applyViewerContact(
      formatListing(updated, catMeta?.name ?? null, catMeta?.rootSlug ?? null),
      viewer,
    ),
  ]);
  res.json(patched);
});

// ─── DELETE /listings/:id ─────────────────────────────────────────────────────
router.delete("/listings/:id", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const parsed = DeleteListingParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const existing = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, parsed.data.id));

  if (!existing[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (!listingBelongsToUser(viewer.id, viewer, existing[0])) {
    res.status(403).json({
      error: "Forbidden",
      message: "Nuk keni të drejtë ta fshini këtë njoftim.",
    });
    return;
  }

  try {
    const removed = await deleteListingCascade(parsed.data.id, "owner");
    if (!removed) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log?.error({ err, listingId: parsed.data.id }, "delete listing failed");
    res.status(500).json({
      error: "DELETE_FAILED",
      message: "Njoftimi nuk u fshi. Provoni përsëri.",
    });
  }
});

export default router;
