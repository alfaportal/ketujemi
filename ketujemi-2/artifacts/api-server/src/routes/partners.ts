import { Router } from "express";
import { db, categoriesTable, listingsTable } from "@workspace/db";
import { getTrustedPartnersShuffled } from "../lib/trusted-partners";
import {
  buildPublicBusinessProfile,
  getActiveListingsForBusinessUser,
  getBusinessUserById,
} from "../lib/business-profile";
import { eq, inArray } from "drizzle-orm";
import { sellerFirstName, maskEmailInListingDescription } from "../lib/contact-mask";
import { isTopActive } from "../lib/listing-top";
import { annotateListingsWithVipFlag } from "../lib/vip-seller-lookup";
import {
  getPartnerLogoStatsForUser,
  recordPartnerLogoClick,
  recordPartnerLogoViews,
} from "../lib/partner-logo-analytics";
import { getSessionUser } from "../lib/session-user";
import { isBusinessAccount, isVipBusinessActive } from "../lib/business-rules";
import {
  clientIpFromRequest,
  validatePartnerApplication,
} from "../lib/partner-application";
import { sendPartnerApplicationEmail } from "../lib/send-partner-application-email";
import {
  primaryListingImageUrl,
  sanitizeListingImageUrlField,
} from "../lib/listing-images.js";
import { requestPurgeExpiredListings } from "../lib/expire-listings-job";
import { getPartnerPublicProfile } from "../lib/partner-public-profile";

const router = Router();

router.get("/partners/profile/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id === 0) {
    res.status(400).json({ error: "Invalid partner id" });
    return;
  }
  const profile = await getPartnerPublicProfile(id);
  if (!profile) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ profile });
});

router.post("/partners/apply", async (req, res) => {
  try {
    const validated = validatePartnerApplication(req.body);
    if (!validated.ok) {
      res.status(400).json({ error: validated.message });
      return;
    }

    const clientIp = clientIpFromRequest(req);
    await sendPartnerApplicationEmail(validated.data, clientIp);

    res.json({
      ok: true,
      message: "Kërkesa juaj u dërgua me sukses! Do t'ju kontaktojmë së shpejti.",
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    req.log?.error({ err }, "partner application");

    if (errMsg.includes("not configured")) {
      res.status(503).json({
        error: "EMAIL_NOT_CONFIGURED",
        message: "Formulari nuk mund të dërgojë email — provoni më vonë.",
      });
      return;
    }
    res.status(500).json({ error: "Dërgimi i kërkesës dështoi. Provoni përsëri." });
  }
});

function formatListingPublic(
  l: typeof listingsTable.$inferSelect,
  categoryName: string | null,
  viewerRegistered: boolean,
) {
  const now = new Date();
  const expires = l.expires_at ? new Date(l.expires_at) : null;
  const daysLeft = expires
    ? Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const image_url = sanitizeListingImageUrlField(l.image_url);

  return {
    id: l.id,
    title: l.title,
    description: viewerRegistered ? l.description : maskEmailInListingDescription(l.description),
    price: Number(l.price),
    category_id: l.category_id,
    category_name: categoryName,
    location: l.location,
    seller_name: viewerRegistered ? l.seller_name : sellerFirstName(l.seller_name),
    seller_phone: viewerRegistered ? l.seller_phone : "",
    condition: l.condition,
    image_url,
    primary_image_url: primaryListingImageUrl(image_url),
    created_at: l.created_at.toISOString(),
    expires_at: l.expires_at ? l.expires_at.toISOString() : null,
    days_left: daysLeft,
    is_expired: false,
    is_top: isTopActive(l),
    listed_at: l.listed_at ? l.listed_at.toISOString() : l.created_at.toISOString(),
  };
}

/** VIP or standard partners for home, hubs, or category pages — shuffled each request. */
router.get("/partners/trusted", async (req, res) => {
  const rawLimit = Number(req.query.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 12;
  const rawCategoryId = Number(req.query.category_id);
  const categoryId =
    Number.isFinite(rawCategoryId) && rawCategoryId > 0 ? rawCategoryId : undefined;
  const tierRaw = String(req.query.tier ?? "vip").toLowerCase();
  const tier = tierRaw === "standard" ? "standard" : "vip";
  const partners = await getTrustedPartnersShuffled(limit, categoryId, tier);
  res.json({ partners, count: partners.length, category_id: categoryId ?? null, tier });
});

router.get("/businesses/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const user = await getBusinessUserById(id);
  if (!user) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const profile = await buildPublicBusinessProfile(user);
  res.json(profile);
});

router.get("/businesses/:id/listings", async (req, res) => {
  requestPurgeExpiredListings();
  const viewer = await getSessionUser(req);
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const user = await getBusinessUserById(id);
  if (!user) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const rows = await getActiveListingsForBusinessUser(user);
  const catIds = [...new Set(rows.map((r) => r.category_id))];
  const catRows =
    catIds.length > 0
      ? await db
          .select({ id: categoriesTable.id, name: categoriesTable.name })
          .from(categoriesTable)
          .where(inArray(categoriesTable.id, catIds))
      : [];
  const catMap = new Map(catRows.map((c) => [c.id, c.name]));

  const listings = await annotateListingsWithVipFlag(
    rows.map((l) => formatListingPublic(l, catMap.get(l.category_id) ?? null, !!viewer)),
  );
  res.json({ listings, total: listings.length });
});

router.post("/partners/analytics/impressions", async (req, res) => {
  const raw = req.body?.partner_ids;
  const ids = Array.isArray(raw)
    ? raw.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0)
    : [];
  if (ids.length === 0) {
    res.json({ ok: true, recorded: 0 });
    return;
  }
  await recordPartnerLogoViews(ids.slice(0, 24));
  res.json({ ok: true, recorded: ids.length });
});

router.post("/partners/analytics/click", async (req, res) => {
  const partnerId = Number(req.body?.partner_id);
  if (!Number.isFinite(partnerId) || partnerId < 1) {
    res.status(400).json({ error: "partner_id required" });
    return;
  }
  await recordPartnerLogoClick(partnerId);
  res.json({ ok: true });
});

router.get("/business/partner-analytics", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (!isBusinessAccount(user)) {
    res.status(403).json({ error: "Business account required" });
    return;
  }

  const stats = await getPartnerLogoStatsForUser(user.id);
  res.json({
    ...stats,
    is_vip_active: isVipBusinessActive(user),
  });
});

export default router;
