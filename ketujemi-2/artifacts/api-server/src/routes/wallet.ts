import { Router } from "express";
import { getSessionUser } from "../lib/session-user";
import {
  WALLET_TOPUP_CATALOG,
  walletSummary,
  getWalletBalanceCents,
  parseWalletTopupId,
} from "../lib/wallet";
import { createWalletTopupStripeCheckout } from "../lib/wallet-stripe";
import { createWalletTopupKosovoBankPayment } from "../lib/wallet-kosovo-bank";
import { paymentsConfigured } from "../lib/payments";
import {
  kosovoBankManualTransferReady,
  kosovoBankProviderLive,
  KOSOVO_BANK_DISPLAY,
} from "../lib/kosovo-bank-payments";
import {
  kosovoStripeEnabled,
  resolveWalletTopupChannel,
} from "../lib/payment-policy";
import { db, businessPaymentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

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

  const stripe = paymentsConfigured();
  const channel = resolveWalletTopupChannel(user);

  res.json({
    ...walletSummary(balance),
    stripe,
    paymentsAvailable:
      stripe || kosovoBankManualTransferReady() || kosovoBankProviderLive(),
    kosovoStripe: kosovoStripeEnabled() && stripe,
    kosovoBank: kosovoBankManualTransferReady() || kosovoBankProviderLive(),
    walletChannel: channel,
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

  const pkg = parseWalletTopupId(String(req.body?.package ?? ""));
  if (!pkg) {
    res.status(400).json({
      error: "INVALID_PACKAGE",
      message: "Zgjidhni Paketën S (€5), M (€10) ose L (€20).",
    });
    return;
  }

  const channel = resolveWalletTopupChannel(user);
  const origin = appOrigin(req);

  try {
    if (channel === "kosovo_bank") {
      try {
        const checkout = await createWalletTopupKosovoBankPayment(user, pkg, origin);
        res.json(checkout);
        return;
      } catch (bankErr) {
        if (!paymentsConfigured()) {
          throw bankErr;
        }
        req.log.warn(
          { err: bankErr },
          "Kosovo bank checkout failed — falling back to Stripe",
        );
      }
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

/** GET /wallet/bank-payment?token= — IBAN instructions for pending Kosovo bank transfer */
router.get("/wallet/bank-payment", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  const token = String(req.query.token ?? "").trim();
  if (!token) {
    res.status(400).json({ error: "MISSING_TOKEN" });
    return;
  }

  const [payment] = await db
    .select()
    .from(businessPaymentsTable)
    .where(
      and(
        eq(businessPaymentsTable.token, token),
        eq(businessPaymentsTable.user_id, user.id),
      ),
    )
    .limit(1);

  if (!payment) {
    res.status(404).json({ error: "PAYMENT_NOT_FOUND" });
    return;
  }

  if (!kosovoBankManualTransferReady() && !kosovoBankProviderLive()) {
    res.status(503).json({ error: "KOSOVO_BANK_NOT_CONFIGURED" });
    return;
  }

  res.json({
    token: payment.token,
    purpose: payment.purpose,
    amount_eur: (payment.amount_cents / 100).toFixed(2),
    status: payment.status,
    iban: KOSOVO_BANK_DISPLAY.iban,
    bankName: KOSOVO_BANK_DISPLAY.bankName,
    beneficiary: KOSOVO_BANK_DISPLAY.beneficiary,
    reference: payment.token,
    message:
      "Transferoni shumën në IBAN. Në përshkrim vendosni kodin e referencës. Pas konfirmimit nga banka, portofoli kreditohet.",
  });
});

export default router;
