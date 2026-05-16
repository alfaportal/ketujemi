import { Router } from "express";
import { db } from "@workspace/db";
import { listingsTable, categoriesTable, listingReportsTable, adminSettingsTable } from "@workspace/db";
import { eq, desc, sql, count, and, gte } from "drizzle-orm";

const router = Router();

const ADMIN_TOKEN = "vendi2024-admin-token";

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"];
  if (auth === `Bearer ${ADMIN_TOKEN}`) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// ─── POST /admin/login ────────────────────────────────────────────────────────
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body ?? {};
  if (username === "admin" && password === "vendi2024") {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
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

    const uniqueUsers = await db
      .selectDistinct({ seller_phone: listingsTable.seller_phone })
      .from(listingsTable);

    const recentListings = await db
      .select()
      .from(listingsTable)
      .orderBy(desc(listingsTable.created_at))
      .limit(5);

    res.json({
      total_listings: totalListings.count,
      total_users: uniqueUsers.length,
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
    await db.delete(listingsTable).where(eq(listingsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete listing error");
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
      site_name: "KetuJemi.com",
      contact_email: "info@ketujemi.com",
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

export default router;
