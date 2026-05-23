import type Stripe from "stripe";
import { markPaymentPaidByToken } from "./payments";

/** Apply business logic after Stripe Checkout is paid (webhook or return URL). */
export async function fulfillPaidCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;

  const token =
    session.metadata?.payment_token?.trim() ||
    (typeof session.client_reference_id === "string" ? session.client_reference_id.trim() : "") ||
    "";
  if (!token) return;

  await markPaymentPaidByToken(token);

  const purpose = session.metadata?.purpose;
  const userId = Number(session.metadata?.user_id);
  const partnerId = Number(session.metadata?.partner_id);
  const packagePurchaseId = Number(session.metadata?.listing_package_purchase_id);

  if (
    (purpose === "partner_standard" || purpose === "partner_vip") &&
    Number.isFinite(partnerId)
  ) {
    const { activatePartnerFromPayment } = await import("./partner-activate");
    await activatePartnerFromPayment(partnerId);
  }

  if (
    (purpose === "listing_package_s" ||
      purpose === "listing_package_m" ||
      purpose === "listing_package_l") &&
    Number.isFinite(packagePurchaseId)
  ) {
    const { activateListingPackageFromPayment } = await import("./listing-packages");
    await activateListingPackageFromPayment(packagePurchaseId);
  }

  if (purpose === "vip_month" && Number.isFinite(userId)) {
    const { activateVipFromPayment } = await import("./payments");
    await activateVipFromPayment(userId);
  }

  const listingId = Number(session.metadata?.listing_id);
  if (purpose === "top_listing" && Number.isFinite(listingId)) {
    const { applyTopBoostToListing } = await import("./listing-top");
    await applyTopBoostToListing(listingId);
  }
}
