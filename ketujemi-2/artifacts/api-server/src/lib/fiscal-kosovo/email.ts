import { sendTransactionalEmail } from "../send-transactional-email";
import { FISCAL_LEGAL } from "./config";
import type { FiscalReceiptType } from "./types";

export async function sendFiscalReceiptEmail(opts: {
  to: string;
  amountEur: string;
  receiptType: FiscalReceiptType;
  fiscalNumber: string;
  qrPayload: string | null;
  pdfUrl: string | null;
}): Promise<void> {
  const docLabel =
    opts.receiptType === "tax_invoice" ? "Faturë tatimore" : "Kupon fiskal";
  const qrBlock = opts.qrPayload
    ? `<p>Verifikimi (QR/link): <a href="${escapeHtml(opts.qrPayload)}">${escapeHtml(opts.qrPayload)}</a></p>`
    : "";
  const pdfBlock = opts.pdfUrl
    ? `<p><a href="${escapeHtml(opts.pdfUrl)}">Shkarko PDF</a></p>`
    : "";

  await sendTransactionalEmail({
    to: opts.to,
    subject: `${docLabel} — KetuJemi portofol €${opts.amountEur}`,
    text: [
      `${docLabel} për mbushjen e portofolit në ketujemi.com`,
      ``,
      `Operator: ${FISCAL_LEGAL.name}, NRB ${FISCAL_LEGAL.nrb}`,
      `Shuma: €${opts.amountEur}`,
      `Nr. fiskal: ${opts.fiscalNumber}`,
      opts.qrPayload ? `Verifikim: ${opts.qrPayload}` : "",
      opts.pdfUrl ? `PDF: ${opts.pdfUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <p>Përshëndetje,</p>
      <p>Ja ${docLabel.toLowerCase()} për pagesën tuaj te <strong>ketujemi.com</strong> (portofol).</p>
      <ul>
        <li><strong>Operator:</strong> ${escapeHtml(FISCAL_LEGAL.name)} (NRB ${escapeHtml(FISCAL_LEGAL.nrb)})</li>
        <li><strong>Shuma:</strong> €${escapeHtml(opts.amountEur)}</li>
        <li><strong>Nr. fiskal:</strong> ${escapeHtml(opts.fiscalNumber)}</li>
      </ul>
      ${qrBlock}
      ${pdfBlock}
      <p style="color:#666;font-size:12px">Ruajeni këtë email për referencë.</p>
    `,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
