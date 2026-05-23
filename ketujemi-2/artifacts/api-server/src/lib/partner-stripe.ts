import { randomUUID } from "node:crypto";
import { db, businessPaymentsTable, partnersTable } from "@workspace/db";
import type { PartnerApplication } from "@workspace/db";
import { eq } from "drizzle-orm";
import { PARTNER_PACKAGE_PRICE_CENTS } from "./business-partner";
import { devPaymentBypassEnabled, stripeSecret } from "./payments";
import { activatePartnerFromPayment } from "./partner-activate";

export type PartnerPaymentPurpose = "partner_standard" | "partner_vip";

export function partnerPurposeFromPackage(pkg: string): PartnerPaymentPurpose {
  return pkg === "vip" ? "partner_vip" : "partner_standard";
}

function amountCentsForPackage(pkg: string): number {
  return pkg === "vip"
    ? PARTNER_PACKAGE_PRICE_CENTS.vip
    : PARTNER_PACKAGE_PRICE_CENTS.partner;
}

export async function createPartnerStripeCheckout(
  partner: PartnerApplication,
  origin: string,
  userId: number,
): Promise<{ url: string; token: string; sessionId: string | null }> {
  const purpose = partnerPurposeFromPackage(partner.package);
  const cents = amountCentsForPackage(partner.package);
  const token = randomUUID();

  if (devPaymentBypassEnabled()) {
    await db.insert(businessPaymentsTable).values({
      token,
      user_id: userId,
      partner_id: partner.id,
      purpose,
      amount_cents: cents,
      status: "paid",
      paid_at: new Date(),
    });
    await db
      .update(partnersTable)
      .set({ payment_status: "paid", payment_token: token })
      .where(eq(partnersTable.id, partner.id));
    await activatePartnerFromPayment(partner.id);
    return {
      url: `${origin}/partner?payment=success&partner_id=${partner.id}`,
      token,
      sessionId: null,
    };
  }

  const secret = stripeSecret();
  if (!secret) {
    throw new Error("PAYMENTS_NOT_CONFIGURED");
  }

  await db.insert(businessPaymentsTable).values({
    token,
    user_id: userId,
    partner_id: partner.id,
    purpose,
    amount_cents: cents,
    status: "pending",
  });

  await db
    .update(partnersTable)
    .set({ payment_status: "pending", payment_token: token })
    .where(eq(partnersTable.id, partner.id));

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const packageLabel = partner.package === "vip" ? "VIP Partner" : "Partner Standard";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: partner.email.trim(),
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `KetuJemi ${packageLabel} — 1 muaj`,
            description: partner.business_name,
          },
          unit_amount: cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/partner?payment=success&partner_id=${partner.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/partner?payment=cancelled&partner_id=${partner.id}`,
    client_reference_id: token,
    metadata: {
      user_id: String(userId),
      partner_id: String(partner.id),
      purpose,
      payment_token: token,
    },
  });

  if (!session.url) {
    throw new Error("STRIPE_SESSION_FAILED");
  }

  await db
    .update(businessPaymentsTable)
    .set({ stripe_session_id: session.id })
    .where(eq(businessPaymentsTable.token, token));

  await db
    .update(partnersTable)
    .set({ stripe_session_id: session.id })
    .where(eq(partnersTable.id, partner.id));

  return { url: session.url, token, sessionId: session.id };
}
