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
 * Replace body when bank provides merchant API docs.
 */
export async function initiateKosovoBankWalletPayment(
  init: KosovoBankPaymentInit,
): Promise<{ redirectUrl: string }> {
  void init;
  void KOSOVO_BANK_DISPLAY;

  throw new Error(
    "KOSOVO_BANK_PROVIDER_NOT_IMPLEMENTED — connect bank API after merchant account is approved",
  );
}
