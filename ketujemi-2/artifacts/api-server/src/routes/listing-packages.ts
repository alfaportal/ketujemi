import { Router } from "express";
import { getSessionUser } from "../lib/session-user";
import {
  LISTING_PACKAGE_CATALOG,
  parseListingPackageId,
  redeemListingPackageCode,
  getUserListingCapacity,
} from "../lib/listing-packages";
import { createListingPackageStripeCheckout } from "../lib/listing-package-stripe";

const router = Router();

function appOrigin(req: { get: (name: string) => string | undefined }): string {
  const fromEnv = process.env.PUBLIC_APP_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const proto = req.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "https://ketujemi.com";
}

router.get("/listing-packages/catalog", (_req, res) => {
  res.json({
    packages: Object.values(LISTING_PACKAGE_CATALOG).map((p) => ({
      id: p.id,
      name: p.name,
      price_eur: p.price_eur,
      listings_approx: p.listings_approx,
      listing_price_eur: 0.3,
      credit_until_spent: true,
    })),
    free_per_parent_category: 10,
    quota_scope: "parent_category",
  });
});

router.get("/listing-packages/status", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const capacity = await getUserListingCapacity(user);
  res.json({
    ...capacity,
    packages_available: true,
    catalog: Object.values(LISTING_PACKAGE_CATALOG).map((p) => ({
      id: p.id,
      name: p.name,
      price_eur: p.price_eur,
      listings_approx: p.listings_approx,
      listing_price_eur: 0.3,
      credit_until_spent: true,
    })),
  });
});

router.post("/listing-packages/checkout", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required", message: "Hyni në llogari për të blerë paketë." });
    return;
  }
  const pkg = parseListingPackageId(String(req.body?.package ?? ""));
  if (!pkg) {
    res.status(400).json({ error: "Invalid package" });
    return;
  }

  try {
    const checkout = await createListingPackageStripeCheckout(user, pkg, appOrigin(req));
    res.json({
      url: checkout.url,
      token: checkout.token,
      activation_code: checkout.activationCode,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "PAYMENTS_NOT_CONFIGURED") {
      res.status(503).json({ error: "PAYMENTS_NOT_CONFIGURED" });
      return;
    }
    req.log?.error({ err }, "listing package checkout");
    res.status(500).json({ error: "Checkout failed" });
  }
});

router.post("/listing-packages/redeem", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
  if (!code) {
    res.status(400).json({ error: "code required" });
    return;
  }

  const result = await redeemListingPackageCode(user.id, code);
  if (!result.ok) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});

export default router;
