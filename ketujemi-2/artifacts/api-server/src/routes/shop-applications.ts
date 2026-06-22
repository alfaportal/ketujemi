import { Router } from "express";
import {
  db,
  pool,
  ensureShopDirectoryTaxonomy,
  shopApplicationsTable,
  shopDirectoryCategoriesTable,
  shopDirectorySubcategoriesTable,
  shopRatingsTable,
  shopsTable,
  listingsTable,
  usersTable,
  categoriesTable,
} from "@workspace/db";
import { eq, and, asc, desc, gt, gte, isNotNull, sql, inArray, or, isNull, count } from "drizzle-orm";
import { getSessionUser } from "../lib/session-user";
import { incrementShopView } from "../lib/shop-view.js";
import { clientIpFromRequest } from "../lib/request-ip.js";
import { activeShopSqlCondition, isShopPubliclyVisible } from "../lib/shop-visibility.js";
import { backfillShopListingsForShop, shopPublicListingsCondition, resolveShopOwnerUserIds } from "../lib/shop-listing-lookup.js";
import { sendShopApplicationEmail, sendShopRatingEmail } from "../lib/send-shop-application-email";
import { formatListingsBatch } from "../lib/format-listings-batch";
import { resolveDirectoryFieldsWithEnsure } from "../lib/shop-directory-patch";
import { validateAdminShopDirectorySlugs } from "../lib/admin-shop-directory.js";
import { ownerShopFieldPatch, parseLatitude, parseLongitude } from "../lib/shop-field-patch";
import { normalizeShopWhatsappStored } from "../lib/shop-whatsapp-url";
import { parseDeletionSurveyBody } from "../lib/deletion-feedback.js";
import { softDeleteShopWithFeedback } from "../lib/soft-delete-shop.js";
import { syncShopDirectoryFieldsFromApplications } from "../lib/shop-directory-sync.js";
import { SHOP_DIRECTORY_CATEGORIES } from "../../../../lib/shop-directory-taxonomy.js";
import { SHOP_DIRECTORY_CATEGORY_IMAGE_URLS } from "../../../../lib/shop-directory-category-images.js";
import { enforceProfileChangeToken } from "../lib/profile-change-verify.js";
import {
  getShopSocialProfilesForApi,
  scheduleShopSocialEnrich,
} from "../lib/shop-social-enrich.js";
import { parseUiLang } from "../lib/claude-client.js";
import {
  contentTranslationTarget,
  translateUserTexts,
} from "../lib/translate-user-content.js";

const router = Router();

const SHOP_DIRECTORY_SEED = SHOP_DIRECTORY_CATEGORIES.map((cat) => ({
  slug: cat.slug,
  emoji: cat.emoji,
  nameSq: cat.nameSq,
  imageUrl: SHOP_DIRECTORY_CATEGORY_IMAGE_URLS[cat.slug],
  subcategories: cat.subcategories,
}));

async function loadShopDirectoryTaxonomyResponse() {
  const categories = await db
    .select()
    .from(shopDirectoryCategoriesTable)
    .orderBy(asc(shopDirectoryCategoriesTable.sort_order), asc(shopDirectoryCategoriesTable.id));

  const subcategories = await db
    .select()
    .from(shopDirectorySubcategoriesTable)
    .orderBy(asc(shopDirectorySubcategoriesTable.id));

  const subsByCategory = new Map<number, typeof subcategories>();
  for (const sub of subcategories) {
    const list = subsByCategory.get(sub.category_id) ?? [];
    list.push(sub);
    subsByCategory.set(sub.category_id, list);
  }

  return {
    categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      slug: cat.slug,
      image_url: cat.image_url,
      sort_order: cat.sort_order,
      subcategories: (subsByCategory.get(cat.id) ?? []).map((sub) => ({
        id: sub.id,
        category_id: sub.category_id,
        name: sub.name,
        slug: sub.slug,
      })),
    })),
  };
}

function trimOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

function requiredString(v: unknown, field: string): string | null {
  const t = trimOrNull(v);
  if (!t) return `Fusha «${field}» është e detyrueshme.`;
  return null;
}

