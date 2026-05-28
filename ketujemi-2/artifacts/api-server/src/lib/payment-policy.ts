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

/** Kosovo users may pay with Stripe when keys are set (default ON). */
export function kosovoStripeEnabled(): boolean {
  return process.env.KOSOVO_STRIPE_ENABLED?.trim().toLowerCase() !== "false";
}

/**
 * Kosovo (+383): Stripe when configured (cards from KS + diaspora).
 * Local bank only when explicitly chosen via KOSOVO_WALLET_USE_BANK=true
 * and manual transfer or live bank API is ready.
 */
export function resolveWalletTopupChannel(user: User): PaymentChannel {
  if (!isLikelyKosovoUser(user)) {
    return "stripe";
  }

  const useBank =
    process.env.KOSOVO_WALLET_USE_BANK?.trim().toLowerCase() === "true";
  if (
    useBank &&
    (kosovoBankProviderLive() || kosovoBankManualTransferReady())
  ) {
    return "kosovo_bank";
  }

  if (kosovoStripeEnabled() && paymentsConfigured()) {
    return "stripe";
  }

  if (kosovoBankManualTransferReady() || kosovoBankProviderLive()) {
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
