/** Kosovo fiscal integration — env & legal entity (REVOLUTION INVEST). */

import { kosovoBankPaymentsReady } from "../kosovo-bank-payments/config";

export type FiscalProviderId = "placeholder" | "enternet";

export function fiscalKosovoEnabled(): boolean {
  return process.env.FISCAL_KOSOVO_ENABLED?.trim().toLowerCase() === "true";
}

export function fiscalProviderId(): FiscalProviderId {
  const raw = process.env.FISCAL_KOSOVO_PROVIDER?.trim().toLowerCase() || "placeholder";
  if (raw === "enternet") return "enternet";
  return "placeholder";
}

export function fiscalApiConfigured(): boolean {
  const url = process.env.FISCAL_KOSOVO_API_URL?.trim();
  const key = process.env.FISCAL_KOSOVO_API_KEY?.trim();
  return Boolean(url && key);
}

/**
 * Kosovo fiscal documents only when Enternet/API is live AND payments run via Kosovo bank.
 * Stripe top-ups never issue ATK receipts (even with XK card).
 */
export function canIssueKosovoFiscalReceipts(): boolean {
  return fiscalKosovoEnabled() && fiscalApiConfigured() && kosovoBankPaymentsReady();
}

export const FISCAL_LEGAL = {
  name: process.env.FISCAL_LEGAL_NAME?.trim() || "REVOLUTION INVEST Sh.p.k.",
  nrb: process.env.FISCAL_NRB?.trim() || "811314567",
  city: process.env.FISCAL_CITY?.trim() || "Ferizaj",
  country: "Kosovë",
  platform: "ketujemi.com",
} as const;

/** VAT rate for platform services (confirm with accountant). */
export function fiscalVatPercent(): number {
  const n = Number(process.env.FISCAL_VAT_PERCENT ?? "18");
  return Number.isFinite(n) && n >= 0 ? n : 18;
}
