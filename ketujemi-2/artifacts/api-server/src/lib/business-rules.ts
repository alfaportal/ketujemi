/**
 * KetuJemi business marketplace rules — enforced on listing create for business accounts.
 * @see ketujemi-2/docs/BUSINESS_RULES.md
 */
import {
  isDhurataFalasSlug,
  isKerkojTeBlejSlug,
} from "../../../../lib/special-listing-categories.js";

/** Same per-root-category cap as private users (see category-quota). */
export const BUSINESS_STANDARD_FREE_LISTINGS_PER_CATEGORY = 10;
/** Legacy — extra post checkout removed; over-quota posts use wallet (€0.30). */
export const BUSINESS_EXTRA_POST_PRICE_EUR = 0.3;
export const BUSINESS_VIP_MONTHLY_PRICE_EUR = 50;

export const COMPLAINT_WARN_THRESHOLD = 3;
export const COMPLAINT_SUSPEND_THRESHOLD = 5;

export const STRIKE_SUSPEND_DAYS = 30;

export type BusinessListingValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

const GENERIC_AD_PATTERNS = [
  /\bna kontaktoni\b/i,
  /\bkontaktoni ne\b/i,
  /\bvisit our\b/i,
  /\bwww\.\S+/i,
  /\bfaqe zyrtare\b/i,
  /\breklam[ae]?\b/i,
  /\boferta speciale per kompanin\b/i,
];

const NO_REAL_PRICE_PATTERNS = [
  /\bna kontaktoni\b/i,
  /\bcmimi sipas\b/i,
  /\bme marrëveshje\b/i,
  /\bme marreveshje\b/i,
  /\bprice on request\b/i,
];

const STOCK_PHOTO_HINTS = [
  "pexels.com",
  "unsplash.com",
  "shutterstock",
  "istockphoto",
  "gettyimages",
  "placeholder",
  "stock-photo",
];

export function isBusinessAccount(
  user: { account_type?: string | null } | null | undefined,
): boolean {
  return user?.account_type === "business";
}

export function isVipBusinessActive(
  user: {
    business_tier?: string | null;
    vip_expires_at?: Date | null;
  } | null | undefined,
): boolean {
  if (!user || user.business_tier !== "vip" || !user.vip_expires_at) return false;
  return new Date(user.vip_expires_at) > new Date();
}

export function validateBusinessListing(input: {
  title: string;
  description: string;
  price: number;
  image_url?: string | null;
  categoryRootSlug?: string | null;
}): BusinessListingValidationResult {
  const title = input.title.trim();
  const description = input.description.trim();
  const combined = `${title}\n${description}`;
  const specialZeroPrice =
    isKerkojTeBlejSlug(input.categoryRootSlug) || isDhurataFalasSlug(input.categoryRootSlug);

  if (!specialZeroPrice && input.price <= 0) {
    return {
      ok: false,
      code: "BUSINESS_PRICE_REQUIRED",
      message: "Bizneset duhet të vendosin çmim real (jo 0 € ose “na kontaktoni”).",
    };
  }

  for (const re of NO_REAL_PRICE_PATTERNS) {
    if (re.test(combined)) {
      return {
        ok: false,
        code: "BUSINESS_NO_CONTACT_PRICE",
        message: "Çmimi duhet të jetë i qartë; “na kontaktoni” nuk lejohet për biznese.",
      };
    }
  }

  for (const re of GENERIC_AD_PATTERNS) {
    if (re.test(combined)) {
      return {
        ok: false,
        code: "BUSINESS_GENERIC_AD",
        message: "Reklamat e përgjithshme të kompanisë nuk lejohen — postoni produkt specifik.",
      };
    }
  }

  const img = (input.image_url ?? "").toLowerCase();
  if (img && STOCK_PHOTO_HINTS.some((h) => img.includes(h))) {
    return {
      ok: false,
      code: "BUSINESS_STOCK_PHOTO",
      message: "Përdorni foto të produktit tuaj aktual, jo foto stock nga interneti.",
    };
  }

  if (title.length < 8) {
    return {
      ok: false,
      code: "BUSINESS_TITLE_TOO_SHORT",
      message: "Titulli duhet të përshkruajë produktin specifik (jo vetëm emrin e kompanisë).",
    };
  }

  return { ok: true };
}

export function normalizeTitleForDuplicate(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