// ─── POST /shop-applications ──────────────────────────────────────────────────
router.post("/shop-applications", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required", message: "Duhet të jeni i kyçur." });
    return;
  }

  const body = req.body as Record<string, unknown>;

  const errors: string[] = [];
  const shopNameErr = requiredString(body.shop_name, "Emri i dyqanit");
  if (shopNameErr) errors.push(shopNameErr);
  const logoErr = requiredString(body.logo_url, "Logo");
  if (logoErr) errors.push(logoErr);
  const descErr = requiredString(body.description, "Përshkrimi");
  if (descErr) errors.push(descErr);
  const catErr = requiredString(body.category, "Kategoria");
  if (catErr) errors.push(catErr);
  const countryErr = requiredString(body.country, "Shteti");
  if (countryErr) errors.push(countryErr);
  const cityErr = requiredString(body.city, "Qyteti");
  if (cityErr) errors.push(cityErr);
  const regionErr = requiredString(body.region, "Rajoni/Lagja");
  if (regionErr) errors.push(regionErr);
  const addressErr = requiredString(body.address, "Adresa");
  if (addressErr) errors.push(addressErr);
  const contactErr = requiredString(body.contact_name, "Emri i kontaktit");
  if (contactErr) errors.push(contactErr);
  const phoneErr = requiredString(body.phone, "Telefoni");
  if (phoneErr) errors.push(phoneErr);
  const emailErr = requiredString(body.email, "Email");
  if (emailErr) errors.push(emailErr);
  const applicantEmail = trimOrNull(body.email)?.toLowerCase() ?? "";
  if (
    applicantEmail &&
    (applicantEmail.endsWith("@ketujemi.com") ||
      applicantEmail === "novelto22@gmail.com")
  ) {
    errors.push("Shkruani email-in tuaj personal — jo adresën e platformës KetuJemi.");
  }

  const facebook = trimOrNull(body.facebook);
  const instagram = trimOrNull(body.instagram);
  const tiktok = trimOrNull(body.tiktok);
  const whatsapp = normalizeShopWhatsappStored(body.whatsapp);
  const website = trimOrNull(body.website);
  if (!facebook && !instagram && !tiktok && !whatsapp && !website) {
    errors.push("Plotësoni të paktën një rrjet social.");
  }

  const directoryCategoryId = Number(body.directory_category_id);
  const directorySubcategoryId = Number(body.directory_subcategory_id);
  const categorySlug = trimOrNull(body.directory_category_slug);
  const subcategorySlug = trimOrNull(body.directory_subcategory_slug);
  const hasValidIds =
    Number.isFinite(directoryCategoryId) &&
    directoryCategoryId > 0 &&
    Number.isFinite(directorySubcategoryId) &&
    directorySubcategoryId > 0;
  const slugErr = validateAdminShopDirectorySlugs(categorySlug, subcategorySlug);
  if (slugErr && !hasValidIds) {
    errors.push("Zgjidhni kategorinë dhe nënkategorinë e dyqanit.");
  }

  if (errors.length) {
    res.status(400).json({ error: "VALIDATION", message: errors[0], details: errors });
    return;
  }

  const directoryFields = await resolveDirectoryFieldsWithEnsure(pool, SHOP_DIRECTORY_SEED, {
    directory_category_slug: categorySlug,
    directory_subcategory_slug: subcategorySlug,
    directory_category_id: hasValidIds ? directoryCategoryId : null,
    directory_subcategory_id: hasValidIds ? directorySubcategoryId : null,
    category: String(body.category).trim(),
    category_id: null,
  });

  if (!directoryFields.directory_category_slug || !directoryFields.directory_subcategory_slug) {
    res.status(400).json({
      error: "VALIDATION",
      message: "Zgjidhni kategorinë dhe nënkategorinë e dyqanit.",
    });
    return;
  }

  const [row] = await db
    .insert(shopApplicationsTable)
    .values({
      user_id: viewer.id,
      shop_name: String(body.shop_name).trim(),
      logo_url: String(body.logo_url).trim(),
      description: String(body.description).trim(),
      category: String(body.category).trim(),
      category_id: null,
      directory_category_slug: directoryFields.directory_category_slug,
      directory_subcategory_slug: directoryFields.directory_subcategory_slug,
      directory_category_id: directoryFields.directory_category_id,
      directory_subcategory_id: directoryFields.directory_subcategory_id,
      country: String(body.country).trim(),
      city: String(body.city).trim(),
      region: String(body.region).trim(),
      address: String(body.address).trim(),
      latitude: parseLatitude(body.latitude),
      longitude: parseLongitude(body.longitude),
      facebook,
      instagram,
      tiktok,
      whatsapp,
      website,
      contact_name: String(body.contact_name).trim(),
      phone: String(body.phone).trim(),
      email: String(body.email).trim(),
      status: "pending",
    })
    .returning();

  try {
    await sendShopApplicationEmail({
      applicationId: row.id,
      userId: viewer.id,
      shopName: row.shop_name,
      logoUrl: row.logo_url,
      description: row.description,
      category: row.category,
      country: row.country,
      city: row.city,
      region: row.region,
      address: row.address,
      facebook: row.facebook,
      instagram: row.instagram,
      tiktok: row.tiktok,
      whatsapp: row.whatsapp,
      website: row.website,
      contactName: row.contact_name,
      phone: row.phone,
      email: row.email,
    });
  } catch (err) {
    req.log?.error({ err, applicationId: row.id }, "shop application email failed");
  }

  res.status(201).json({ ok: true, id: row.id });
});

