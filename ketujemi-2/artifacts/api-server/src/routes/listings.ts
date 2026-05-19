import { Router } from "express";
import { db } from "@workspace/db";
import { listingsTable, categoriesTable } from "@workspace/db";
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
import { userOwnsListing } from "../lib/listing-ownership";
import { sellerFirstName, maskEmailInListingDescription } from "../lib/contact-mask";
import { assertAccountActive } from "../lib/user-ban";
import {
  assertFreeListingQuota,
  countUserActiveListingsInCategoryRoot,
} from "../lib/category-quota";
import { isBusinessAccount } from "../lib/business-rules";
import { assertBusinessListingCreate } from "../lib/business-listing-guard";
import type { User } from "@workspace/db";

const router = Router();

function withSellerContactForViewer<
  T extends { seller_phone: string; seller_name: string; description: string },
>(listing: T, viewer: User | null): T {
  const description = viewer
    ? listing.description
    : maskEmailInListingDescription(listing.description);

  return {
    ...listing,
    seller_name: sellerFirstName(listing.seller_name),
    seller_phone: viewer ? listing.seller_phone : "",
    description,
  };
}

function applyViewerContact<
  T extends { seller_phone: string; seller_name: string; description: string },
>(listing: T, viewer: User | null): T {
  return withSellerContactForViewer(listing, viewer);
}

// ─── Helper: 30 ditë nga tani ─────────────────────────────────────────────────
function expiresAt30Days(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

// ─── Helper: format listing with all fields ───────────────────────────────────
function formatListing(l: typeof listingsTable.$inferSelect, categoryName: string | null) {
  const now = new Date();
  const expires = l.expires_at ? new Date(l.expires_at) : null;
  const daysLeft = expires
    ? Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    ...l,
    price: Number(l.price),
    category_name: categoryName,
    created_at: l.created_at.toISOString(),
    expires_at: l.expires_at ? l.expires_at.toISOString() : null,
    days_left: daysLeft,
    is_expired: expires ? expires < now : false,
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
  return gt(listingsTable.expires_at, new Date());
}

// ─── GET /listings ────────────────────────────────────────────────────────────
router.get("/listings", async (req, res) => {
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
  if (min_price != null) conditions.push(gte(listingsTable.price, String(min_price)));
  if (max_price != null) conditions.push(lte(listingsTable.price, String(max_price)));
  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
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
      .orderBy(desc(listingsTable.created_at))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  const listings = rows.map((l) =>
    applyViewerContact(formatListing(l, catMap.get(l.category_id) ?? null), viewer),
  );
  res.json({ listings, total: totalResult[0]?.total ?? 0, page, limit });
});

// ─── POST /listings ───────────────────────────────────────────────────────────
router.post("/listings", async (req, res) => {
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

  try {
    await assertAccountActive(viewer, parsed.data.seller_phone);
  } catch {
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  const paidExtraPost =
    req.body && typeof req.body === "object" && "paid_extra_post" in req.body
      ? Boolean((req.body as { paid_extra_post?: boolean }).paid_extra_post)
      : false;

  try {
    await assertBusinessListingCreate(
      viewer,
      {
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price,
        image_url: parsed.data.image_url,
      },
      { paidExtraPost },
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "BUSINESS_QUOTA_EXCEEDED") {
        const e = err as Error & { quota?: unknown };
        res.status(402).json({
          error: "BUSINESS_QUOTA_EXCEEDED",
          message:
            "Keni arritur 1 postim falas për këtë muaj. Paguani €1 për postim shtesë ose aktivizoni VIP Biznes (€20/muaj).",
          quota: e.quota,
        });
        return;
      }
      if (err.message === "BUSINESS_DUPLICATE_LISTING") {
        res.status(409).json({
          error: "BUSINESS_DUPLICATE_LISTING",
          message: "Ky produkt është postuar tashmë. Përditësoni shpalljen ekzistuese.",
        });
        return;
      }
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

  if (!isBusinessAccount(viewer)) {
    try {
      await assertFreeListingQuota(viewer, parsed.data.category_id);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "FREE_QUOTA_EXCEEDED") {
        const e = err as Error & { used: number; limit: number };
        res.status(403).json({
          error: "FREE_QUOTA_EXCEEDED",
          used: e.used,
          limit: e.limit,
        });
        return;
      }
      throw err;
    }
  }

  const [row] = await db
    .insert(listingsTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description,
      price: String(parsed.data.price),
      category_id: parsed.data.category_id,
      location: parsed.data.location,
      seller_name: sellerFirstName(parsed.data.seller_name),
      seller_phone: parsed.data.seller_phone,
      condition: parsed.data.condition,
      image_url: parsed.data.image_url ?? null,
      is_featured: parsed.data.is_featured ?? false,
      expires_at: expiresAt30Days(),
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

  const cat = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, row.category_id))
    .limit(1);

  res.status(201).json(applyViewerContact(formatListing(row, cat[0]?.name ?? null), viewer));
});

// ─── GET /listings/featured ───────────────────────────────────────────────────
router.get("/listings/featured", async (req, res) => {
  const viewer = await getSessionUser(req);
  const rows = await db
    .select()
    .from(listingsTable)
    .where(and(eq(listingsTable.is_featured, true), activeCondition()))
    .orderBy(desc(listingsTable.created_at))
    .limit(8);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  res.json(
    rows.map((l) => applyViewerContact(formatListing(l, catMap.get(l.category_id) ?? null), viewer)),
  );
});

// ─── GET /listings/recent ─────────────────────────────────────────────────────
router.get("/listings/recent", async (req, res) => {
  const viewer = await getSessionUser(req);
  const rows = await db
    .select()
    .from(listingsTable)
    .where(activeCondition())
    .orderBy(desc(listingsTable.created_at))
    .limit(12);

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  res.json(
    rows.map((l) => applyViewerContact(formatListing(l, catMap.get(l.category_id) ?? null), viewer)),
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

  const { rootId, used, limit } = await countUserActiveListingsInCategoryRoot(
    viewer,
    categoryId,
  );
  res.json({
    root_category_id: rootId,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    allowed: used < limit,
  });
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

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    res.status(404).json({ error: "Njoftimi ka skaduar" });
    return;
  }

  await db.update(listingsTable).set({ views: row.views + 1 }).where(eq(listingsTable.id, row.id));

  const cat = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, row.category_id))
    .limit(1);

  const formatted = formatListing({ ...row, views: row.views + 1 }, cat[0]?.name ?? null);
  res.json(applyViewerContact(formatted, viewer));
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
  if (body.title != null) updates.title = body.title;
  if (body.description != null) updates.description = body.description;
  if (body.price != null) updates.price = String(body.price);
  if (body.location != null) updates.location = body.location;
  if (body.condition != null) updates.condition = body.condition;
  if (body.image_url != null) updates.image_url = body.image_url;
  if (body.is_featured != null) updates.is_featured = body.is_featured;

  const [updated] = await db
    .update(listingsTable)
    .set(updates)
    .where(eq(listingsTable.id, paramsParsed.data.id))
    .returning();

  const cat = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, updated.category_id))
    .limit(1);

  res.json(applyViewerContact(formatListing(updated, cat[0]?.name ?? null), viewer));
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
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(listingsTable).where(eq(listingsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
