import { Router } from "express";
import { getSessionUser } from "../lib/session-user";
import {
  activateVipFromPayment,
  createStripeCheckout,
  devPaymentBypassEnabled,
  markPaymentPaidByToken,
  paymentsConfigured,
  type PaymentPurpose,
} from "../lib/payments";
import { isBusinessAccount } from "../lib/business-rules";

const router = Router();

function appOrigin(req: { get: (h: string) => string | undefined }): string {
  const fromEnv = process.env.PUBLIC_APP_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const proto = req.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:5173";
}

router.get("/payments/status", (_req, res) => {
  res.json({
    stripe: paymentsConfigured(),
    devBypass: devPaymentBypassEnabled(),
  });
});

router.post("/payments/checkout", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  const purpose = req.body?.purpose as PaymentPurpose;
  if (purpose !== "extra_post" && purpose !== "vip_month") {
    res.status(400).json({ error: "Invalid purpose" });
    return;
  }

  if (purpose === "vip_month" && !isBusinessAccount(user)) {
    res.status(400).json({
      error: "VIP_REQUIRES_BUSINESS",
      message: "Aktivizoni llogarinë e biznesit para VIP.",
    });
    return;
  }

  try {
    const { url, token } = await createStripeCheckout(user, purpose, appOrigin(req));
    res.json({ url, token });
  } catch (err) {
    if (err instanceof Error && err.message === "PAYMENTS_NOT_CONFIGURED") {
      res.status(503).json({
        error: "PAYMENTS_NOT_CONFIGURED",
        message: "Pagesa online nuk është konfiguruar ende. Kontaktoni support@ketujemi.com.",
      });
      return;
    }
    req.log.error({ err }, "Checkout error");
    res.status(500).json({ error: "Checkout failed" });
  }
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
        if (purpose === "vip_month" && Number.isFinite(userId)) {
          await activateVipFromPayment(userId);
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
