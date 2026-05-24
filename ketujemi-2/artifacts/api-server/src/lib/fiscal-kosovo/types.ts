export type FiscalReceiptType = "fiscal_coupon" | "tax_invoice";

export type FiscalIssueInput = {
  paymentToken: string;
  purpose: string;
  amountCents: number;
  receiptType: FiscalReceiptType;
  customerEmail: string | null;
  customerName: string | null;
  /** Business buyer NUI when available (future profile field). */
  customerNui: string | null;
  lineDescription: string;
  paymentMethod: "card";
};

export type FiscalIssueResult = {
  fiscalNumber: string;
  qrPayload: string | null;
  pdfUrl: string | null;
  providerRef: string | null;
};
