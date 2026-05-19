import { randomUUID } from "node:crypto";
import { db, businessPaymentsTable, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  BUSINESS_EXTRA_POST_PRICE_EUR,
  BUSINESS_VIP_MONTHLY_PRICE_EUR,
} from "./business-rules";

export type PaymentPurpose = "extra_post" | "vip_month";

function stripeSecret(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key || null;
}

export function paymentsConfigured(): boolean {
  return stripeSecret() != null;
}

export function devPaymentBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.PAYMENT_DEV_BYPASS === "true"
  );
}

function amountCents(purpose: PaymentPurpose): number {
  return purpose === "vip_month"
    ? BUSINESS_VIP_MONTHLY_PRICE_EUR * 100
    : BUSINESS_EXTRA_POST_PRICE_EUR * 100;
}

export async function createPaymentRecord(
  userId: number,
  purpose: PaymentPurpose,
): Promise<{ token: string; amountCents: number }> {
  const token = randomUUID();
  const cents = amountCents(purpose);
  await db.insert(businessPaymentsTable).values({
    token,
    user_id: userId,
    purpose,
    amount_cents: cents,
    status: devPaymentBypassEnabled() ? "paid" : "pending",
    paid_at: devPaymentBypassEnabled() ? new Date() : null,
  });
  return { token, amountCents: cents };
}

export async function createStripeCheckout(
  user: User,
  purpose: PaymentPurpose,
  origin: string,
): Promise<{ url: string; token: string }> {
  if (devPaymentBypassEnabled()) {
    const { token } = await createPaymentRecord(user.id, purpose);
    if (purpose === "vip_month") {
      await activateVipFromPayment(user.id);
    }
    const url =
      purpose === "vip_month"
        ? `${origin}/profile?payment=success&purpose=vip`
        : `${origin}/listings/new?payment_token=${encodeURIComponent(token)}`;
    return { url, token };
  }

  const secret = stripeSecret();
  if (!secret) {
    throw new Error("PAYMENTS_NOT_CONFIGURED");
  }

  const { token, amountCents: cents } = await createPaymentRecord(user.id, purpose);
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);

  const successUrl =
    purpose === "vip_month"
      ? `${origin}/profile?payment=success&purpose=vip`
      : `${origin}/listings/new?payment_token=${encodeURIComponent(token)}`;

  const productName =
    purpose === "vip_month"
      ? "KetuJemi VIP Biznes (1 muaj)"
      : "KetuJemi — njoftim shtesë biznes";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: productName },
          unit_amount: cents,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: `${origin}/profile?payment=cancelled`,
    client_reference_id: token,
    metadata: { user_id: String(user.id), purpose, payment_token: token },
  });

  if (!session.url) {
    throw new Error("STRIPE_SESSION_FAILED");
  }

  await db
    .update(businessPaymentsTable)
    .set({ stripe_session_id: session.id })
    .where(eq(businessPaymentsTable.token, token));

  return { url: session.url, token };
}

export async function markPaymentPaidByToken(token: string): Promise<void> {
  const [row] = await db
    .select()
    .from(businessPaymentsTable)
    .where(eq(businessPaymentsTable.token, token))
    .limit(1);

  if (!row || row.status !== "pending") return;

  await db
    .update(businessPaymentsTable)
    .set({ status: "paid", paid_at: new Date() })
    .where(eq(businessPaymentsTable.id, row.id));

  if (row.purpose === "vip_month") {
    await activateVipFromPayment(row.user_id);
  }
}

export async function consumeExtraPostPayment(
  userId: number,
  token: string,
): Promise<boolean> {
  const [row] = await db
    .select()
    .from(businessPaymentsTable)
    .where(eq(businessPaymentsTable.token, token))
    .limit(1);

  if (!row || row.user_id !== userId) return false;
  if (row.purpose !== "extra_post") return false;
  if (row.status !== "paid" || row.consumed_at) return false;

  await db
    .update(businessPaymentsTable)
    .set({ status: "consumed", consumed_at: new Date() })
    .where(eq(businessPaymentsTable.id, row.id));

  return true;
}

export async function activateVipFromPayment(userId: number): Promise<void> {
  const until = new Date();
  until.setMonth(until.getMonth() + 1);
  await db
    .update(usersTable)
    .set({
      business_tier: "vip",
      vip_expires_at: until,
    })
    .where(eq(usersTable.id, userId));
}
