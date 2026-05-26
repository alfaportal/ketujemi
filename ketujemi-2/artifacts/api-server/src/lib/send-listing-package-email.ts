import { logger } from "./logger";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendListingPackageConfirmationEmail(opts: {
  to: string;
  displayName: string;
  packageName: string;
  creditEur: string;
  listingsApprox: number;
  balanceEur: string;
  listingsRemaining: number;
  activationCode: string;
}): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const from = process.env["EMAIL_FROM"]?.trim() ?? "KetuJemi <onboarding@ketujemi.com>";
  const {
    to,
    displayName,
    packageName,
    creditEur,
    listingsApprox,
    balanceEur,
    listingsRemaining,
    activationCode,
  } = opts;

  const subject = `${packageName} u aktivizua — KetuJemi`;
  const text = [
    `Përshëndetje ${displayName},`,
    "",
    `Faleminderit për blerjen e ${packageName}!`,
    "",
    `€${creditEur} u shtuan në portofolin tuaj (~${listingsApprox} shpallje @ €0.30).`,
    `Kredi nuk skadon — përdoret deri sa ta harxhoni.`,
    `Balanca aktuale: €${balanceEur} (~${listingsRemaining} shpallje).`,
    "",
    `Kodi juaj i aktivizimit: ${activationCode}`,
    "(SMS-i kryesor u dërgua në telefonin tuaj. Kodi mund të përdoret edhe në pajisje tjetër — e njëjta llogari.)",
    "",
    "Mund të postoni menjëherë në KetuJemi.com.",
    "",
    "KetuJemi",
  ].join("\n");

  const html = `
    <p>Përshëndetje <strong>${escapeHtml(displayName)}</strong>,</p>
    <p><strong>${escapeHtml(packageName)}</strong> u aktivizua me sukses.</p>
    <ul>
      <li><strong>€${escapeHtml(creditEur)}</strong> në portofol (~${listingsApprox} shpallje @ €0.30)</li>
      <li>Kredi deri sa ta harxhoni — pa afat kohor</li>
      <li>Balanca: <strong>€${escapeHtml(balanceEur)}</strong> (~${listingsRemaining} shpallje)</li>
    </ul>
    <p style="font-size:18px;font-weight:bold;letter-spacing:2px;margin:16px 0">${escapeHtml(activationCode)}</p>
    <p style="color:#666;font-size:13px">Kodi u dërgua edhe me SMS. Për pajisje tjetër — e njëjta llogari.</p>
    <p>Mund të postoni menjëherë.</p>
  `;

  if (!apiKey) {
    logger.info({ to, activationCode }, "listing package email (no RESEND_API_KEY)");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Listing package email failed: ${res.status} ${body}`);
  }
}
