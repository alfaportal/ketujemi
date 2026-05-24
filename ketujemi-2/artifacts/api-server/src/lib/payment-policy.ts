import type { User } from "@workspace/db";
import { canIssueKosovoFiscalReceipts } from "./fiscal-kosovo/config";
import { kosovoBankPaymentsReady } from "./kosovo-bank-payments";
import { paymentsConfigured } from "./payments";
import type { Logger } from "pino";

/** How wallet top-up was (or will be) paid. */
export type PaymentChannel = "stripe" | "kosovo_bank";

/** Kosovo login phone (+383…) — used to route to local bank when that stack is live. */
export function isLikelyKosovoUser(user: User): boolean {
  const digits = user.phone_e164_digits?.trim();
  return Boolean(digits && digits.startsWith("383"));
}

/**
 * While bank is off → everyone uses Stripe.
 * When bank is on → Kosovo users → bank redirect; others keep Stripe.
 */
export function resolveWalletTopupChannel(user: User): PaymentChannel {
  if (kosovoBankPaymentsReady() && isLikelyKosovoUser(user)) {
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
      kosovoBank: kosovoBankPaymentsReady(),
      fiscalInvoices: canIssueKosovoFiscalReceipts(),
      note: "Stripe active now; enable KOSOVO_BANK_* then FISCAL_* after Enternet + bank account",
    },
    "payment stack readiness",
  );
}
