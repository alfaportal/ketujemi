import type { User } from "@workspace/db";
import { canIssueKosovoFiscalReceipts } from "./fiscal-kosovo/config";
import {
  kosovoBankManualTransferReady,
  kosovoBankProviderLive,
} from "./kosovo-bank-payments";
import { paymentsConfigured } from "./payments";
import type { Logger } from "pino";

/** How wallet top-up was (or will be) paid. */
export type PaymentChannel = "stripe" | "kosovo_bank";

/** Kosovo login phone (+383…) — used to route to local bank when that stack is live. */
export function isLikelyKosovoUser(user: User): boolean {
  const digits = user.phone_e164_digits?.trim();
  return Boolean(digits && digits.startsWith("383"));
}

/** Kosovo uses Stripe whenever checkout keys exist (same as other countries). */
export function kosovoStripeEnabled(): boolean {
  return paymentsConfigured();
}

/**
 * Wallet top-up channel.
 * Kosovo (+383) is NOT blocked: Stripe when STRIPE_* keys exist.
 * Local bank only if Stripe is off AND KOSOVO_WALLET_USE_BANK=true.
 */
export function resolveWalletTopupChannel(user: User): PaymentChannel {
  if (paymentsConfigured()) {
    return "stripe";
  }

  const useBank =
    isLikelyKosovoUser(user) &&
    process.env.KOSOVO_WALLET_USE_BANK?.trim().toLowerCase() === "true" &&
    (kosovoBankProviderLive() || kosovoBankManualTransferReady());

  if (useBank) {
    return "kosovo_bank";
  }

  return "stripe";
}

/** ATK / Enternet invoices only after bank + fiscal API — never for Stripe top-ups. */
export function fiscalAppliesToWalletTopup(channel: PaymentChannel): boolean {
  return channel === "kosovo_bank" && canIssueKosovoFiscalReceipts();
}

export function logPaymentStackReadiness(logger: Logger): void {
  logger.info(
    {
      stripeCheckout: paymentsConfigured(),
      kosovoStripe: kosovoStripeEnabled() && paymentsConfigured(),
      kosovoBankManual: kosovoBankManualTransferReady(),
      kosovoBankApi: kosovoBankProviderLive(),
      fiscalInvoices: canIssueKosovoFiscalReceipts(),
      note: "Kosovo uses Stripe by default; set KOSOVO_WALLET_USE_BANK=true for local bank",
    },
    "payment stack readiness",
  );
}