type RatingSummary = { average_rating: number | null; rating_count: number };

async function ratingSummariesForShops(shopIds: number[]): Promise<Record<number, RatingSummary>> {
  if (!shopIds.length) return {};
  const rows = await db
    .select({
      shop_id: shopRatingsTable.shop_id,
      average_rating: sql<number>`round(avg(${shopRatingsTable.rating})::numeric, 1)`,
      rating_count: sql<number>`count(*)::int`,
    })
    .from(shopRatingsTable)
    .where(inArray(shopRatingsTable.shop_id, shopIds))
    .groupBy(shopRatingsTable.shop_id);

  const out: Record<number, RatingSummary> = {};
  for (const row of rows) {
    out[row.shop_id] = {
      average_rating: Number(row.average_rating),
      rating_count: row.rating_count,
    };
  }
  return out;
}

function shopDirectoryRow(
  shop: typeof shopsTable.$inferSelect,
  ratings?: RatingSummary,
) {
  return {
    id: shop.id,
    shop_name: shop.shop_name,
    logo_url: shop.logo_url,
    description: shop.description,
    category: shop.category,
    category_id: shop.category_id,
    directory_category_slug: shop.directory_category_slug,
    directory_subcategory_slug: shop.directory_subcategory_slug,
    directory_category_id: shop.directory_category_id,
    directory_subcategory_id: shop.directory_subcategory_id,
    country: shop.country,
    city: shop.city,
    region: shop.region,
    address: shop.address,
    latitude: shop.latitude,
    longitude: shop.longitude,
    facebook: shop.facebook,
    instagram: shop.instagram,
    tiktok: shop.tiktok,
    whatsapp: shop.whatsapp,
    website: shop.website,
    average_rating: ratings?.average_rating ?? null,
    rating_count: ratings?.rating_count ?? 0,
    views: shop.views ?? 0,
  };
}

function parseShopId(raw: string): number | null {
  const id = Number(raw);
  if (!Number.isFinite(id) || id < 1) return null;
  return id;
}

// ─── GET /shops/directory/taxonomy ────────────────────────────────────────────
router.get("/shops/directory/taxonomy", async (_req, res) => {
  try {
    try {
      await ensureShopDirectoryTaxonomy(pool, SHOP_DIRECTORY_SEED);
    } catch (ensureErr) {
      (_req as any).log?.error?.({ err: ensureErr }, "ensureShopDirectoryTaxonomy on taxonomy GET");
    }

    try {
      const payload = await loadShopDirectoryTaxonomyResponse();
      if (payload.categories.length > 0) {
        res.json(payload);
        return;
      }
    } catch (loadErr) {
      (_req as any).log?.error?.({ err: loadErr }, "loadShopDirectoryTaxonomyResponse failed, retrying after ensure");
      await ensureShopDirectoryTaxonomy(pool, SHOP_DIRECTORY_SEED);
      const payload = await loadShopDirectoryTaxonomyResponse();
      if (payload.categories.length > 0) {
        res.json(payload);
        return;
      }
    }

    res.json({ categories: [] });
  } catch (err) {
    (_req as any).log?.error?.({ err }, "Failed shop directory taxonomy");
    res.status(500).json({ error: "Internal server error", categories: [] });
  }
});

function activeDirectoryShopCondition() {
  return and(
    eq(shopsTable.is_active, true),
    isNull(shopsTable.deleted_at),
    sql`(
      (${shopsTable.directory_category_slug} IS NOT NULL AND TRIM(${shopsTable.directory_category_slug}) <> '')
      OR ${shopsTable.directory_category_id} IS NOT NULL
    )`,
  );
}

