import { Router } from "express";
import { db } from "@workspace/db";
import {
  listingsTable,
  categoriesTable,
  listingReportsTable,
  adminSettingsTable,
  usersTable,
  partnersTable,
  listingPackagePurchasesTable,
  shopApplicationsTable,
  shopDirectoryCategoriesTable,
  shopDirectorySubcategoriesTable,
  shopsTable,
} from "@workspace/db";
import { eq, desc, sql, count, gte, and, inArray } from "drizzle-orm";
import { isVipBusinessActive } from "../lib/business-rules";
import {
  generatePartnerActivationCode,
  getBusinessStatus,
  partnerPackageLabel,
} from "../lib/business-partner";
import { loadPaymentSummariesByUserIds } from "../lib/admin-partner-payments";
import {
  countByStatus,
  listAdminPartnerApplications,
} from "../lib/admin-partner-applications";
import { syncPartnerStatusToUser } from "../lib/partner-activate";
import {
  getMonthlyPackageRevenueCents,
  LISTING_PACKAGE_CATALOG,
} from "../lib/listing-packages";
import { sendPartnerActivationEmail } from "../lib/send-email";
import { CreateListingBody } from "@workspace/api-zod";
import {
  verifyAdminPassword,
  verifyAdminBearer,
  createAdminSession,
  adminAuthConfigured,
} from "../lib/admin-auth";
import { adminLoginLimiter } from "../lib/express-rate-limiters";
import { notifyAdminLoginFailed } from "../lib/admin-login-alert.js";
import { deleteListingCascade } from "../lib/delete-listing-cascade";
import {
  getModerationState,
  updateModerationSettings,
  runModerationCommand,
} from "../lib/admin-moderation";
import { generateAdminAiDailyReport } from "../lib/admin-ai-daily-report";
import { loadBannedPhoneSet, saveBannedPhoneSet } from "../lib/user-ban";
import { primaryListingImageUrl, sanitizeListingImageUrlField } from "../lib/listing-images";
import { purgeInvalidListingImages } from "../lib/purge-invalid-listing-images.js";
import { deleteShopCascade } from "../lib/delete-shop-cascade";
import { resolveDirectoryFields } from "../lib/shop-directory-patch";
import { buildApplicationFieldPatch, buildShopFieldPatch } from "../lib/shop-field-patch";
import {
  buildAdminSocialPostPreview,
  executeAdminSocialPost,
  listAdminSocialPostListings,
} from "../lib/admin-social-post.js";

const router = Router();

function expiresAt3Months(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d;
}

function requireAdmin(req: { headers: { authorization?: string } }, res: any, next: () => void) {
  if (verifyAdminBearer(req.headers.authorization)) return next();
  res.status(403).json({ error: "Forbidden" });
}

// ─── POST /admin/login (owner password only) ─────────────────────────────────
router.post("/admin/login", adminLoginLimiter, (req, res) => {
  if (!adminAuthConfigured()) {
    res.status(503).json({ error: "Admin panel not configured on server" });
    return;
  }
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!verifyAdminPassword(password)) {
    notifyAdminLoginFailed(req);
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const rememberMe = req.body?.remember_me === true;
  const session = createAdminSession(rememberMe);
  if (!session) {
    res.status(503).json({ error: "Admin panel not configured on server" });
    return;
  }
  res.json(session);
});

