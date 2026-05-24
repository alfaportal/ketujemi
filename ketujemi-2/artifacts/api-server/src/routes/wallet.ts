import { Router } from "express";
import { getSessionUser } from "../lib/session-user";
import {
  WALLET_TOPUP_CATALOG,
  walletSummary,
  getWalletBalanceCents,
  type WalletTopupId,
} from "../lib/wallet";
import { createWalletTopupStripeCheckout } from "../lib/wallet-stripe";
import { createWalletTopupKosovoBankPayment } from "../lib/wallet-kosovo-bank";
import { paymentsConfigured } from "../lib/payments";
import { resolveWalletTopupChannel } from "../lib/payment-policy";

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

/** POST /wallet/topup-checkout — Stripe (now) or Kosovo bank (when enabled) */
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

  const channel = resolveWalletTopupChannel(user);
  const origin = appOrigin(req);

  try {
    if (channel === "kosovo_bank") {
      const checkout = await createWalletTopupKosovoBankPayment(user, pkg, origin);
      res.json(checkout);
      return;
    }

    const checkout = await createWalletTopupStripeCheckout(user, pkg, origin);
    res.json({ ...checkout, provider: "stripe" as const });
  } catch (err) {
    if (err instanceof Error && err.message === "PAYMENTS_NOT_CONFIGURED") {
      res.status(503).json({
        error: "PAYMENTS_NOT_CONFIGURED",
        message: "Pagesa me kartë nuk është konfiguruar ende.",
      });
      return;
    }
    if (err instanceof Error && err.message === "KOSOVO_BANK_NOT_CONFIGURED") {
      res.status(503).json({
        error: "KOSOVO_BANK_NOT_CONFIGURED",
        message: "Pagesa përmes bankës së Kosovës nuk është aktivizuar ende.",
      });
      return;
    }
    req.log.error({ err }, "wallet topup checkout error");
    res.status(500).json({ error: "Checkout failed", message: "Gabim gjatë hapjes së pagesës." });
  }
});

export default router;
