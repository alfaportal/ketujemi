import { Router } from "express";
import { db } from "@workspace/db";
import { listingsTable, categoriesTable, listingReportsTable, usersTable } from "@workspace/db";
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
import { postListingLimiter, searchLimiter } from "../lib/express-rate-limiters";
import { userOwnsListing } from "../lib/listing-ownership";
import { sellerFirstName, maskEmailInListingDescription, maskSellerPhone } from "../lib/contact-mask";
import { assertAccountActive } from "../lib/user-ban";
import {
  assertFreeListingQuota,
  getCategoryPostingQuota,
} from "../lib/category-quota";
import { isBusinessAccount, isVipBusinessActive } from "../lib/business-rules";
import { assertBusinessListingCreate } from "../lib/business-listing-guard";
import { removeUserDuplicateListingsForPost } from "../lib/listing-duplicate-guard";
import {
  assertListingPostUserCooldown,
  recordListingPostSuccessForUser,
} from "../lib/listing-post-user-cooldown";
import { repostListing } from "../lib/listing-repost";
import { incrementListingView } from "../lib/listing-view";
import { listingFeedOrderBy, isTopActive } from "../lib/listing-top";
import {
  isListingMarketCode,
  LISTING_LOCATIONS_BY_COUNTRY,
} from "../lib/listing-locations.js";
import { moderateListingContent } from "../lib/listing-ai-moderation";
import { logListingModerationRejection } from "../lib/listing-moderation-rejection-log";
import { parseUiLang } from "../lib/claude-client";
import { effectiveListingSearchQuery } from "../../../../lib/listing-search-query.js";
import {
  assertWalletCoversListing,
  debitWalletForListing,
  listingWillChargeWallet,
  walletSummary,
} from "../lib/wallet";
import { handleSellerComplaint } from "../lib/violation-escalation";
import { deleteListingCascade } from "../lib/delete-listing-cascade";
import type { User } from "@workspace/db";
import { annotateListingsWithVipFlag } from "../lib/vip-seller-lookup";
import {
  purgeExpiredListingById,
  requestPurgeExpiredListings,
} from "../lib/expire-listings-job";
import { runTwoLayerModeration } from "../lib/listing-two-layer-moderation";
import { blockSelfDuplicateListingIfNeeded } from "../lib/listing-self-duplicate";
import {
  primaryListingImageUrl,
  sanitizeListingImageUrlField,
} from "../lib/listing-images";
import {
  assertSpecialCategoryListingRules,
  expiresAtForCategoryRootSlug,
  resolveCategorySlugMeta,
} from "../lib/listing-special-categories.js";

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

function withSellerContactForViewer<
  T extends { seller_phone: string; seller_name: string; description: string },
>(listing: T, viewer: User | null): T {
  const description = viewer
    ? listing.description
    : maskEmailInListingDescription(listing.description);

  return {
    ...listing,
    seller_name: viewer ? listing.seller_name : sellerFirstName(listing.seller_name),
    seller_phone: viewer ? listing.seller_phone : "",
    description,
  };
}

function applyViewerContact<
  T extends { seller_phone: string; seller_name: string; description: string },
>(listing: T, viewer: User | null): T {
  return withSellerContactForViewer(listing, viewer);
}

// ─── Helper: format listing with all fields ───────────────────────────────────
function buildCategoryRootSlugMap(
  cats: { id: number; slug: string | null; parent_id: number | null }[],
): Map<number, string | null> {
  const byId = new Map(cats.map((c) => [c.id, c]));
  const memo = new Map<number, string | null>();

  function rootSlugFor(id: number): string | null {
    if (memo.has(id)) return memo.get(id)!;
    const cat = byId.get(id);
    if (!cat) return null;
    let slug: string | null = null;
    if (!cat.parent_id) {
      slug = cat.slug?.trim() ?? null;
    } else {
      const parent = byId.get(cat.parent_id);
      if (parent && !parent.parent_id) {
        slug = parent.slug?.trim() ?? cat.slug?.trim() ?? null;
      } else if (parent?.parent_id) {
        const grand = byId.get(parent.parent_id);
        slug = grand?.slug?.trim() ?? parent.slug?.trim() ?? cat.slug?.trim() ?? null;
      } else {
        slug = parent?.slug?.trim() ?? cat.slug?.trim() ?? null;
      }
    }
    memo.set(id, slug);
    return slug;
  }

  return new Map(cats.map((c) => [c.id, rootSlugFor(c.id)]));
}

