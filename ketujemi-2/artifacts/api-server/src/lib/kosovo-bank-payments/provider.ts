import type { User } from "@workspace/db";
import { KOSOVO_BANK_DISPLAY } from "./config";

export type KosovoBankPaymentInit = {
  user: User;
  paymentToken: string;
  purpose: string;
  amountCents: number;
  origin: string;
};

/**
 * Start hosted payment at Kosovo bank (3-D Secure / redirect).
 * Until merchant API is live, redirect to in-app IBAN transfer instructions.
 */
export async function initiateKosovoBankWalletPayment(
  init: KosovoBankPaymentInit,
): Promise<{ redirectUrl: string }> {
  const apiUrl = process.env.KOSOVO_BANK_API_URL?.trim();
  const merchantId = process.env.KOSOVO_BANK_MERCHANT_ID?.trim();
  const providerLive =
    Boolean(apiUrl && merchantId) &&
    process.env.KOSOVO_BANK_PROVIDER_READY?.trim().toLowerCase() === "true";

  if (providerLive) {
    void KOSOVO_BANK_DISPLAY;
    throw new Error(
      "KOSOVO_BANK_PROVIDER_NOT_IMPLEMENTED — connect bank API after merchant account is approved",
    );
  }

  if (!KOSOVO_BANK_DISPLAY.iban) {
    throw new Error("KOSOVO_BANK_NOT_CONFIGURED");
  }

  const url = new URL("/wallet/bank-payment", init.origin);
  url.searchParams.set("token", init.paymentToken);
  return { redirectUrl: url.toString() };
}
