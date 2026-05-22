import { Router } from "express";
import {
  activateVipFromPayment,
  devPaymentBypassEnabled,
  markPaymentPaidByToken,
  paymentsConfigured,
  stripePublishableKey,
} from "../lib/payments";
import { isPhase2Enabled } from "../lib/listing-top";
import { handleCreateCheckoutSession } from "../lib/create-checkout-session-handler";

const router = Router();

router.get("/payments/status", (_req, res) => {
  res.json({
    stripe: paymentsConfigured(),
    stripePublishableKey: stripePublishableKey(),
    devBypass: devPaymentBypassEnabled(),
    phase2: isPhase2Enabled(),
  });
});

/** Stripe Checkout — create session (canonical path). */
router.post("/create-checkout-session", (req, res) => {
  void handleCreateCheckoutSession(req, res);
});

/** Alias kept for existing clients. */
router.post("/payments/checkout", (req, res) => {
  void handleCreateCheckoutSession(req, res);
});

router.post("/payments/webhook", async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret || !stripeKey) {
    res.status(503).end();
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (typeof sig !== "string") {
    res.status(400).end();
    return;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);
    const rawBody = (req as { rawBody?: Buffer }).rawBody ?? Buffer.from("");
    const event = stripe.webhooks.constructEvent(rawBody, sig, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const token =
        session.metadata?.payment_token ?? session.client_reference_id ?? "";
      if (token) {
        await markPaymentPaidByToken(token);
        const purpose = session.metadata?.purpose;
        const userId = Number(session.metadata?.user_id);
        const partnerId = Number(session.metadata?.partner_id);
        if (
          (purpose === "partner_standard" || purpose === "partner_vip") &&
          Number.isFinite(partnerId)
        ) {
          const { activatePartnerFromPayment } = await import("../lib/partner-activate");
          await activatePartnerFromPayment(partnerId);
        }
        if (purpose === "vip_month" && Number.isFinite(userId)) {
          await activateVipFromPayment(userId);
        }
        const listingId = Number(session.metadata?.listing_id);
        if (purpose === "top_listing" && Number.isFinite(listingId)) {
          const { applyTopBoostToListing } = await import("../lib/listing-top");
          await applyTopBoostToListing(listingId);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    req.log.error({ err }, "Stripe webhook error");
    res.status(400).end();
  }
});

export default router;
