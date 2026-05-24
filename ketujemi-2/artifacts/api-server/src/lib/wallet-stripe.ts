import { eq } from "drizzle-orm";
import { db, businessPaymentsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import {
  WALLET_TOPUP_CATALOG,
  type WalletTopupId,
  stripePurposeForWalletTopup,
  creditWalletTopup,
} from "./wallet";
import { createPaymentRecord, devPaymentBypassEnabled, stripeSecret } from "./payments";

async function completeWalletTopup(
  userId: number,
  purpose: string,
  paymentToken: string,
): Promise<void> {
  const pkg = purpose.replace("wallet_topup_", "") as WalletTopupId;
  if (!(pkg in WALLET_TOPUP_CATALOG)) return;
  await creditWalletTopup(userId, WALLET_TOPUP_CATALOG[pkg].price_cents, paymentToken);

  const { issueFiscalReceiptForWalletTopup } = await import("./fiscal-kosovo");
  void issueFiscalReceiptForWalletTopup(userId, purpose, paymentToken).catch(() => undefined);
}

export async function createWalletTopupStripeCheckout(
  user: User,
  pkg: WalletTopupId,
  origin: string,
): Promise<{ url: string; token: string; sessionId: string | null }> {
  const def = WALLET_TOPUP_CATALOG[pkg];
  const purpose = stripePurposeForWalletTopup(pkg);

  if (devPaymentBypassEnabled()) {
    const { token } = await createPaymentRecord(user.id, purpose);
    await completeWalletTopup(user.id, purpose, token);
    return {
      url: `${origin}/profile?payment=success&purpose=wallet&session_id=dev`,
      token,
      sessionId: null,
    };
  }

  const secret = stripeSecret();
  if (!secret) {
    throw new Error("PAYMENTS_NOT_CONFIGURED");
  }

  const { token, amountCents: cents } = await createPaymentRecord(user.id, purpose);
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email?.trim() || undefined,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `KetuJemi Portofol — ${def.label}`,
            description: `${def.listings} shpallje × €0.30`,
          },
          unit_amount: cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/profile?payment=success&purpose=wallet&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/profile?payment=cancelled`,
    client_reference_id: token,
    metadata: {
      user_id: String(user.id),
      purpose,
      payment_token: token,
      wallet_topup: pkg,
    },
  });

  if (!session.url) {
    throw new Error("STRIPE_SESSION_FAILED");
  }

  await db
    .update(businessPaymentsTable)
    .set({ stripe_session_id: session.id })
    .where(eq(businessPaymentsTable.token, token));

  return { url: session.url, token, sessionId: session.id };
}

export async function fulfillWalletTopupFromPayment(
  userId: number,
  purpose: string,
  paymentToken: string,
): Promise<void> {
  await completeWalletTopup(userId, purpose, paymentToken);
}