function formatListing(
  l: typeof listingsTable.$inferSelect,
  categoryName: string | null,
  categoryRootSlug: string | null = null,
) {
  const now = new Date();
  const expires = l.expires_at ? new Date(l.expires_at) : null;
  const daysLeft = expires
    ? Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const image_url = sanitizeListingImageUrlField(l.image_url);

  return {
    ...l,
    image_url,
    primary_image_url: primaryListingImageUrl(image_url),
    price: Number(l.price),
    category_name: categoryName,
    category_root_slug: categoryRootSlug,
    seller_phone_masked: maskSellerPhone(l.seller_phone),
    created_at: l.created_at.toISOString(),
    expires_at: l.expires_at ? l.expires_at.toISOString() : null,
    days_left: daysLeft,
    is_expired: expires ? expires < now : false,
    is_top: isTopActive(l),
    top_until: l.top_until ? l.top_until.toISOString() : null,
    top_count: l.top_count ?? 0,
    listed_at: l.listed_at ? l.listed_at.toISOString() : l.created_at.toISOString(),
    status: l.status ?? "active",
    moderation_status: l.moderation_status ?? "approved",
    vehicle_year: l.vehicle_year ?? null,
    vehicle_mileage_km: l.vehicle_mileage_km ?? null,
    vehicle_fuel: l.vehicle_fuel ?? null,
    vehicle_body_type: l.vehicle_body_type ?? null,
    vehicle_model: l.vehicle_model ?? null,
    truck_type_slug: l.truck_type_slug ?? null,
    truck_axle_config: l.truck_axle_config ?? null,
    truck_gvw_band: l.truck_gvw_band ?? null,
    truck_euro_standard: l.truck_euro_standard ?? null,
    property_txn: l.property_txn ?? null,
    property_subtype: l.property_subtype ?? null,
    property_sqm: l.property_sqm ?? null,
    property_floor: l.property_floor ?? null,
    motor_type_slug: l.motor_type_slug ?? null,
    motor_cc_band: l.motor_cc_band ?? null,
    motor_power_kw: l.motor_power_kw ?? null,
    motor_transmission: l.motor_transmission ?? null,
  };
}

// ─── Filter: only active (non-expired) listings ───────────────────────────────
function activeCondition() {
  return and(gt(listingsTable.expires_at, new Date()), eq(listingsTable.status, "active"));
}

