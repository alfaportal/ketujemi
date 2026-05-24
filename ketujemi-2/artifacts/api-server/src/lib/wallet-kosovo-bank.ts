import { eq } from "drizzle-orm";
import { db, businessPaymentsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import {
  WALLET_TOPUP_CATALOG,
  type WalletTopupId,
  stripePurposeForWalletTopup,
} from "./wallet";
import { createPaymentRecord } from "./payments";
import { initiateKosovoBankWalletPayment, kosovoBankPaymentsReady } from "./kosovo-bank-payments";

export async function createWalletTopupKosovoBankPayment(
  user: User,
  pkg: WalletTopupId,
  origin: string,
): Promise<{ url: string; token: string; sessionId: null; provider: "kosovo_bank" }> {
  if (!kosovoBankPaymentsReady()) {
    throw new Error("KOSOVO_BANK_NOT_CONFIGURED");
  }

  const def = WALLET_TOPUP_CATALOG[pkg];
  const purpose = stripePurposeForWalletTopup(pkg);
  const { token, amountCents: cents } = await createPaymentRecord(user.id, purpose);

  const { redirectUrl } = await initiateKosovoBankWalletPayment({
    user,
    paymentToken: token,
    purpose,
    amountCents: cents,
    origin,
  });

  await db
    .update(businessPaymentsTable)
    .set({ stripe_session_id: null })
    .where(eq(businessPaymentsTable.token, token));

  return {
    url: redirectUrl,
    token,
    sessionId: null,
    provider: "kosovo_bank",
  };
}

/** Call from Kosovo bank webhook when payment is confirmed (implement with bank docs). */
export async function fulfillWalletTopupFromKosovoBank(
  userId: number,
  purpose: string,
  paymentToken: string,
): Promise<void> {
  const { fulfillWalletTopupFromPayment } = await import("./wallet-stripe");
  await fulfillWalletTopupFromPayment(userId, purpose, paymentToken, {
    billingCountry: "XK",
    paymentChannel: "kosovo_bank",
  });
}
