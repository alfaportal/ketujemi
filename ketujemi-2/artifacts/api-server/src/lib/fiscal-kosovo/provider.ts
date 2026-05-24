import {
  fiscalApiConfigured,
  fiscalKosovoEnabled,
  fiscalProviderId,
  FISCAL_LEGAL,
} from "./config";
import type { FiscalIssueInput, FiscalIssueResult } from "./types";

/**
 * Placeholder provider — replace body with Enternet / certified SEF HTTP API
 * once credentials and API docs are available.
 */
export async function issueFiscalReceiptViaProvider(
  input: FiscalIssueInput,
): Promise<FiscalIssueResult> {
  if (!fiscalKosovoEnabled()) {
    throw new Error("FISCAL_DISABLED");
  }

  const provider = fiscalProviderId();

  if (provider === "enternet" && fiscalApiConfigured()) {
    return issueViaEnternetApi(input);
  }

  if (fiscalApiConfigured()) {
    return issueViaGenericApi(input);
  }

  // Dev / pre-integration: deterministic stub (not valid for ATK)
  const stubId = `STUB-${input.paymentToken.slice(0, 8).toUpperCase()}`;
  return {
    fiscalNumber: stubId,
    qrPayload: `https://www.ketujemi.com/fiscal/verify?token=${encodeURIComponent(input.paymentToken)}`,
    pdfUrl: null,
    providerRef: `placeholder:${provider}`,
  };
}

async function issueViaGenericApi(input: FiscalIssueInput): Promise<FiscalIssueResult> {
  const baseUrl = process.env.FISCAL_KOSOVO_API_URL!.replace(/\/$/, "");
  const apiKey = process.env.FISCAL_KOSOVO_API_KEY!;

  const res = await fetch(`${baseUrl}/receipts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      seller: FISCAL_LEGAL,
      payment_token: input.paymentToken,
      purpose: input.purpose,
      amount_cents: input.amountCents,
      receipt_type: input.receiptType,
      description: input.lineDescription,
      payment_method: input.paymentMethod,
      customer: {
        email: input.customerEmail,
        name: input.customerName,
        nui: input.customerNui,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`FISCAL_API_${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    fiscal_number?: string;
    qr?: string;
    pdf_url?: string;
    reference?: string;
  };

  if (!data.fiscal_number?.trim()) {
    throw new Error("FISCAL_API_MISSING_NUMBER");
  }

  return {
    fiscalNumber: data.fiscal_number.trim(),
    qrPayload: data.qr?.trim() ?? null,
    pdfUrl: data.pdf_url?.trim() ?? null,
    providerRef: data.reference?.trim() ?? null,
  };
}

/** Map to Enternet API when documentation is provided — same shape as generic for now. */
async function issueViaEnternetApi(input: FiscalIssueInput): Promise<FiscalIssueResult> {
  return issueViaGenericApi(input);
}