// ─── GET /shops/directory/stats ───────────────────────────────────────────────
router.get("/shops/directory/stats", async (req, res) => {
  try {
    await syncShopDirectoryFieldsFromApplications();
  } catch (err) {
    (req as { log?: { warn: (o: unknown, m: string) => void } }).log?.warn?.(
      { err },
      "shop directory sync before stats failed",
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const base = activeDirectoryShopCondition();
  const [totalRes, todayRes] = await Promise.all([
    db.select({ total: count() }).from(shopsTable).where(base),
    db
      .select({ total: count() })
      .from(shopsTable)
      .where(and(base, gte(shopsTable.created_at, today))),
  ]);

  res.setHeader("Cache-Control", "no-store");
  res.json({
    total_shops: totalRes[0]?.total ?? 0,
    shops_today: todayRes[0]?.total ?? 0,
  });
});

// ─── GET /shops/directory ─────────────────────────────────────────────────────
router.get("/shops/directory", async (req, res) => {
  try {
    await syncShopDirectoryFieldsFromApplications();
  } catch (err) {
    (req as { log?: { warn: (o: unknown, m: string) => void } }).log?.warn?.(
      { err },
      "shop directory sync before list failed",
    );
  }

  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const subcategory = typeof req.query.subcategory === "string" ? req.query.subcategory.trim() : "";
  const categoryId = Number(req.query.category_id);
  const subcategoryId = Number(req.query.subcategory_id);
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const country = typeof req.query.country === "string" ? req.query.country.trim() : "";

  const conditions = [activeDirectoryShopCondition()];
  if (Number.isFinite(categoryId) && categoryId > 0) {
    conditions.push(eq(shopsTable.directory_category_id, categoryId));
  } else if (category) {
    conditions.push(eq(shopsTable.directory_category_slug, category));
  }
  if (Number.isFinite(subcategoryId) && subcategoryId > 0) {
    conditions.push(eq(shopsTable.directory_subcategory_id, subcategoryId));
  } else if (subcategory) {
    conditions.push(eq(shopsTable.directory_subcategory_slug, subcategory));
  }
  if (city) conditions.push(eq(shopsTable.city, city));
  if (country) conditions.push(eq(shopsTable.country, country));

  const rows = await db
    .select()
    .from(shopsTable)
    .where(and(...conditions))
    .orderBy(desc(shopsTable.created_at));

  const countRows = await db
    .select({
      slug: shopsTable.directory_category_slug,
      count: sql<number>`count(*)::int`,
    })
    .from(shopsTable)
    .where(activeDirectoryShopCondition())
    .groupBy(shopsTable.directory_category_slug);

  const categoryCounts: Record<string, number> = {};
  for (const c of SHOP_DIRECTORY_CATEGORIES) categoryCounts[c.slug] = 0;
  for (const row of countRows) {
    if (row.slug) categoryCounts[row.slug] = row.count;
  }

  const ratingMap = await ratingSummariesForShops(rows.map((r) => r.id));

  res.setHeader("Cache-Control", "no-store");

  res.json({
    shops: rows.map((row) => shopDirectoryRow(row, ratingMap[row.id])),
    categoryCounts,
    total: rows.length,
  });
});

// ─── GET /shops/me ────────────────────────────────────────────────────────────
router.get("/shops/me", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required", message: "Duhet të jeni i kyçur." });
    return;
  }

  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, viewer.id), eq(shopsTable.is_active, true)))
    .limit(1);

  const [application] = await db
    .select({
      id: shopApplicationsTable.id,
      status: shopApplicationsTable.status,
      rejected_reason: shopApplicationsTable.rejected_reason,
      shop_name: shopApplicationsTable.shop_name,
      logo_url: shopApplicationsTable.logo_url,
    })
    .from(shopApplicationsTable)
    .where(eq(shopApplicationsTable.user_id, viewer.id))
    .orderBy(desc(shopApplicationsTable.created_at))
    .limit(1);

  let listing_count = 0;
  let total_views = 0;
  if (shop) {
    const ownerUserIds = await resolveShopOwnerUserIds({
      user_id: shop.user_id,
      email: shop.email,
    });
    await backfillShopListingsForShop({
      id: shop.id,
      user_id: shop.user_id,
      phone: shop.phone,
      email: shop.email,
    }).catch(() => undefined);
    const [stats] = await db
      .select({
        listing_count: sql<number>`count(*)::int`,
        total_views: sql<number>`coalesce(sum(${listingsTable.views}), 0)::int`,
      })
      .from(listingsTable)
      .where(
        shopPublicListingsCondition({
          id: shop.id,
          user_id: shop.user_id,
          phone: shop.phone,
          ownerUserIds,
        }),
      );
    listing_count = stats?.listing_count ?? 0;
    total_views = stats?.total_views ?? 0;
  }

  res.json({
    shop: shop
      ? {
          id: shop.id,
          shop_name: shop.shop_name,
          logo_url: shop.logo_url,
          description: shop.description,
          category: shop.category,
          category_id: shop.category_id,
          country: shop.country,
          city: shop.city,
          region: shop.region,
          address: shop.address,
          latitude: shop.latitude,
          longitude: shop.longitude,
          facebook: shop.facebook,
          instagram: shop.instagram,
          tiktok: shop.tiktok,
          whatsapp: shop.whatsapp,
          website: shop.website,
          contact_name: shop.contact_name,
          phone: shop.phone,
          email: shop.email,
        }
      : null,
    application: application ?? null,
    listing_count,
    total_views,
  });
});

