import type { Request, Response } from "express";
import { getSessionUser } from "./session-user";
import {
  createStripeCheckout,
  type PaymentPurpose,
} from "./payments";
import { isBusinessAccount } from "./business-rules";
import { isPhase2Enabled, isTopListingPurpose } from "./listing-top";
import { userOwnsListing } from "./listing-ownership";
import { db, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function appOrigin(req: Request): string {
  const fromEnv = process.env.PUBLIC_APP_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const host = req.get("x-forwarded-host") ?? req.get("host");
  const proto = req.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "http://localhost:5173";
}

const CARD_CHECKOUT_PURPOSES = new Set<PaymentPurpose>([
  "extra_post",
  "vip_month",
  "top_listing_s",
  "top_listing_m",
  "top_listing_l",
]);

/** Shared handler for Stripe Checkout session creation (card payments). */
export async function handleCreateCheckoutSession(req: Request, res: Response): Promise<void> {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not logged in", message: "Hyni në llogari për të paguar me kartë." });
    return;
  }

  const purpose = req.body?.purpose as PaymentPurpose;
  if (!CARD_CHECKOUT_PURPOSES.has(purpose)) {
    res.status(400).json({
      error: "Invalid purpose",
      message: "Lloji i pagesës nuk njihet.",
    });
    return;
  }

  if (isTopListingPurpose(purpose)) {
    if (!isPhase2Enabled()) {
      res.status(403).json({
        error: "PHASE_2_DISABLED",
        message: "TOP aktivizohet në Fazën 2 kur platforma ka më shumë trafik.",
      });
      return;
    }
    const listingId = Number(req.body?.listing_id);
    if (!Number.isFinite(listingId) || listingId < 1) {
      res.status(400).json({ error: "listing_id required", message: "Mungon njoftimi." });
      return;
    }
    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, listingId))
      .limit(1);
    if (!listing || !userOwnsListing(user, listing)) {
      res.status(403).json({ error: "Not your listing", message: "Ky njoftim nuk është i juaji." });
      return;
    }
    try {
      const { url, token, sessionId } = await createStripeCheckout(
        user,
        purpose,
        appOrigin(req),
        listingId,
      );
      res.json({ url, token, sessionId });
    } catch (err) {
      if (err instanceof Error && err.message === "PAYMENTS_NOT_CONFIGURED") {
        res.status(503).json({
          error: "PAYMENTS_NOT_CONFIGURED",
          message: "Pagesa me kartë nuk është konfiguruar ende.",
        });
        return;
      }
      req.log.error({ err }, "TOP checkout error");
      res.status(500).json({ error: "Checkout failed", message: "Gabim gjatë hapjes së pagesës." });
    }
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
    const { url, token, sessionId } = await createStripeCheckout(user, purpose, appOrigin(req));
    res.json({ url, token, sessionId });
  } catch (err) {
    if (err instanceof Error && err.message === "PAYMENTS_NOT_CONFIGURED") {
      res.status(503).json({
        error: "PAYMENTS_NOT_CONFIGURED",
        message: "Pagesa me kartë nuk është konfiguruar ende. Kontaktoni support@ketujemi.com.",
      });
      return;
    }
    req.log.error({ err }, "Checkout error");
    res.status(500).json({ error: "Checkout failed", message: "Gabim gjatë hapjes së pagesës." });
  }
}
