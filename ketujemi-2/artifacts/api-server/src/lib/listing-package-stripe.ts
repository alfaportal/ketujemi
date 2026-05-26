import { eq } from "drizzle-orm";
import { db, listingPackagePurchasesTable } from "@workspace/db";
import {
  createPendingPackagePurchase,
  LISTING_PACKAGE_CATALOG,
  type ListingPackageId,
  activateListingPackageFromPayment,
  stripePurposeForPackage,
} from "./listing-packages";
import { devPaymentBypassEnabled, stripeSecret } from "./payments";
import type { User } from "@workspace/db";

export async function createListingPackageStripeCheckout(
  user: User,
  pkg: ListingPackageId,
  origin: string,
): Promise<{
  url: string;
  token: string;
  sessionId: string | null;
  activationCode: string;
  purchaseId: number;
}> {
  const def = LISTING_PACKAGE_CATALOG[pkg];
  const { purchaseId, token, activationCode } = await createPendingPackagePurchase(user.id, pkg);

  if (devPaymentBypassEnabled()) {
    await activateListingPackageFromPayment(purchaseId);
    return {
      url: `${origin}/listings/new?package_payment=success&code=${encodeURIComponent(activationCode)}`,
      token,
      sessionId: null,
      activationCode,
      purchaseId,
    };
  }

  const secret = stripeSecret();
  if (!secret) {
    throw new Error("PAYMENTS_NOT_CONFIGURED");
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const purpose = stripePurposeForPackage(pkg);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email?.trim() || undefined,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${def.name} — €${def.price_eur} portofol (~${def.listings_approx} shpallje @ €0.30)`,
          },
          unit_amount: def.price_cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/listings/new?package_payment=success&code=${encodeURIComponent(activationCode)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/listings/new?package_payment=cancelled`,
    client_reference_id: token,
    metadata: {
      user_id: String(user.id),
      purpose,
      payment_token: token,
      listing_package_purchase_id: String(purchaseId),
      package: pkg,
      activation_code: activationCode,
    },
  });

  if (!session.url) {
    throw new Error("STRIPE_SESSION_FAILED");
  }

  await db
    .update(listingPackagePurchasesTable)
    .set({ stripe_session_id: session.id })
    .where(eq(listingPackagePurchasesTable.id, purchaseId));

  return {
    url: session.url,
    token,
    sessionId: session.id,
    activationCode,
    purchaseId,
  };
}