// ─── GET /shops/me/listings ───────────────────────────────────────────────────
router.get("/shops/me/listings", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required", message: "Duhet të jeni i kyçur." });
    return;
  }

  const [shop] = await db
    .select({
      id: shopsTable.id,
      user_id: shopsTable.user_id,
      phone: shopsTable.phone,
      email: shopsTable.email,
    })
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, viewer.id), activeShopSqlCondition()))
    .limit(1);
  if (!shop) {
    res.status(404).json({ error: "Not found", message: "Nuk keni dyqan të aprovuar." });
    return;
  }

  const ownerUserIds = await resolveShopOwnerUserIds(shop);
  await backfillShopListingsForShop(shop).catch(() => undefined);

  const rows = await db
    .select()
    .from(listingsTable)
    .where(
      shopPublicListingsCondition({
        ...shop,
        ownerUserIds,
      }),
    )
    .orderBy(desc(listingsTable.listed_at))
    .limit(200);

  const listings = await formatListingsBatch(rows, viewer);
  res.json({ listings });
});

// ─── PATCH /shops/:id ─────────────────────────────────────────────────────────
router.patch("/shops/:id", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required", message: "Duhet të jeni i kyçur." });
    return;
  }

  const id = parseShopId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, id)).limit(1);
  if (!shop) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (shop.user_id !== viewer.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (!shop.is_active) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const gate = await enforceProfileChangeToken(viewer, body);
  if (!gate.ok) {
    res.status(gate.status).json(gate.body);
    return;
  }

  const patch = ownerShopFieldPatch(body);
  const directory = await resolveDirectoryFields(body, shop);
  Object.assign(patch, directory);

  if (!Object.keys(patch).length) {
    res.status(400).json({ error: "VALIDATION", message: "Nuk ka fusha për përditësim." });
    return;
  }

  const [updated] = await db.update(shopsTable).set(patch).where(eq(shopsTable.id, id)).returning();

  if (shop.application_id) {
    await db.update(shopApplicationsTable).set(patch).where(eq(shopApplicationsTable.id, shop.application_id));
  }

  scheduleShopSocialEnrich(id);

  const social_profiles = await getShopSocialProfilesForApi(id);
  res.json({ ok: true, shop: updated, social_profiles });
});

router.delete("/shops/:id", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required", message: "Duhet të jeni i kyçur." });
    return;
  }

  const id = parseShopId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [shop] = await db
    .select({
      id: shopsTable.id,
      user_id: shopsTable.user_id,
      deleted_at: shopsTable.deleted_at,
      is_active: shopsTable.is_active,
    })
    .from(shopsTable)
    .where(eq(shopsTable.id, id))
    .limit(1);
  if (!shop || shop.deleted_at || !shop.is_active) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (shop.user_id !== viewer.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const survey = parseDeletionSurveyBody(body);
  if (!survey.ok) {
    res.status(400).json({ error: "VALIDATION", message: survey.message });
    return;
  }

  const gate = await enforceProfileChangeToken(viewer, body);
  if (!gate.ok) {
    res.status(gate.status).json(gate.body);
    return;
  }

  const notifyEmail = viewer.email?.trim() || null;
  const ok = await softDeleteShopWithFeedback(id, viewer.id, survey.data, notifyEmail);
  if (!ok) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ok: true });
});

