/** Kosovo bank redirect / API (Raiffeisen, NLB, TEB, etj.) — aktivizohet pas llogarisë biznes. */

export function kosovoBankPaymentsEnabled(): boolean {
  return process.env.KOSOVO_BANK_PAYMENTS_ENABLED?.trim().toLowerCase() === "true";
}

/** IBAN set — enough for manual transfer instructions (no hosted bank API yet). */
export function kosovoBankIbanConfigured(): boolean {
  return Boolean(process.env.KOSOVO_BANK_IBAN?.trim());
}

/** Hosted bank API credentials (Raiffeisen/NLB merchant redirect). */
export function kosovoBankApiConfigured(): boolean {
  const apiUrl = process.env.KOSOVO_BANK_API_URL?.trim();
  const merchantId = process.env.KOSOVO_BANK_MERCHANT_ID?.trim();
  return Boolean(apiUrl && merchantId);
}

export function kosovoBankPaymentsConfigured(): boolean {
  return kosovoBankIbanConfigured();
}

/** True when bank payments can run (manual IBAN or live API provider). */
export function kosovoBankPaymentsReady(): boolean {
  return kosovoBankPaymentsEnabled() && kosovoBankPaymentsConfigured();
}

/** True only after bank merchant API is wired (not manual IBAN transfer). */
export function kosovoBankProviderLive(): boolean {
  return (
    kosovoBankPaymentsReady() &&
    kosovoBankApiConfigured() &&
    process.env.KOSOVO_BANK_PROVIDER_READY?.trim().toLowerCase() === "true"
  );
}

/** Manual transfer page (IBAN + reference) when API is not live yet. */
export function kosovoBankManualTransferReady(): boolean {
  return kosovoBankPaymentsReady() && !kosovoBankProviderLive();
}

export const KOSOVO_BANK_DISPLAY = {
  iban: process.env.KOSOVO_BANK_IBAN?.trim() || "",
  bankName: process.env.KOSOVO_BANK_NAME?.trim() || "",
  beneficiary: process.env.KOSOVO_BANK_BENEFICIARY?.trim() || "REVOLUTION INVEST Sh.p.k.",
} as const;
