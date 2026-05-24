import { eq } from "drizzle-orm";
import { db, fiscalReceiptsTable, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { WALLET_TOPUP_CATALOG, type WalletTopupId } from "../wallet";
import { logger } from "../logger";
import {
  fiscalKosovoEnabled,
  fiscalProviderId,
  fiscalVatPercent,
} from "./config";
import { sendFiscalReceiptEmail } from "./email";
import { isKosovoBillingCountry } from "./market";
import { issueFiscalReceiptViaProvider } from "./provider";
import type { FiscalReceiptType } from "./types";

export type WalletFiscalContext = {
  /** Stripe billing or card country (ISO 3166-1 alpha-2), e.g. XK, DE. */
  billingCountry?: string | null;
};

function walletTopupDescription(pkg: WalletTopupId): string {
  const def = WALLET_TOPUP_CATALOG[pkg];
  return `Kredit portofoli KetuJemi — ${def.listings} shpallje (€${def.price_eur})`;
}

function receiptTypeForUser(user: User): FiscalReceiptType {
  if (user.account_type === "business" && user.business_name?.trim()) {
    return "tax_invoice";
  }
  return "fiscal_coupon";
}

/**
 * Issue fiscal document after wallet top-up is credited.
 * Only when Stripe confirms Kosovo (XK) — foreign cards skip fiscal (status=skipped).
 */
export async function issueFiscalReceiptForWalletTopup(
  userId: number,
  purpose: string,
  paymentToken: string,
  ctx: WalletFiscalContext = {},
): Promise<void> {
  const pkg = purpose.replace("wallet_topup_", "") as WalletTopupId;
  if (!(pkg in WALLET_TOPUP_CATALOG)) return;

  const amountCents = WALLET_TOPUP_CATALOG[pkg].price_cents;

  const [existing] = await db
    .select({ id: fiscalReceiptsTable.id, status: fiscalReceiptsTable.status })
    .from(fiscalReceiptsTable)
    .where(eq(fiscalReceiptsTable.payment_token, paymentToken))
    .limit(1);

  if (existing && existing.status !== "pending") {
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) return;

  const receiptType = receiptTypeForUser(user);
  const customerEmail = user.email?.trim() || null;

  const needsKosovoFiscal = isKosovoBillingCountry(ctx.billingCountry);

  if (!existing) {
    let status = "skipped";
    if (fiscalKosovoEnabled() && needsKosovoFiscal) status = "pending";

    await db.insert(fiscalReceiptsTable).values({
      user_id: userId,
      payment_token: paymentToken,
      purpose,
      amount_cents: amountCents,
      receipt_type: receiptType,
      status,
      customer_email: customerEmail,
      provider: fiscalProviderId(),
    });
  }

  if (!fiscalKosovoEnabled()) {
    logger.info({ paymentToken }, "fiscal skipped (FISCAL_KOSOVO_ENABLED=false)");
    return;
  }

  if (!needsKosovoFiscal) {
    logger.info(
      {
        paymentToken,
        billingCountry: ctx.billingCountry ?? null,
      },
      "fiscal skipped (Stripe: card/billing outside Kosovo)",
    );
    return;
  }

  const lineDescription = walletTopupDescription(pkg);

  try {
    const result = await issueFiscalReceiptViaProvider({
      paymentToken,
      purpose,
      amountCents,
      receiptType,
      customerEmail,
      customerName: user.display_name?.trim() || user.business_name?.trim() || null,
      customerNui: null,
      lineDescription,
      paymentMethod: "card",
    });

    const now = new Date();
    await db
      .update(fiscalReceiptsTable)
      .set({
        status: "issued",
        fiscal_number: result.fiscalNumber,
        qr_payload: result.qrPayload,
        pdf_url: result.pdfUrl,
        provider_ref: result.providerRef,
        issued_at: now,
        error_message: null,
      })
      .where(eq(fiscalReceiptsTable.payment_token, paymentToken));

    if (customerEmail) {
      const amountEur = (amountCents / 100).toFixed(2);
      await sendFiscalReceiptEmail({
        to: customerEmail,
        amountEur,
        receiptType,
        fiscalNumber: result.fiscalNumber,
        qrPayload: result.qrPayload,
        pdfUrl: result.pdfUrl,
      });
    }

    logger.info(
      { paymentToken, fiscalNumber: result.fiscalNumber, vatPercent: fiscalVatPercent() },
      "fiscal receipt issued",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "FISCAL_UNKNOWN";
    await db
      .update(fiscalReceiptsTable)
      .set({
        status: "failed",
        error_message: message.slice(0, 500),
      })
      .where(eq(fiscalReceiptsTable.payment_token, paymentToken));

    logger.error({ err, paymentToken, userId }, "fiscal receipt failed");
  }
}