// ─── GET /shops/:id/ratings ─────────────────────────────────────────────────
router.get("/shops/:id/ratings", async (req, res) => {
  const id = parseShopId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [shop] = await db.select({ id: shopsTable.id }).from(shopsTable).where(eq(shopsTable.id, id)).limit(1);
  if (!shop) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const viewer = await getSessionUser(req);
  const reviewRows = await db
    .select({
      id: shopRatingsTable.id,
      rating: shopRatingsTable.rating,
      comment: shopRatingsTable.comment,
      created_at: shopRatingsTable.created_at,
      user_id: shopRatingsTable.user_id,
      display_name: usersTable.display_name,
      business_name: usersTable.business_name,
    })
    .from(shopRatingsTable)
    .innerJoin(usersTable, eq(shopRatingsTable.user_id, usersTable.id))
    .where(eq(shopRatingsTable.shop_id, id))
    .orderBy(desc(shopRatingsTable.created_at));

  const [summary] = await db
    .select({
      average_rating: sql<number>`round(avg(${shopRatingsTable.rating})::numeric, 1)`,
      rating_count: sql<number>`count(*)::int`,
    })
    .from(shopRatingsTable)
    .where(eq(shopRatingsTable.shop_id, id));

  let userRating: { rating: number; comment: string | null } | null = null;
  if (viewer) {
    const [mine] = await db
      .select({
        rating: shopRatingsTable.rating,
        comment: shopRatingsTable.comment,
      })
      .from(shopRatingsTable)
      .where(and(eq(shopRatingsTable.shop_id, id), eq(shopRatingsTable.user_id, viewer.id)))
      .limit(1);
    if (mine) userRating = { rating: mine.rating, comment: mine.comment };
  }

  const lang = parseUiLang(req.query.lang);
  let reviews = reviewRows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at.toISOString(),
    author_name: r.business_name?.trim() || r.display_name?.trim() || null,
    is_mine: viewer?.id === r.user_id,
  }));

  if (contentTranslationTarget(lang)) {
    const translatedComments = await translateUserTexts(
      reviews.map((r) => r.comment),
      lang,
    );
    reviews = reviews.map((r, i) => ({
      ...r,
      comment: r.comment ? translatedComments[i] : null,
    }));
  }

  res.json({
    average_rating: summary?.rating_count ? Number(summary.average_rating) : null,
    rating_count: summary?.rating_count ?? 0,
    user_rating: userRating,
    reviews,
  });
});

// ─── POST /shops/:id/ratings ────────────────────────────────────────────────
router.post("/shops/:id/ratings", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required", message: "Duhet të jeni i kyçur." });
    return;
  }

  const id = parseShopId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [shop] = await db
    .select({
      id: shopsTable.id,
      is_active: shopsTable.is_active,
      user_id: shopsTable.user_id,
      shop_name: shopsTable.shop_name,
      email: shopsTable.email,
    })
    .from(shopsTable)
    .where(eq(shopsTable.id, id))
    .limit(1);
  if (!shop?.is_active) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (shop.user_id === viewer.id) {
    res.status(400).json({ error: "VALIDATION", message: "Nuk mund të vlerësoni dyqanin tuaj." });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ error: "VALIDATION", message: "Vlerësimi duhet të jetë 1–5." });
    return;
  }
  const comment = trimOrNull(body.comment);

  const [existing] = await db
    .select({ id: shopRatingsTable.id })
    .from(shopRatingsTable)
    .where(and(eq(shopRatingsTable.shop_id, id), eq(shopRatingsTable.user_id, viewer.id)))
    .limit(1);

  if (existing) {
    await db
      .update(shopRatingsTable)
      .set({ rating, comment })
      .where(eq(shopRatingsTable.id, existing.id));
  } else {
    await db.insert(shopRatingsTable).values({
      shop_id: id,
      user_id: viewer.id,
      rating,
      comment,
    });
  }

  const [summary] = await db
    .select({
      average_rating: sql<number>`round(avg(${shopRatingsTable.rating})::numeric, 1)`,
      rating_count: sql<number>`count(*)::int`,
    })
    .from(shopRatingsTable)
    .where(eq(shopRatingsTable.shop_id, id));

  try {
    await sendShopRatingEmail(shop.email, shop.shop_name, shop.id, rating, comment);
  } catch (err) {
    req.log?.error({ err, shopId: shop.id }, "shop rating email failed");
  }

  res.json({
    ok: true,
    average_rating: summary?.rating_count ? Number(summary.average_rating) : null,
    rating_count: summary?.rating_count ?? 0,
    user_rating: { rating, comment },
  });
});

