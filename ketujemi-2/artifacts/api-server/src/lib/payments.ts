import { randomUUID } from "node:crypto";
import { db, businessPaymentsTable, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  BUSINESS_EXTRA_POST_PRICE_EUR,
  BUSINESS_VIP_MONTHLY_PRICE_EUR,
} from "./business-rules";
import { PARTNER_PACKAGE_PRICE_CENTS } from "./business-partner";
import { applyTopBoostToListing, isPhase2Enabled } from "./listing-top";

export type PaymentPurpose =
  | "extra_post"
  | "vip_month"
  | "top_listing"
  | "partner_standard"
  | "partner_vip"
  | "listing_package_s"
  | "listing_package_m"
  | "listing_package_l";

export function stripeSecret(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key || null;
}

export const TOP_LISTING_PRICE_EUR = 1;

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
  if (purpose === "vip_month") return BUSINESS_VIP_MONTHLY_PRICE_EUR * 100;
  if (purpose === "top_listing") return TOP_LISTING_PRICE_EUR * 100;
  if (purpose === "partner_vip") return PARTNER_PACKAGE_PRICE_CENTS.vip;
  if (purpose === "partner_standard") return PARTNER_PACKAGE_PRICE_CENTS.partner;
  if (purpose === "listing_package_s") return 100;
  if (purpose === "listing_package_m") return 500;
  if (purpose === "listing_package_l") return 800;
  return BUSINESS_EXTRA_POST_PRICE_EUR * 100;
}

export async function createPaymentRecord(
  userId: number,
  purpose: PaymentPurpose,
  listingId?: number,
): Promise<{ token: string; amountCents: number }> {
  const token = randomUUID();
  const cents = amountCents(purpose);
  await db.insert(businessPaymentsTable).values({
    token,
    user_id: userId,
    purpose,
    listing_id: listingId ?? null,
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
  listingId?: number,
): Promise<{ url: string; token: string; sessionId: string | null }> {
  if (purpose === "top_listing" && !isPhase2Enabled()) {
    throw new Error("PHASE_2_DISABLED");
  }

  if (devPaymentBypassEnabled()) {
    const { token } = await createPaymentRecord(user.id, purpose, listingId);
    if (purpose === "vip_month") {
      await activateVipFromPayment(user.id);
    }
    if (purpose === "top_listing" && listingId) {
      await applyTopBoostToListing(listingId);
    }
    const url =
      purpose === "vip_month"
        ? `${origin}/profile?payment=success&purpose=vip`
        : purpose === "top_listing" && listingId
          ? `${origin}/listings/${listingId}?top=success`
          : `${origin}/listings/new?payment_token=${encodeURIComponent(token)}`;
    return { url, token, sessionId: null };
  }

  const secret = stripeSecret();
  if (!secret) {
    throw new Error("PAYMENTS_NOT_CONFIGURED");
  }

  const { token, amountCents: cents } = await createPaymentRecord(user.id, purpose, listingId);
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);

  const sessionQuery = "session_id={CHECKOUT_SESSION_ID}";
  const successUrl =
    purpose === "vip_month"
      ? `${origin}/profile?payment=success&purpose=vip&${sessionQuery}`
      : purpose === "top_listing" && listingId
        ? `${origin}/listings/${listingId}?top=success&${sessionQuery}`
        : `${origin}/listings/new?payment_token=${encodeURIComponent(token)}&${sessionQuery}`;

  const productName =
    purpose === "vip_month"
      ? "KetuJemi VIP Biznes (1 muaj)"
      : purpose === "top_listing"
        ? "KetuJemi TOP — njoftim në krye"
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
    metadata: {
      user_id: String(user.id),
      purpose,
      payment_token: token,
      listing_id: listingId ? String(listingId) : "",
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

export function stripePublishableKey(): string | null {
  const key =
    process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ||
    "";
  return key || null;
}

export async function markPaymentPaidByToken(token: string): Promise<void> {
  const { findPackagePurchaseByToken, activateListingPackageFromPayment } = await import(
    "./listing-packages"
  );
  const pkgPurchase = await findPackagePurchaseByToken(token);
  if (pkgPurchase && pkgPurchase.status === "pending") {
    await activateListingPackageFromPayment(pkgPurchase.id);
    return;
  }

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
  if (row.purpose === "top_listing" && row.listing_id) {
    await applyTopBoostToListing(row.listing_id);
  }
  if (
    (row.purpose === "partner_standard" || row.purpose === "partner_vip") &&
    row.partner_id
  ) {
    const { activatePartnerFromPayment } = await import("./partner-activate");
    await activatePartnerFromPayment(row.partner_id);
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
