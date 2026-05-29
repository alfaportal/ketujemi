import { Router } from "express";
import {
  devPaymentBypassEnabled,
  paymentsConfigured,
  stripePublishableKey,
  stripeSecret,
} from "../lib/payments";
import { isPhase2Enabled, TOP_PACKAGE_LIST } from "../lib/listing-top";
import { handleCreateCheckoutSession } from "../lib/create-checkout-session-handler";
import { fulfillPaidCheckoutSession } from "../lib/stripe-fulfill-session";
import { getSessionUser } from "../lib/session-user";

const router = Router();

router.get("/payments/status", (_req, res) => {
  res.json({
    stripe: paymentsConfigured(),
    stripePublishableKey: stripePublishableKey(),
    devBypass: devPaymentBypassEnabled(),
    phase2: isPhase2Enabled(),
    topPackages: TOP_PACKAGE_LIST.map((p) => ({
      id: p.id,
      purpose: p.purpose,
      priceEur: p.priceEur,
      days: p.days,
      label: `${p.days} ditë`,
    })),
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
      await fulfillPaidCheckoutSession(event.data.object);
    }

    res.json({ received: true });
  } catch (err) {
    req.log.error({ err }, "Stripe webhook error");
    res.status(400).end();
  }
});

/** After Stripe redirect — confirm payment if webhook is delayed (logged-in users). */
router.post("/payments/confirm-session", async (req, res) => {
  const sessionId = String(req.body?.session_id ?? "").trim();
  if (!sessionId.startsWith("cs_")) {
    res.status(400).json({ error: "Invalid session_id" });
    return;
  }

  const secret = stripeSecret();
  if (!secret) {
    res.status(503).json({ error: "PAYMENTS_NOT_CONFIGURED" });
    return;
  }

  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "payment_intent.payment_method"],
    });

    const ownerId = Number(session.metadata?.user_id);
    if (Number.isFinite(ownerId) && ownerId !== user.id) {
      res.status(403).json({ error: "Session does not belong to this account" });
      return;
    }

    if (session.payment_status === "paid") {
      await fulfillPaidCheckoutSession(session);
    }

    res.json({
      ok: true,
      paid: session.payment_status === "paid",
      purpose: session.metadata?.purpose ?? null,
      partner_id: session.metadata?.partner_id ?? null,
      activation_code: session.metadata?.activation_code?.trim() || null,
    });
  } catch (err) {
    req.log.error({ err }, "confirm-session error");
    res.status(500).json({ error: "Confirm failed" });
  }
});

export default router;