// ─── POST /shops/:id/view ─────────────────────────────────────────────────────
router.post("/shops/:id/view", async (req, res) => {
  const id = parseShopId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const viewer = await getSessionUser(req);
  const result = await incrementShopView(id, {
    viewer,
    clientIp: clientIpFromRequest(req),
  });
  if (!result.ok) {
    res.status(result.status).json({ error: result.status === 404 ? "Not found" : "Invalid id" });
    return;
  }
  res.json({ ok: true, views: result.views, counted: result.counted });
});

// ─── GET /shops/:id ───────────────────────────────────────────────────────────
router.get("/shops/:id", async (req, res) => {
  const id = parseShopId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, id)).limit(1);
  if (!shop || !isShopPubliclyVisible(shop)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const viewer = await getSessionUser(req);

  const ownerUserIds = await resolveShopOwnerUserIds({
    user_id: shop.user_id,
    email: shop.email,
  });

  await backfillShopListingsForShop({
    id: shop.id,
    user_id: shop.user_id,
    phone: shop.phone,
    email: shop.email,
  }).catch(() => undefined);

  const listingRows = await db
    .select()
    .from(listingsTable)
    .where(
      shopPublicListingsCondition({
        id: shop.id,
        user_id: shop.user_id,
        phone: shop.phone,
        ownerUserIds,
      }),
    )
    .orderBy(desc(listingsTable.listed_at))
    .limit(200);

  const listings = await formatListingsBatch(listingRows, viewer);

  const categoryIds = [...new Set(listingRows.map((l) => l.category_id))];
  const categoryRows =
    categoryIds.length > 0
      ? await db
          .select({ id: categoriesTable.id, name: categoriesTable.name })
          .from(categoriesTable)
          .where(inArray(categoriesTable.id, categoryIds))
      : [];

  const subcategories = categoryRows.map((cat) => ({
    id: cat.id,
    name: cat.name,
    count: listingRows.filter((l) => l.category_id === cat.id).length,
  }));

  const ratingMap = await ratingSummariesForShops([shop.id]);
  const ratings = ratingMap[shop.id];
  const social_profiles = await getShopSocialProfilesForApi(shop.id);

  const lang = parseUiLang(req.query.lang);
  let description = shop.description;
  let address = shop.address;
  let translatedListings = listings;

  if (contentTranslationTarget(lang)) {
    const texts = [shop.description, shop.address, ...listings.map((l) => l.title)];
    const translated = await translateUserTexts(texts, lang);
    description = translated[0] ?? shop.description;
    address = translated[1] ?? shop.address;
    translatedListings = listings.map((listing, i) => ({
      ...listing,
      title: translated[i + 2] ?? listing.title,
    }));
  }

  res.json({
    shop: {
      id: shop.id,
      shop_name: shop.shop_name,
      logo_url: shop.logo_url,
      description,
      category: shop.category,
      category_id: shop.category_id,
      directory_category_slug: shop.directory_category_slug,
      directory_subcategory_slug: shop.directory_subcategory_slug,
      directory_category_id: shop.directory_category_id,
      directory_subcategory_id: shop.directory_subcategory_id,
      country: shop.country,
      city: shop.city,
      region: shop.region,
      address,
      latitude: shop.latitude,
      longitude: shop.longitude,
      facebook: shop.facebook,
      instagram: shop.instagram,
      tiktok: shop.tiktok,
      whatsapp: shop.whatsapp,
      website: shop.website,
      contact_name: shop.contact_name,
      phone: shop.phone,
      email: shop.email,
      average_rating: ratings?.average_rating ?? null,
      rating_count: ratings?.rating_count ?? 0,
      views: shop.views ?? 0,
    },
    listings: translatedListings,
    active_count: translatedListings.length,
    subcategories,
    is_owner: viewer ? viewer.id === shop.user_id : false,
    social_profiles,
  });
});

export default router;
