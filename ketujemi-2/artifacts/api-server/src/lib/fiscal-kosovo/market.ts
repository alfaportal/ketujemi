import type Stripe from "stripe";

/** Kosovo billing / card country codes (ISO 3166-1 alpha-2). */
const KOSOVO_BILLING_CODES = new Set(["XK", "KS", "KV"]);

export function normalizeCountryCode(raw: string | undefined | null): string | null {
  const cc = raw?.trim().toUpperCase();
  return cc || null;
}

/** True only when Stripe reports Kosovo as billing or card country. */
export function isKosovoBillingCountry(country: string | undefined | null): boolean {
  const cc = normalizeCountryCode(country);
  return cc != null && KOSOVO_BILLING_CODES.has(cc);
}

/** Read country from Checkout Session (address or expanded payment method). */
export function billingCountryFromCheckoutSession(
  session: Stripe.Checkout.Session,
): string | null {
  const fromAddress = normalizeCountryCode(session.customer_details?.address?.country);
  if (fromAddress) return fromAddress;

  const pi = session.payment_intent;
  if (typeof pi !== "object" || pi == null) return null;

  const pm = pi.payment_method;
  if (typeof pm !== "object" || pm == null) return null;

  const fromCard = normalizeCountryCode(pm.card?.country);
  if (fromCard) return fromCard;

  return normalizeCountryCode(pm.billing_details?.address?.country);
}
