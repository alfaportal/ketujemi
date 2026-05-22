import { Router } from "express";
import { db } from "@workspace/db";
import {
  listingsTable,
  categoriesTable,
  listingReportsTable,
  adminSettingsTable,
  usersTable,
} from "@workspace/db";
import { eq, desc, sql, count, gte, and } from "drizzle-orm";
import { isVipBusinessActive } from "../lib/business-rules";
import { getBusinessStatus } from "../lib/business-partner";
import { CreateListingBody } from "@workspace/api-zod";
import {
  verifyAdminPassword,
  verifyAdminBearer,
  getAdminBearerToken,
  adminAuthConfigured,
} from "../lib/admin-auth";
import { deleteListingCascade } from "../lib/delete-listing-cascade";
import {
  getModerationState,
  updateModerationSettings,
  runModerationCommand,
} from "../lib/admin-moderation";
import { loadBannedPhoneSet, saveBannedPhoneSet } from "../lib/user-ban";

const router = Router();

function expiresAt30Days(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

function requireAdmin(req: { headers: { authorization?: string } }, res: any, next: () => void) {
  if (verifyAdminBearer(req.headers.authorization)) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// ─── POST /admin/login (owner password only) ─────────────────────────────────
router.post("/admin/login", (req, res) => {
  if (!adminAuthConfigured()) {
    res.status(503).json({ error: "Admin panel not configured on server" });
    return;
  }
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!verifyAdminPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = getAdminBearerToken();
  if (!token) {
    res.status(503).json({ error: "Admin panel not configured on server" });
    return;
  }
  res.json({ token });
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
    const removed = await deleteListingCascade(id);
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

// ─── GET /admin/businesses — partner program accounts ─────────────────────────
router.get("/admin/businesses", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.account_type, "business"))
      .orderBy(desc(usersTable.created_at));

    res.json(
      rows.map((u) => ({
        id: u.id,
        email: u.email,
        phone_e164_digits: u.phone_e164_digits,
        business_name: u.business_name,
        business_tier: u.business_tier,
        business_status: getBusinessStatus(u),
        partner_link_url: u.partner_link_url,
        partner_link_type: u.partner_link_type,
        partner_logo_url: u.partner_logo_url,
        banned_at: u.banned_at ? u.banned_at.toISOString() : null,
        vip_expires_at: u.vip_expires_at ? u.vip_expires_at.toISOString() : null,
        is_vip_active: isVipBusinessActive(u),
        created_at: u.created_at.toISOString(),
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

    const patch: Partial<typeof usersTable.$inferInsert> = {
      business_status: "active",
      banned_at: null,
      ban_reason: null,
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

    res.json({
      id: updated!.id,
      business_status: getBusinessStatus(updated!),
      vip_expires_at: updated!.vip_expires_at?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Admin activate business error");
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

export default router;