// ─── GET /listings ────────────────────────────────────────────────────────────
router.get("/listings", searchLimiter, async (req, res) => {
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
  if (categoryIdList.length > 0) {
    conditions.push(inArray(listingsTable.category_id, categoryIdList));
  } else if (category_id) {
    conditions.push(eq(listingsTable.category_id, category_id));
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
  if (searchTerm) {
    const term = `%${searchTerm}%`;
    conditions.push(or(ilike(listingsTable.title, term), ilike(listingsTable.description, term))!);
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

  const [totalResult, rows] = await Promise.all([
    db.select({ total: count() }).from(listingsTable).where(where),
    db
      .select()
      .from(listingsTable)
      .where(where)
      .orderBy(...listingFeedOrderBy)
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

  const listings = await annotateListingsWithVipFlag(
    rows.map((l) =>
      applyViewerContact(
        formatListing(l, catMap.get(l.category_id) ?? null, catRootSlugMap.get(l.category_id) ?? null),
        viewer,
      ),
    ),
  );
  res.json({ listings, total: totalResult[0]?.total ?? 0, page, limit });
});

// ─── POST /listings ───────────────────────────────────────────────────────────
router.post("/listings", postListingLimiter, async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }

  const safeImageUrl = sanitizeListingImageUrlField(parsed.data.image_url) ?? undefined;

  try {
    await assertAccountActive(viewer, parsed.data.seller_phone);
  } catch {
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  const selfDuplicate = await blockSelfDuplicateListingIfNeeded(
    viewer,
    parsed.data.title,
    parsed.data.description,
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
    title: parsed.data.title,
    description: parsed.data.description,
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
    title: parsed.data.title,
    description: parsed.data.description,
    sellerPhone: parsed.data.seller_phone,
    categoryId: parsed.data.category_id,
    imageUrl: safeImageUrl ?? null,
  });
  if (!twoLayer.ok) {
    res.status(409).json({
      error: twoLayer.code,
      reason: twoLayer.reason,
      message: twoLayer.message,
    });
    return;
  }

  try {
    await assertBusinessListingCreate(viewer, {
      title: parsed.data.title,
      description: parsed.data.description,
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

  const willChargeWallet = await listingWillChargeWallet(viewer, parsed.data.category_id);

  if (willChargeWallet) {
    try {
      await assertWalletCoversListing(viewer, parsed.data.category_id);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "WALLET_INSUFFICIENT") {
        const e = err as Error & {
          balance_cents: number;
          required_cents: number;
          listings_remaining: number;
          publicMessage?: string;
        };
        res.status(402).json({
          error: "WALLET_INSUFFICIENT",
          message:
            e.publicMessage ??
            "Balanca juaj nuk mjafton. Mbushni portofolin nga profili juaj.",
          balance_cents: e.balance_cents,
          required_cents: e.required_cents,
          listings_remaining: e.listings_remaining,
          listing_price_eur: "0.30",
        });
        return;
      }
      throw err;
    }
  } else if (!isBusinessAccount(viewer)) {
    try {
      await assertFreeListingQuota(viewer, parsed.data.category_id);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "FREE_QUOTA_EXCEEDED") {
        const e = err as Error & { used: number; limit: number };
        res.status(403).json({
          error: "FREE_QUOTA_EXCEEDED",
          message:
            (err as Error & { publicMessage?: string }).publicMessage ??
            "Ke arritur limitin falas për këtë kategori kryesore. Mbush portofolin (€0.30/shpallje) ose prit fillimin e muajit të ri.",
          used: e.used,
          limit: e.limit,
          show_packages: (e as Error & { show_packages?: boolean }).show_packages ?? true,
        });
        return;
      }
      throw err;
    }
  }

  const [catRow] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, parsed.data.category_id))
    .limit(1);

  const bodyExtra = req.body as { price_agreement?: boolean; lang?: string };
  const priceAgreement = !!bodyExtra.price_agreement;
  const moderation = await moderateListingContent(
    {
      title: parsed.data.title,
      description: parsed.data.description,
      price: listingPrice,
      price_agreement: priceAgreement,
      category_name: catRow?.name ?? null,
      categoryRootSlug: categoryMeta?.rootSlug ?? null,
      image_url: safeImageUrl,
      condition: parsed.data.condition,
    },
    parseUiLang(bodyExtra.lang),
  );

  if (!moderation.approved) {
    void logListingModerationRejection({
      title: parsed.data.title,
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

  const now = new Date();
  const [row] = await db
    .insert(listingsTable)
    .values({
      user_id: viewer.id,
      title: parsed.data.title,
      description: parsed.data.description,
      price: String(listingPrice),
      category_id: parsed.data.category_id,
      location: parsed.data.location,
      seller_name: parsed.data.seller_name,
      seller_phone: parsed.data.seller_phone,
      condition: parsed.data.condition,
      image_url: safeImageUrl ?? null,
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

  recordListingPostSuccessForUser(viewer);

  let walletAfterPost: ReturnType<typeof walletSummary> | null = null;
  if (willChargeWallet) {
    const debited = await debitWalletForListing(viewer.id, row.id);
    walletAfterPost = walletSummary(debited.balance_cents);
  }

  const cat = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, row.category_id))
    .limit(1);

  const [created] = await annotateListingsWithVipFlag([
    applyViewerContact(
      formatListing(row, cat[0]?.name ?? null, categoryMeta?.rootSlug ?? null),
      viewer,
    ),
  ]);
  res.status(201).json({
    ...created,
    wallet: walletAfterPost,
  });
});

// ─── GET /listings/top — all active paid TOP listings (homepage carousel) ─────
router.get("/listings/top", async (req, res) => {
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
  res.json(
    await annotateListingsWithVipFlag(
      rows.map((l) =>
        applyViewerContact(
          formatListing(l, catMap.get(l.category_id) ?? null, catRootSlugMap.get(l.category_id) ?? null),
          viewer,
        ),
      ),
    ),
  );
});

// ─── GET /listings/featured ───────────────────────────────────────────────────
router.get("/listings/featured", async (req, res) => {
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
  res.json(
    await annotateListingsWithVipFlag(
      rows.map((l) =>
        applyViewerContact(
          formatListing(l, catMap.get(l.category_id) ?? null, catRootSlugMap.get(l.category_id) ?? null),
          viewer,
        ),
      ),
    ),
  );
});

// ─── GET /listings/recent ─────────────────────────────────────────────────────
router.get("/listings/recent", async (req, res) => {
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
  res.json(
    await annotateListingsWithVipFlag(
      rows.map((l) =>
        applyViewerContact(
          formatListing(l, catMap.get(l.category_id) ?? null, catRootSlugMap.get(l.category_id) ?? null),
          viewer,
        ),
      ),
    ),
  );
});

// ─── GET /listings/stats ──────────────────────────────────────────────────────
router.get("/listings/stats", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRes, catRes, featuredRes, todayRes, locationRes] = await Promise.all([
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
  ]);

  res.json({
    total_listings: totalRes[0]?.total ?? 0,
    total_categories: catRes[0]?.total ?? 0,
    featured_count: featuredRes[0]?.total ?? 0,
    listings_today: todayRes[0]?.total ?? 0,
    top_locations: locationRes,
  });
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

  const q = await getCategoryPostingQuota(viewer, categoryId);

  const isBusiness = isBusinessAccount(viewer) && !isVipBusinessActive(viewer);

  res.json({
    root_category_id: q.rootId,
    used: q.monthly_posts_used,
    limit: q.monthly_posts_limit,
    base_limit: q.base_limit,
    extra_slots: q.extra_slots,
    remaining: q.monthly_remaining,
    active_used: q.active_used,
    active_limit: q.active_limit,
    active_remaining: q.active_remaining,
    monthly_posts_used: q.monthly_posts_used,
    monthly_posts_limit: q.monthly_posts_limit,
    monthly_remaining: q.monthly_remaining,
    listing_lifetime_days: q.listing_lifetime_days,
    allowed: q.allowed,
    account_type: viewer.account_type ?? "private",
    quota_scope: "parent_category",
    show_packages: !q.allowed,
    business: isBusiness
      ? {
          listing_price_eur: 0.3,
          needs_wallet_topup: !q.allowed,
        }
      : null,
  });
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

  if (userOwnsListing(viewer, listing)) {
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
    ? await annotateListingsWithVipFlag([listingOut])
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
  const result = await incrementListingView(id);
  if (!result.ok) {
    res.status(result.status).json({ error: result.status === 404 ? "Not found" : "Invalid id" });
    return;
  }
  res.json({ ok: true, views: result.views });
});

// ─── GET /listings/:id ────────────────────────────────────────────────────────
router.get("/listings/:id", async (req, res) => {
  const viewer = await getSessionUser(req);
  const parsed = GetListingParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, parsed.data.id));

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const isExpired = !!(row.expires_at && new Date(row.expires_at) < new Date());
  const isOwner = !!(viewer && userOwnsListing(viewer, row));

  if (isExpired && !isOwner) {
    await purgeExpiredListingById(parsed.data.id);
    res.status(404).json({ error: "Njoftimi ka skaduar" });
    return;
  }

  const catMeta = await resolveCategorySlugMeta(row.category_id);

  const formatted = formatListing(row, catMeta?.name ?? null, catMeta?.rootSlug ?? null);
  const payload = applyViewerContact(formatted, viewer) as ReturnType<typeof formatListing> & {
    can_repost: boolean;
  };
  payload.can_repost = isOwner && isExpired;
  const [out] = await annotateListingsWithVipFlag([payload]);
  res.json({ ...out, can_repost: payload.can_repost });
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

  if (!userOwnsListing(viewer, existing[0])) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updates: Partial<typeof listingsTable.$inferInsert> = {};
  const body = bodyParsed.data;
  const patchExtra = req.body as { price_agreement?: boolean; lang?: string };

  const nextTitle = body.title ?? existing[0].title;
  const nextDescription = body.description ?? existing[0].description;

  if (body.title != null || body.description != null) {
    await removeUserDuplicateListingsForPost(
      viewer,
      nextTitle,
      nextDescription,
      paramsParsed.data.id,
    );
  }

  if (body.title != null) updates.title = body.title;
  if (body.description != null) updates.description = body.description;
  if (body.price != null) updates.price = String(body.price);
  if (body.location != null) updates.location = body.location;
  if (body.condition != null) updates.condition = body.condition;
  if (body.image_url != null) {
    updates.image_url = sanitizeListingImageUrlField(body.image_url);
  }
  if (body.is_featured != null) updates.is_featured = body.is_featured;

  const nextPrice =
    body.price != null ? body.price : Number(existing[0].price);
  const contentChanged =
    body.title != null || body.description != null || body.price != null;

  if (contentChanged) {
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

  const catMeta = await resolveCategorySlugMeta(updated.category_id);

  const [patched] = await annotateListingsWithVipFlag([
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

  if (!userOwnsListing(viewer, existing[0])) {
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