// ─── GET /admin/dashboard ─────────────────────────────────────────────────────
router.get("/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const [totalListings] = await db.select({ count: count() }).from(listingsTable);
    const [totalCategories] = await db.select({ count: count() }).from(categoriesTable);
    const [totalReports] = await db.select({ count: count() }).from(listingReportsTable);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [newToday] = await db
      .select({ count: count() })
      .from(listingsTable)
      .where(gte(listingsTable.created_at, today));

    const perCategory = await db
      .select({
        category_id: listingsTable.category_id,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(listingsTable)
      .groupBy(listingsTable.category_id)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const cats = await db.select().from(categoriesTable);
    const catMap = new Map(cats.map((c) => [c.id, c.name]));

    const perCategoryNamed = perCategory.map((r) => ({
      category_id: r.category_id,
      category_name: catMap.get(r.category_id) ?? "Unknown",
      count: r.count,
    }));

    const [registeredUsers] = await db.select({ count: count() }).from(usersTable);
    const uniqueSellers = await db
      .selectDistinct({ seller_phone: listingsTable.seller_phone })
      .from(listingsTable);

    const recentListings = await db
      .select()
      .from(listingsTable)
      .orderBy(desc(listingsTable.created_at))
      .limit(5);

    res.json({
      total_listings: totalListings.count,
      total_users: registeredUsers.count,
      total_sellers: uniqueSellers.length,
      total_categories: totalCategories.count,
      total_reports: totalReports.count,
      new_today: newToday.count,
      per_category: perCategoryNamed,
      recent_listings: recentListings.map((l) => ({
        ...l,
        price: Number(l.price),
        created_at: l.created_at.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin dashboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/listings/image-audit ───────────────────────────────────────────
router.get("/admin/listings/image-audit", requireAdmin, async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: listingsTable.id,
        title: listingsTable.title,
        image_url: listingsTable.image_url,
        status: listingsTable.status,
      })
      .from(listingsTable);

    let missing = 0;
    let invalidOnly = 0;
    let ok = 0;
    const samples: { id: number; title: string; issue: string }[] = [];

    for (const row of rows) {
      const raw = row.image_url?.trim() ?? "";
      const primary = primaryListingImageUrl(row.image_url);
      if (!raw) {
        missing += 1;
        if (samples.length < 30) {
          samples.push({ id: row.id, title: row.title, issue: "no_image_url" });
        }
      } else if (!primary) {
        invalidOnly += 1;
        if (samples.length < 30) {
          samples.push({
            id: row.id,
            title: row.title,
            issue: "invalid_or_stock_url",
          });
        }
      } else {
        ok += 1;
        const cleaned = sanitizeListingImageUrlField(row.image_url);
        if (cleaned !== row.image_url && samples.length < 30) {
          samples.push({
            id: row.id,
            title: row.title,
            issue: "needs_csv_cleanup",
          });
        }
      }
    }

    res.json({
      total: rows.length,
      with_valid_photo: ok,
      missing_photo: missing,
      invalid_or_stock_only: invalidOnly,
      samples,
    });
  } catch (err) {
    req.log.error({ err }, "Admin listing image audit error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/listings/purge-invalid-images ─────────────────────────────────
router.post("/admin/listings/purge-invalid-images", requireAdmin, async (req, res) => {
  try {
    const activeOnly = req.body?.active_only !== false;
    const result = await purgeInvalidListingImages({ activeOnly });
    res.json({
      ok: true,
      active_only: activeOnly,
      ...result,
      message:
        result.cleared > 0
          ? `U hoqën foto të pavlefshme/stock nga ${result.cleared} shpallje.`
          : "Nuk u gjetën foto stock në image_url.",
    });
  } catch (err) {
    req.log.error({ err }, "Admin purge listing images error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/listings ──────────────────────────────────────────────────────
router.get("/admin/listings", requireAdmin, async (req, res) => {
  try {
    const { search, category_id, page = "1", limit = "50" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const cats = await db.select().from(categoriesTable);
    const catMap = new Map(cats.map((c) => [c.id, c.name]));

    let rows = await db
      .select()
      .from(listingsTable)
      .orderBy(desc(listingsTable.created_at));

    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          r.seller_name.toLowerCase().includes(s) ||
          r.seller_phone.includes(s),
      );
    }
    if (category_id) {
      rows = rows.filter((r) => r.category_id === parseInt(category_id));
    }

    const total = rows.length;
    const paginated = rows.slice(offset, offset + limitNum);

    res.json({
      total,
      page: pageNum,
      listings: paginated.map((l) => ({
        ...l,
        price: Number(l.price),
        category_name: catMap.get(l.category_id) ?? null,
        created_at: l.created_at.toISOString(),
        expires_at: l.expires_at ? l.expires_at.toISOString() : null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin listings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /admin/listings/:id ────────────────────────────────────────────────
router.patch("/admin/listings/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, price, location, condition, is_featured, description } = req.body;
    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (price !== undefined) updates.price = String(price);
    if (location !== undefined) updates.location = location;
    if (condition !== undefined) updates.condition = condition;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (description !== undefined) updates.description = description;

    const [updated] = await db
      .update(listingsTable)
      .set(updates)
      .where(eq(listingsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json({ ...updated, price: Number(updated.price) });
  } catch (err) {
    req.log.error({ err }, "Admin update listing error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /admin/listings/:id ───────────────────────────────────────────────
router.delete("/admin/listings/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const removed = await deleteListingCascade(id, "admin");
    if (!removed) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete listing error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/listings ─────────────────────────────────────────────────────
router.post("/admin/listings", requireAdmin, async (req, res) => {
  try {
    const parsed = CreateListingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
      return;
    }
    const [row] = await db
      .insert(listingsTable)
      .values({
        title: parsed.data.title,
        description: parsed.data.description,
        price: String(parsed.data.price),
        category_id: parsed.data.category_id,
        location: parsed.data.location,
        seller_name: parsed.data.seller_name,
        seller_phone: parsed.data.seller_phone,
        condition: parsed.data.condition,
        image_url: parsed.data.image_url ?? null,
        is_featured: parsed.data.is_featured ?? false,
        expires_at: expiresAt3Months(),
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
    res.status(201).json({ ...row, price: Number(row.price), created_at: row.created_at.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Admin create listing error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/users ─────────────────────────────────────────────────────────
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await db
      .select({
        seller_phone: listingsTable.seller_phone,
        seller_name: listingsTable.seller_name,
        listing_count: sql<number>`cast(count(*) as int)`,
        last_active: sql<string>`max(${listingsTable.created_at})`,
      })
      .from(listingsTable)
      .groupBy(listingsTable.seller_phone, listingsTable.seller_name)
      .orderBy(desc(sql`count(*)`));

    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Admin users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/registered-users ──────────────────────────────────────────────
router.get("/admin/registered-users", requireAdmin, async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.created_at));
    const counts = await db
      .select({
        phone: listingsTable.seller_phone,
        listing_count: sql<number>`cast(count(*) as int)`,
      })
      .from(listingsTable)
      .groupBy(listingsTable.seller_phone);
    const countByPhone = new Map(counts.map((c) => [c.phone.replace(/\D/g, ""), c.listing_count]));

    res.json(
      users.map((u) => {
        const phone = u.phone_e164_digits ?? u.contact_phone?.replace(/\D/g, "") ?? "";
        return {
          id: u.id,
          email: u.email,
          phone_e164_digits: u.phone_e164_digits,
          display_name: u.display_name,
          contact_phone: u.contact_phone,
          banned_at: u.banned_at ? u.banned_at.toISOString() : null,
          ban_reason: u.ban_reason,
          created_at: u.created_at.toISOString(),
          listing_count: phone ? (countByPhone.get(phone) ?? 0) : 0,
        };
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Admin registered users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/registered-users/:id/ban ───────────────────────────────────
router.post("/admin/registered-users/:id/ban", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reason = typeof req.body?.reason === "string" ? req.body.reason.slice(0, 500) : null;
    const [updated] = await db
      .update(usersTable)
      .set({ banned_at: new Date(), ban_reason: reason })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: updated.id,
      banned_at: updated.banned_at?.toISOString() ?? null,
      ban_reason: updated.ban_reason,
    });
  } catch (err) {
    req.log.error({ err }, "Admin ban user error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/registered-users/:id/unban ───────────────────────────────────
router.post("/admin/registered-users/:id/unban", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(usersTable)
      .set({ banned_at: null, ban_reason: null })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: updated.id, banned_at: null });
  } catch (err) {
    req.log.error({ err }, "Admin unban user error");
    res.status(500).json({ error: "Internal server error" });
  }
});

function adminAppOrigin(req: { get: (name: string) => string | undefined }): string {
  const env = process.env["PUBLIC_APP_ORIGIN"]?.replace(/\/$/, "");
  if (env) return env;
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const proto = req.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:5173";
}

// ─── GET /admin/partner-applications — /partner registrations ─────────────────
router.get("/admin/partner-applications", requireAdmin, async (req, res) => {
  try {
    const applications = await listAdminPartnerApplications();
    res.json({
      applications,
      stats: countByStatus(applications),
    });
  } catch (err) {
    req.log.error({ err }, "Admin partner applications error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/partner-applications/:id/reject", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const reason =
      typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 500) : "";
    if (!reason) {
      res.status(400).json({ error: "reason required" });
      return;
    }
    const [updated] = await db
      .update(partnersTable)
      .set({
        status: "rejected",
        rejected_reason: reason,
        rejected_at: new Date(),
      })
      .where(eq(partnersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await syncPartnerStatusToUser(id, "rejected");
    res.json({ ok: true, id: updated.id, status: updated.status });
  } catch (err) {
    req.log.error({ err }, "Admin reject partner");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/partner-applications/:id/suspend", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db
      .update(partnersTable)
      .set({ status: "suspended", suspended_at: new Date() })
      .where(eq(partnersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await syncPartnerStatusToUser(id, "suspended");
    res.json({ ok: true, id: updated.id, status: updated.status });
  } catch (err) {
    req.log.error({ err }, "Admin suspend partner");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/partner-applications/:id/reactivate", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [row] = await db.select().from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const nextStatus = row.payment_status === "paid" ? "active" : "pending";
    const [updated] = await db
      .update(partnersTable)
      .set({
        status: nextStatus,
        suspended_at: null,
        rejected_at: null,
        rejected_reason: null,
      })
      .where(eq(partnersTable.id, id))
      .returning();
    await syncPartnerStatusToUser(id, nextStatus);
    res.json({ ok: true, id: updated!.id, status: updated!.status });
  } catch (err) {
    req.log.error({ err }, "Admin reactivate partner");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/partner-applications/:id/package", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pkg = String(req.body?.package ?? "").toLowerCase();
    if (pkg !== "standard" && pkg !== "vip") {
      res.status(400).json({ error: "package must be standard or vip" });
      return;
    }
    const [updated] = await db
      .update(partnersTable)
      .set({ package: pkg })
      .where(eq(partnersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (updated.user_id) {
      await db
        .update(usersTable)
        .set({ business_tier: pkg })
        .where(eq(usersTable.id, updated.user_id));
    }
    res.json({
      ok: true,
      id: updated.id,
      package: updated.package,
      package_label: partnerPackageLabel(pkg),
    });
  } catch (err) {
    req.log.error({ err }, "Admin change partner package");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/partner-applications/:id/categories", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { updatePartnerApplicationCategories } = await import("../lib/admin-partner-applications");
    const categoryIds = Array.isArray(req.body?.category_ids) ? req.body.category_ids : [];
    const result = await updatePartnerApplicationCategories(id, categoryIds);
    if (!result) {
      res.status(400).json({
        error: "NO_USER",
        message: "Partneri nuk ka llogari biznesi — kategoritë vendosen pas aktivizimit.",
      });
      return;
    }
    res.json({ ok: true, id, category_ids: result.category_ids });
  } catch (err) {
    req.log.error({ err }, "Admin partner categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Homepage trusted partners (curated logos) ───────────────────────────────
router.get("/admin/homepage-partners", requireAdmin, async (_req, res) => {
  try {
    const { listHomepagePartnersAdmin } = await import("../lib/homepage-partners");
    const partners = await listHomepagePartnersAdmin();
    res.json({ partners });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/homepage-partners", requireAdmin, async (req, res) => {
  try {
    const { createHomepagePartner } = await import("../lib/homepage-partners");
    const row = await createHomepagePartner({
      business_name: String(req.body?.business_name ?? ""),
      logo_url: String(req.body?.logo_url ?? ""),
      link_url: req.body?.link_url != null ? String(req.body.link_url) : undefined,
      tier: String(req.body?.tier ?? "standard"),
      sort_order: Number(req.body?.sort_order ?? 0),
      category_ids: Array.isArray(req.body?.category_ids) ? req.body.category_ids : [],
      address: req.body?.address != null ? String(req.body.address) : undefined,
      facebook_url: req.body?.facebook_url != null ? String(req.body.facebook_url) : undefined,
      instagram_url: req.body?.instagram_url != null ? String(req.body.instagram_url) : undefined,
      whatsapp_number:
        req.body?.whatsapp_number != null ? String(req.body.whatsapp_number) : undefined,
      tiktok_url: req.body?.tiktok_url != null ? String(req.body.tiktok_url) : undefined,
      website_url: req.body?.website_url != null ? String(req.body.website_url) : undefined,
    });
    res.status(201).json({ partner: row });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "MISSING_FIELDS") {
        res.status(400).json({ error: "MISSING_FIELDS", message: "Plotësoni emrin dhe logon." });
        return;
      }
      if (err.message === "INVALID_TIER") {
        res.status(400).json({ error: "INVALID_TIER" });
        return;
      }
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/homepage-partners/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { deleteHomepagePartner } = await import("../lib/homepage-partners");
    const ok = await deleteHomepagePartner(id);
    if (!ok) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/homepage-partners/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { updateHomepagePartner } = await import("../lib/homepage-partners");
    const body = req.body ?? {};
    const partner = await updateHomepagePartner(id, {
      ...(body.business_name !== undefined
        ? { business_name: String(body.business_name) }
        : {}),
      ...(body.logo_url !== undefined ? { logo_url: String(body.logo_url) } : {}),
      ...(body.link_url !== undefined ? { link_url: String(body.link_url) } : {}),
      ...(body.address !== undefined ? { address: String(body.address) } : {}),
      ...(body.facebook_url !== undefined ? { facebook_url: String(body.facebook_url) } : {}),
      ...(body.instagram_url !== undefined ? { instagram_url: String(body.instagram_url) } : {}),
      ...(body.whatsapp_number !== undefined
        ? { whatsapp_number: String(body.whatsapp_number) }
        : {}),
      ...(body.tiktok_url !== undefined ? { tiktok_url: String(body.tiktok_url) } : {}),
      ...(body.website_url !== undefined ? { website_url: String(body.website_url) } : {}),
      ...(body.tier !== undefined ? { tier: String(body.tier) } : {}),
      ...(body.sort_order !== undefined ? { sort_order: Number(body.sort_order) } : {}),
      ...(body.is_active !== undefined ? { is_active: Boolean(body.is_active) } : {}),
      ...(body.category_ids !== undefined
        ? {
            category_ids: Array.isArray(body.category_ids) ? body.category_ids : [],
          }
        : {}),
    });
    if (!partner) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ partner });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_TIER") {
      res.status(400).json({ error: "INVALID_TIER" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/listing-package-purchases — Pagesat (listing packages) ────────
router.get("/admin/listing-package-purchases", requireAdmin, async (req, res) => {
  try {
    const packageFilter = String(req.query.package ?? "")
      .trim()
      .toLowerCase();
    const rows = await db
      .select({
        purchase: listingPackagePurchasesTable,
        user_email: usersTable.email,
        user_name: usersTable.display_name,
      })
      .from(listingPackagePurchasesTable)
      .leftJoin(usersTable, eq(usersTable.id, listingPackagePurchasesTable.user_id))
      .orderBy(desc(listingPackagePurchasesTable.created_at))
      .limit(500);

    const purchases = rows
      .filter((r) => !packageFilter || r.purchase.package === packageFilter)
      .map((r) => {
        const pkg = r.purchase.package as keyof typeof LISTING_PACKAGE_CATALOG;
        const def =
          pkg in LISTING_PACKAGE_CATALOG
            ? LISTING_PACKAGE_CATALOG[pkg]
            : null;
        return {
          id: r.purchase.id,
          user_id: r.purchase.user_id,
          user_email: r.user_email,
          user_name: r.user_name,
          package: r.purchase.package,
          package_label: def?.name ?? r.purchase.package,
          amount_eur: r.purchase.amount_cents / 100,
          extra_slots: r.purchase.extra_slots,
          activation_code: r.purchase.activation_code,
          status: r.purchase.status,
          purchased_at: r.purchase.purchased_at?.toISOString() ?? null,
          expires_at: r.purchase.expires_at?.toISOString() ?? null,
          created_at: r.purchase.created_at.toISOString(),
        };
      });

    const revenueMonthCents = await getMonthlyPackageRevenueCents();
    res.json({
      purchases,
      revenue_month_eur: revenueMonthCents / 100,
      stats: {
        total: purchases.length,
        paid: purchases.filter((p) => p.status === "paid").length,
        by_package: {
          s: purchases.filter((p) => p.package === "s").length,
          m: purchases.filter((p) => p.package === "m").length,
          l: purchases.filter((p) => p.package === "l").length,
        },
      },
    });
  } catch (err) {
    req.log.error({ err }, "Admin listing package purchases");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/businesses — legacy business users (in-app upgrades) ─────────
router.get("/admin/businesses", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.account_type, "business"))
      .orderBy(desc(usersTable.created_at));

    const tierMap = new Map(rows.map((u) => [u.id, u.business_tier]));
    const payments = await loadPaymentSummariesByUserIds(
      rows.map((u) => u.id),
      tierMap,
    );

    res.json(
      rows.map((u) => ({
        id: u.id,
        email: u.email,
        phone_e164_digits: u.phone_e164_digits,
        business_name: u.business_name,
        business_tier: u.business_tier,
        package_label: partnerPackageLabel(u.business_tier),
        business_status: getBusinessStatus(u),
        partner_link_url: u.partner_link_url,
        partner_link_type: u.partner_link_type,
        partner_logo_url: u.partner_logo_url,
        partner_activation_code: u.partner_activation_code ?? null,
        partner_activation_sent_at: u.partner_activation_sent_at
          ? u.partner_activation_sent_at.toISOString()
          : null,
        banned_at: u.banned_at ? u.banned_at.toISOString() : null,
        vip_expires_at: u.vip_expires_at ? u.vip_expires_at.toISOString() : null,
        is_vip_active: isVipBusinessActive(u),
        created_at: u.created_at.toISOString(),
        payment: payments.get(u.id) ?? null,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Admin businesses error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/businesses/:id/activate ─────────────────────────────────────
router.post("/admin/businesses/:id/activate", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user || user.account_type !== "business") {
      res.status(404).json({ error: "Business account not found" });
      return;
    }
    if (!user.email?.trim()) {
      res.status(400).json({
        error: "NO_EMAIL",
        message: "Biznesi nuk ka email — shtoni email në llogari para aktivizimit.",
      });
      return;
    }

    const activationCode = generatePartnerActivationCode();
    const now = new Date();
    const patch: Partial<typeof usersTable.$inferInsert> = {
      business_status: "active",
      banned_at: null,
      ban_reason: null,
      partner_activation_code: activationCode,
      partner_activation_sent_at: now,
    };
    if (user.business_tier === "vip") {
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);
      patch.vip_expires_at = exp;
    }

    const [updated] = await db
      .update(usersTable)
      .set(patch)
      .where(eq(usersTable.id, id))
      .returning();

    let email_sent = false;
    let email_error: string | null = null;
    try {
      await sendPartnerActivationEmail({
        to: user.email!.trim(),
        businessName: user.business_name?.trim() || "Partner",
        activationCode,
        packageLabel: partnerPackageLabel(user.business_tier),
        profileUrl: `${adminAppOrigin(req)}/profile`,
      });
      email_sent = true;
    } catch (mailErr) {
      email_error = mailErr instanceof Error ? mailErr.message : "Email failed";
      req.log.error({ err: mailErr, userId: id }, "partner activation email");
    }

    res.json({
      id: updated!.id,
      business_status: getBusinessStatus(updated!),
      vip_expires_at: updated!.vip_expires_at?.toISOString() ?? null,
      partner_activation_code: activationCode,
      email_sent,
      email_error,
    });
  } catch (err) {
    req.log.error({ err }, "Admin activate business error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/businesses/:id/deactivate ───────────────────────────────────
router.post("/admin/businesses/:id/deactivate", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(usersTable)
      .set({ business_status: "pending" })
      .where(and(eq(usersTable.id, id), eq(usersTable.account_type, "business")))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Business account not found" });
      return;
    }
    res.json({ id: updated.id, business_status: "pending" });
  } catch (err) {
    req.log.error({ err }, "Admin deactivate business error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/businesses/:id/block ────────────────────────────────────────
router.post("/admin/businesses/:id/block", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reason = typeof req.body?.reason === "string" ? req.body.reason.slice(0, 500) : null;
    const [updated] = await db
      .update(usersTable)
      .set({ business_status: "blocked", ban_reason: reason })
      .where(and(eq(usersTable.id, id), eq(usersTable.account_type, "business")))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Business account not found" });
      return;
    }
    res.json({ id: updated.id, business_status: "blocked" });
  } catch (err) {
    req.log.error({ err }, "Admin block business error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /admin/registered-users/:id ─────────────────────────────────────
router.delete("/admin/registered-users/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete user error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/sellers/:phone/ban ─────────────────────────────────────────
router.post("/admin/sellers/:phone/ban", requireAdmin, async (req, res) => {
  try {
    const phone = decodeURIComponent(req.params.phone).replace(/\D/g, "");
    if (phone.length < 8) {
      res.status(400).json({ error: "Invalid phone" });
      return;
    }
    const set = await loadBannedPhoneSet();
    set.add(phone);
    await saveBannedPhoneSet(set);
    res.json({ success: true, phone });
  } catch (err) {
    req.log.error({ err }, "Admin ban seller phone error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/sellers/:phone/unban ─────────────────────────────────────────
router.post("/admin/sellers/:phone/unban", requireAdmin, async (req, res) => {
  try {
    const phone = decodeURIComponent(req.params.phone).replace(/\D/g, "");
    const set = await loadBannedPhoneSet();
    set.delete(phone);
    await saveBannedPhoneSet(set);
    res.json({ success: true, phone });
  } catch (err) {
    req.log.error({ err }, "Admin unban seller phone error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/users/:phone/listings ────────────────────────────────────────
router.get("/admin/users/:phone/listings", requireAdmin, async (req, res) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const listings = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.seller_phone, phone))
      .orderBy(desc(listingsTable.created_at));

    res.json(
      listings.map((l) => ({
        ...l,
        price: Number(l.price),
        created_at: l.created_at.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Admin user listings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/categories ────────────────────────────────────────────────────
router.get("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const cats = await db.select().from(categoriesTable);
    const counts = await db
      .select({
        category_id: listingsTable.category_id,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(listingsTable)
      .groupBy(listingsTable.category_id);
    const countMap = new Map(counts.map((c) => [c.category_id, c.count]));
    res.json(cats.map((c) => ({ ...c, listing_count: countMap.get(c.id) ?? 0 })));
  } catch (err) {
    req.log.error({ err }, "Admin categories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/categories ───────────────────────────────────────────────────
router.post("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const { name, slug, icon, parent_id, image_url } = req.body;
    const [created] = await db
      .insert(categoriesTable)
      .values({
        name,
        slug,
        icon: icon ?? "Tag",
        parent_id: parent_id ?? null,
        image_url: image_url ?? null,
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Admin create category error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /admin/categories/:id ─────────────────────────────────────────────
router.patch("/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, icon, image_url } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (icon !== undefined) updates.icon = icon;
    if (image_url !== undefined) updates.image_url = image_url;

    const [updated] = await db
      .update(categoriesTable)
      .set(updates)
      .where(eq(categoriesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Admin update category error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /admin/categories/:id ────────────────────────────────────────────
router.delete("/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete category error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/reports ───────────────────────────────────────────────────────
router.get("/admin/reports", requireAdmin, async (req, res) => {
  try {
    const reports = await db
      .select()
      .from(listingReportsTable)
      .orderBy(desc(listingReportsTable.created_at));

    const listings = await db.select({ id: listingsTable.id, title: listingsTable.title }).from(listingsTable);
    const listingMap = new Map(listings.map((l) => [l.id, l.title]));

    res.json(
      reports.map((r) => ({
        ...r,
        listing_title: listingMap.get(r.listing_id) ?? "Deleted",
        created_at: r.created_at.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Admin reports error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/reports ──────────────────────────────────────────────────────
router.post("/admin/reports", async (req, res) => {
  try {
    const { listing_id, reason, reporter_name } = req.body;
    const [created] = await db
      .insert(listingReportsTable)
      .values({
        listing_id: parseInt(listing_id),
        reason,
        reporter_name: reporter_name ?? "Anonymous",
        status: "pending",
      })
      .returning();
    res.status(201).json({ ...created, created_at: created.created_at.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Create report error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /admin/reports/:id ─────────────────────────────────────────────────
router.patch("/admin/reports/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const [updated] = await db
      .update(listingReportsTable)
      .set({ status })
      .where(eq(listingReportsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Report not found" });
      return;
    }
    res.json({ ...updated, created_at: updated.created_at.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Admin update report error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /admin/reports/:id ────────────────────────────────────────────────
router.delete("/admin/reports/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(listingReportsTable).where(eq(listingReportsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete report error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/settings ──────────────────────────────────────────────────────
router.get("/admin/settings", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(adminSettingsTable);
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value;

    const defaults: Record<string, string> = {
      site_name: "Marketplace",
      contact_email: "",
      maintenance_mode: "false",
    };
    res.json({ ...defaults, ...obj });
  } catch (err) {
    req.log.error({ err }, "Admin settings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /admin/settings ────────────────────────────────────────────────────
router.patch("/admin/settings", requireAdmin, async (req, res) => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await db
        .insert(adminSettingsTable)
        .values({ key, value })
        .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value } });
    }
    const rows = await db.select().from(adminSettingsTable);
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value;
    res.json(obj);
  } catch (err) {
    req.log.error({ err }, "Admin update settings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/ai-report ─────────────────────────────────────────────────────
router.get("/admin/ai-report", requireAdmin, async (req, res) => {
  try {
    const result = await generateAdminAiDailyReport();
    res.json({
      ...result,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Admin AI report error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /admin/moderation ────────────────────────────────────────────────────
router.get("/admin/moderation", requireAdmin, async (req, res) => {
  try {
    const state = await getModerationState();
    res.json(state);
  } catch (err) {
    req.log.error({ err }, "Admin moderation get error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /admin/moderation ──────────────────────────────────────────────────
router.patch("/admin/moderation", requireAdmin, async (req, res) => {
  try {
    const body = req.body as Record<string, string>;
    const state = await updateModerationSettings({
      enabled: body.enabled,
      system_prompt: body.system_prompt,
    });
    res.json(state);
  } catch (err) {
    req.log.error({ err }, "Admin moderation patch error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /admin/moderation/command ───────────────────────────────────────────
router.post("/admin/moderation/command", requireAdmin, async (req, res) => {
  try {
    const command = typeof req.body?.command === "string" ? req.body.command : "";
    const { reply } = await runModerationCommand(command);
    res.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Moderation failed";
    req.log.error({ err }, "Admin moderation command error");
    res.status(msg.includes("not configured") ? 503 : 400).json({ error: msg });
  }
});

// ─── Shop applications (Dyqanet) ────────────────────────────────────────────────
router.get("/admin/shop-applications", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(shopApplicationsTable)
    .orderBy(desc(shopApplicationsTable.created_at));

  const shopIds = rows.map((r) => r.shop_id).filter((id): id is number => typeof id === "number" && id > 0);
  const listingCountByShop = new Map<number, number>();
  const adminNotesByShop = new Map<number, string | null>();
  if (shopIds.length) {
    const countRows = await db
      .select({
        shop_id: listingsTable.shop_id,
        listing_count: sql<number>`count(*)::int`,
      })
      .from(listingsTable)
      .where(inArray(listingsTable.shop_id, shopIds))
      .groupBy(listingsTable.shop_id);
    for (const row of countRows) {
      if (row.shop_id) listingCountByShop.set(row.shop_id, row.listing_count);
    }

    const shopRows = await db
      .select({ id: shopsTable.id, admin_notes: shopsTable.admin_notes })
      .from(shopsTable)
      .where(inArray(shopsTable.id, shopIds));
    for (const row of shopRows) {
      adminNotesByShop.set(row.id, row.admin_notes);
    }
  }

  const stats = {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };
  res.json({
    applications: rows.map((row) => ({
      ...row,
      listing_count: row.shop_id ? (listingCountByShop.get(row.shop_id) ?? 0) : 0,
      admin_notes: row.shop_id
        ? (adminNotesByShop.get(row.shop_id) ?? row.admin_notes)
        : row.admin_notes,
    })),
    stats,
  });
});

router.post("/admin/shop-applications/:id/approve", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [app] = await db.select().from(shopApplicationsTable).where(eq(shopApplicationsTable.id, id)).limit(1);
  if (!app) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (app.status === "approved" && app.shop_id) {
    res.json({ ok: true, shop_id: app.shop_id });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const { resolveDirectoryCategorySlug, resolveDirectorySubcategorySlug } = await import(
    "../lib/shop-directory-resolve.js"
  );

  const bodyCategoryId = Number(body.directory_category_id);
  const bodySubcategoryId = Number(body.directory_subcategory_id);

  let directoryCategoryId: number | null =
    Number.isFinite(bodyCategoryId) && bodyCategoryId > 0 ? bodyCategoryId : app.directory_category_id;
  let directorySubcategoryId: number | null =
    Number.isFinite(bodySubcategoryId) && bodySubcategoryId > 0
      ? bodySubcategoryId
      : app.directory_subcategory_id;

  let directoryCategorySlug =
    typeof body.directory_category_slug === "string" ? body.directory_category_slug.trim() : null;
  let directorySubcategorySlug =
    typeof body.directory_subcategory_slug === "string" ? body.directory_subcategory_slug.trim() : null;

  if (directoryCategoryId) {
    const [catRow] = await db
      .select()
      .from(shopDirectoryCategoriesTable)
      .where(eq(shopDirectoryCategoriesTable.id, directoryCategoryId))
      .limit(1);
    if (catRow) directoryCategorySlug = catRow.slug;
  }

  if (!directoryCategorySlug) {
    directoryCategorySlug = resolveDirectoryCategorySlug({
      directory_category_slug: app.directory_category_slug,
      category_id: app.category_id,
      category: app.category,
    });
  }

  if (directorySubcategoryId) {
    const [subRow] = await db
      .select()
      .from(shopDirectorySubcategoriesTable)
      .where(eq(shopDirectorySubcategoriesTable.id, directorySubcategoryId))
      .limit(1);
    if (subRow) {
      directorySubcategorySlug = subRow.slug;
      if (!directoryCategoryId) {
        directoryCategoryId = subRow.category_id;
        const [catRow] = await db
          .select({ slug: shopDirectoryCategoriesTable.slug })
          .from(shopDirectoryCategoriesTable)
          .where(eq(shopDirectoryCategoriesTable.id, subRow.category_id))
          .limit(1);
        if (catRow) directoryCategorySlug = catRow.slug;
      }
    }
  }

  if (!directorySubcategorySlug) {
    directorySubcategorySlug = resolveDirectorySubcategorySlug(
      directoryCategorySlug,
      app.directory_subcategory_slug,
    );
  }

  if (!directoryCategoryId && directoryCategorySlug) {
    const [catRow] = await db
      .select({ id: shopDirectoryCategoriesTable.id })
      .from(shopDirectoryCategoriesTable)
      .where(eq(shopDirectoryCategoriesTable.slug, directoryCategorySlug))
      .limit(1);
    if (catRow) directoryCategoryId = catRow.id;
  }

  if (!directorySubcategoryId && directoryCategoryId && directorySubcategorySlug) {
    const [subRow] = await db
      .select({ id: shopDirectorySubcategoriesTable.id })
      .from(shopDirectorySubcategoriesTable)
      .where(
        and(
          eq(shopDirectorySubcategoriesTable.category_id, directoryCategoryId),
          eq(shopDirectorySubcategoriesTable.slug, directorySubcategorySlug),
        ),
      )
      .limit(1);
    if (subRow) directorySubcategoryId = subRow.id;
  }

  const [shop] = await db
    .insert(shopsTable)
    .values({
      user_id: app.user_id,
      application_id: app.id,
      shop_name: app.shop_name,
      logo_url: app.logo_url,
      description: app.description,
      category: app.category,
      category_id: app.category_id,
      directory_category_slug: directoryCategorySlug,
      directory_subcategory_slug: directorySubcategorySlug,
      directory_category_id: directoryCategoryId,
      directory_subcategory_id: directorySubcategoryId,
      country: app.country,
      city: app.city,
      region: app.region,
      address: app.address,
      facebook: app.facebook,
      instagram: app.instagram,
      tiktok: app.tiktok,
      whatsapp: app.whatsapp,
      website: app.website,
      contact_name: app.contact_name,
      phone: app.phone,
      email: app.email,
      is_active: true,
      admin_notes: app.admin_notes,
    })
    .returning();

  await db
    .update(shopApplicationsTable)
    .set({
      directory_category_slug: directoryCategorySlug,
      directory_subcategory_slug: directorySubcategorySlug,
      directory_category_id: directoryCategoryId,
      directory_subcategory_id: directorySubcategoryId,
    })
    .where(eq(shopApplicationsTable.id, id));

  await db
    .update(shopApplicationsTable)
    .set({ status: "approved", shop_id: shop.id, rejected_reason: null })
    .where(eq(shopApplicationsTable.id, id));

  await db
    .update(listingsTable)
    .set({ shop_id: shop.id })
    .where(and(eq(listingsTable.user_id, app.user_id), sql`${listingsTable.shop_id} IS NULL`));

  const { sendShopApprovedEmail } = await import("../lib/send-shop-application-email");
  try {
    await sendShopApprovedEmail(app.email, app.shop_name, shop.id);
  } catch (err) {
    req.log?.error({ err, shopId: shop.id }, "shop approved email failed");
  }

  res.json({ ok: true, shop_id: shop.id });
});

router.post("/admin/shop-applications/:id/reject", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  const [app] = await db.select().from(shopApplicationsTable).where(eq(shopApplicationsTable.id, id)).limit(1);
  if (!app) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db
    .update(shopApplicationsTable)
    .set({ status: "rejected", rejected_reason: reason || null, shop_id: null })
    .where(eq(shopApplicationsTable.id, id));

  const { sendShopRejectedEmail } = await import("../lib/send-shop-application-email");
  try {
    await sendShopRejectedEmail(app.email, app.shop_name, reason);
  } catch (err) {
    req.log?.error({ err, applicationId: id }, "shop rejected email failed");
  }

  res.json({ ok: true });
});

router.patch("/admin/shops/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, id)).limit(1);
  if (!shop) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const patch = buildShopFieldPatch(body);
  const directory = await resolveDirectoryFields(body, shop);
  Object.assign(patch, directory);

  const appPatch: Record<string, unknown> = { ...patch };
  if ("status" in body) {
    const status =
      typeof body.status === "string" && ["pending", "approved", "rejected"].includes(body.status.trim())
        ? body.status.trim()
        : null;
    if (status) {
      appPatch.status = status;
      if (status === "approved") patch.is_active = true;
      if (status === "rejected") patch.is_active = false;
    }
  }

  if (!Object.keys(patch).length && !("status" in appPatch)) {
    res.status(400).json({ error: "VALIDATION", message: "Nuk ka fusha për përditësim." });
    return;
  }

  const [updated] = await db.update(shopsTable).set(patch).where(eq(shopsTable.id, id)).returning();

  if (shop.application_id) {
    await db
      .update(shopApplicationsTable)
      .set(appPatch as Partial<typeof shopApplicationsTable.$inferInsert>)
      .where(eq(shopApplicationsTable.id, shop.application_id));
  } else {
    await db
      .update(shopApplicationsTable)
      .set(appPatch as Partial<typeof shopApplicationsTable.$inferInsert>)
      .where(eq(shopApplicationsTable.shop_id, id));
  }

  res.json({ ok: true, shop: updated });
});

router.patch("/admin/shop-applications/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [app] = await db.select().from(shopApplicationsTable).where(eq(shopApplicationsTable.id, id)).limit(1);
  if (!app) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const patch = buildApplicationFieldPatch(body);
  const directory = await resolveDirectoryFields(body, app);
  Object.assign(patch, directory);

  if (!Object.keys(patch).length) {
    res.status(400).json({ error: "VALIDATION", message: "Nuk ka fusha për përditësim." });
    return;
  }

  const [updatedApp] = await db
    .update(shopApplicationsTable)
    .set(patch)
    .where(eq(shopApplicationsTable.id, id))
    .returning();

  if (app.shop_id) {
    const shopPatch = buildShopFieldPatch(body);
    Object.assign(shopPatch, directory);
    if (patch.status === "approved") shopPatch.is_active = true;
    if (patch.status === "rejected") shopPatch.is_active = false;
    if (Object.keys(shopPatch).length) {
      await db.update(shopsTable).set(shopPatch).where(eq(shopsTable.id, app.shop_id));
    }
  }

  res.json({ ok: true, application: updatedApp });
});

router.delete("/admin/shops/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const ok = await deleteShopCascade(id, "admin");
  if (!ok) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ ok: true });
});

// ─── Facebook & Instagram social posting ───────────────────────────────────────
router.get("/admin/social-posts/listings", requireAdmin, async (req, res) => {
  try {
    const q = req.query as Record<string, string>;
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 50;
    const filter = q.filter as "all" | "pending_fb" | "pending_ig" | "posted" | undefined;
    const data = await listAdminSocialPostListings({
      search: q.search,
      filter: filter ?? "all",
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 50,
    });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "admin social-posts listings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/social-posts/preview", requireAdmin, async (req, res) => {
  try {
    const listingId = Number(req.body?.listing_id);
    if (!Number.isFinite(listingId) || listingId < 1) {
      res.status(400).json({ error: "Invalid listing_id" });
      return;
    }
    const preview = await buildAdminSocialPostPreview(listingId);
    if (!preview) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(preview);
  } catch (err) {
    req.log.error({ err }, "admin social-posts preview error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/social-posts/post", requireAdmin, async (req, res) => {
  try {
    const rawIds = req.body?.listing_ids ?? (req.body?.listing_id != null ? [req.body.listing_id] : []);
    const listingIds = (Array.isArray(rawIds) ? rawIds : [])
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isFinite(id) && id > 0);

    if (listingIds.length === 0) {
      res.status(400).json({ error: "No listing_ids" });
      return;
    }
    if (listingIds.length > 5) {
      res.status(400).json({ error: "Max 5 listings per request" });
      return;
    }

    const platforms = {
      facebook: req.body?.facebook !== false,
      instagram: req.body?.instagram !== false,
    };

    const results = [];
    for (const listingId of listingIds) {
      try {
        const result = await executeAdminSocialPost(listingId, platforms);
        results.push({ ...result, ok: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ listing_id: listingId, ok: false, error: message });
      }
    }

    res.json({ results });
  } catch (err) {
    req.log.error({ err }, "admin social-posts post error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
