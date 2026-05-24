import { Router } from "express";
import { getSessionUser } from "../lib/session-user";
import {
  WALLET_TOPUP_CATALOG,
  walletSummary,
  getWalletBalanceCents,
  type WalletTopupId,
} from "../lib/wallet";
import { createWalletTopupStripeCheckout } from "../lib/wallet-stripe";
import { paymentsConfigured } from "../lib/payments";

const router = Router();

function appOrigin(req: import("express").Request): string {
  const fromEnv = process.env.PUBLIC_APP_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const proto = req.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:5173";
}

/** GET /wallet — balance and top-up catalog */
router.get("/wallet", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  const balance = await getWalletBalanceCents(user.id);
  res.json({
    ...walletSummary(balance),
    stripe: paymentsConfigured(),
    topups: Object.entries(WALLET_TOPUP_CATALOG).map(([id, p]) => ({
      id,
      price_eur: p.price_eur,
      listings: p.listings,
      label: p.label,
    })),
  });
});

/** POST /wallet/topup-checkout — Stripe Checkout for €5 / €10 / €20 */
router.post("/wallet/topup-checkout", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not logged in", message: "Hyni në llogari për të mbushur portofolin." });
    return;
  }

  const pkg = String(req.body?.package ?? "").trim() as WalletTopupId;
  if (!(pkg in WALLET_TOPUP_CATALOG)) {
    res.status(400).json({
      error: "INVALID_PACKAGE",
      message: "Zgjidhni €5, €10 ose €20.",
    });
    return;
  }

  try {
    const checkout = await createWalletTopupStripeCheckout(user, pkg, appOrigin(req));
    res.json(checkout);
  } catch (err) {
    if (err instanceof Error && err.message === "PAYMENTS_NOT_CONFIGURED") {
      res.status(503).json({
        error: "PAYMENTS_NOT_CONFIGURED",
        message: "Pagesa me kartë nuk është konfiguruar ende.",
      });
      return;
    }
    req.log.error({ err }, "wallet topup checkout error");
    res.status(500).json({ error: "Checkout failed", message: "Gabim gjatë hapjes së pagesës." });
  }
});

export default router;
