import { Router } from "express";
import { db, categoriesTable, listingsTable, partnersTable } from "@workspace/db";
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
  packageLabelFromTier,
  validatePartnerRegistration,
} from "../lib/partner-registration";
import {
  sendPartnerRegistrationAdminNotify,
  sendPartnerRegistrationConfirmation,
} from "../lib/send-partner-registration-email";
import { ensurePartnerUserAccount } from "../lib/partner-activate";
import { createPartnerStripeCheckout } from "../lib/partner-stripe";
import { paymentsConfigured, devPaymentBypassEnabled } from "../lib/payments";
import { requestPurgeExpiredListings } from "../lib/expire-listings-job";

function appOrigin(req: { get: (name: string) => string | undefined }): string {
  const fromEnv = process.env.PUBLIC_APP_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const proto = req.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "https://ketujemi.com";
}

const router = Router();

router.post("/partners/register", async (req, res) => {
  try {
    const validated = validatePartnerRegistration(req.body);
    if (!validated.ok) {
      res.status(400).json({ error: validated.message });
      return;
    }

    const { data } = validated;
    const clientIp = clientIpFromRequest(req);

    const [row] = await db
      .insert(partnersTable)
      .values({
        business_name: data.business_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        iban: data.iban,
        package: data.package,
        logo_url: data.logo_url,
        link_url: data.link_url,
        link_type: data.link_type,
        status: "pending",
        accepted_terms: true,
        client_ip: clientIp,
      })
      .returning({ id: partnersTable.id });

    const packageLabel = packageLabelFromTier(data.package);
    const emailPayload = {
      businessName: data.business_name,
      contactName: data.contact_name,
      email: data.email,
      phone: data.phone,
      iban: data.iban,
      packageLabel,
      logoUrl: data.logo_url,
      linkUrl: data.link_url,
    };

    const partnerId = row?.id ?? 0;
    const [partner] = await db
      .select()
      .from(partnersTable)
      .where(eq(partnersTable.id, partnerId))
      .limit(1);

    if (!partner) {
      res.status(500).json({ error: "Regjistrimi dështoi." });
      return;
    }

    const userId = await ensurePartnerUserAccount(partner);

    let checkoutUrl: string | null = null;
    if (paymentsConfigured() || devPaymentBypassEnabled()) {
      try {
        const checkout = await createPartnerStripeCheckout(
          partner,
          appOrigin(req),
          userId,
        );
        checkoutUrl = checkout.url;
      } catch (checkoutErr) {
        req.log?.error({ err: checkoutErr, partnerId }, "partner checkout creation failed");
      }
    }

    await Promise.all([
      sendPartnerRegistrationConfirmation({
        ...emailPayload,
      }),
      sendPartnerRegistrationAdminNotify({
        ...emailPayload,
        applicationId: partnerId,
        clientIp,
      }),
    ]);

    res.json({
      ok: true,
      partner_id: partnerId,
      checkout_url: checkoutUrl,
      message: checkoutUrl
        ? "Kërkesa u regjistrua! Përfundoni pagesën për aktivizim automatik."
        : "Kërkesa juaj u dërgua! Pagesa me kartë do të aktivizohet së shpejti.",
    });
  } catch (err) {
    req.log?.error({ err }, "partner registration");
    res.status(500).json({ error: "Regjistrimi dështoi. Provoni përsëri." });
  }
});

router.post("/partners/:id/checkout", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id < 1) {
      res.status(400).json({ error: "Invalid partner id" });
      return;
    }
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
    if (!partner) {
      res.status(404).json({ error: "Partner not found" });
      return;
    }
    if (partner.status === "rejected") {
      res.status(400).json({ error: "Aplikimi u refuzua." });
      return;
    }
    if (partner.payment_status === "paid" && partner.status === "active") {
      res.status(400).json({ error: "Partneri është tashmë aktiv." });
      return;
    }
    const userId = await ensurePartnerUserAccount(partner);
    if (!paymentsConfigured() && !devPaymentBypassEnabled()) {
      res.status(503).json({ error: "Pagesa me kartë nuk është e disponueshme." });
      return;
    }
    const checkout = await createPartnerStripeCheckout(partner, appOrigin(req), userId);
    res.json({ checkout_url: checkout.url, token: checkout.token });
  } catch (err) {
    req.log?.error({ err }, "partner checkout resume");
    res.status(500).json({ error: "Gabim gjatë hapjes së pagesës." });
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
    image_url: l.image_url,
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
    res.status(400).json({ error: "partner_ids required" });
    return;
  }
  await recordPartnerLogoViews(ids.slice(0, 24));
  res.json({ ok: true });
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
