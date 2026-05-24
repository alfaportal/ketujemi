/** Market codes from vendi (`market-context` MARKETS). */
export const BALKAN_MARKET_CODES = new Set(["ks", "al", "mk", "mne"]);

/** Diaspora — pagesa nga jashtë; pa kupon fiskal ATK Kosovë. */
export const DIASPORA_MARKET_CODES = new Set(["de", "at", "ch", "it", "fr", "gb", "us"]);

export function normalizeMarketCode(raw: string | undefined | null): string | null {
  const c = raw?.trim().toLowerCase();
  return c || null;
}

/** True when user pays while browsing as diaspora (Stripe «jashtë»). */
export function isDiasporaMarketCode(raw: string | undefined | null): boolean {
  const c = normalizeMarketCode(raw);
  return c != null && DIASPORA_MARKET_CODES.has(c);
}

/**
 * Kosovo fiscal receipt (ATK) only for Balkan market selection.
 * Diaspora + unknown → skip (abroad / Stripe international).
 */
export function shouldIssueKosovoFiscalReceipt(raw: string | undefined | null): boolean {
  const c = normalizeMarketCode(raw);
  if (!c) return false;
  if (DIASPORA_MARKET_CODES.has(c)) return false;
  return BALKAN_MARKET_CODES.has(c);
}

/** Stripe Checkout `customer_details.address.country` (ISO 3166-1 alpha-2). */
const KOSOVO_BILLING_CODES = new Set(["XK", "KS", "KV"]);

export function isAbroadBillingCountry(country: string | undefined | null): boolean {
  const cc = country?.trim().toUpperCase();
  if (!cc) return false;
  if (KOSOVO_BILLING_CODES.has(cc)) return false;
  return true;
}
