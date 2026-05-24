/** Kosovo bank redirect / API (Raiffeisen, NLB, TEB, etj.) — aktivizohet pas llogarisë biznes. */

export function kosovoBankPaymentsEnabled(): boolean {
  return process.env.KOSOVO_BANK_PAYMENTS_ENABLED?.trim().toLowerCase() === "true";
}

export function kosovoBankPaymentsConfigured(): boolean {
  const iban = process.env.KOSOVO_BANK_IBAN?.trim();
  const apiUrl = process.env.KOSOVO_BANK_API_URL?.trim();
  const merchantId = process.env.KOSOVO_BANK_MERCHANT_ID?.trim();
  return Boolean(iban && apiUrl && merchantId);
}

/** True when env flag + IBAN + bank API credentials are set (ready to wire provider). */
export function kosovoBankPaymentsReady(): boolean {
  return kosovoBankPaymentsEnabled() && kosovoBankPaymentsConfigured();
}

export const KOSOVO_BANK_DISPLAY = {
  iban: process.env.KOSOVO_BANK_IBAN?.trim() || "",
  bankName: process.env.KOSOVO_BANK_NAME?.trim() || "",
  beneficiary: process.env.KOSOVO_BANK_BENEFICIARY?.trim() || "REVOLUTION INVEST Sh.p.k.",
} as const;
