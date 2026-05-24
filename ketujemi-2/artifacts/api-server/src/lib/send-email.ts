import { logger } from "./logger";

type VerifyMailPayload = {
  to: string;
  code: string;
  verifyUrl: string;
};

export async function sendEmailVerification(payload: VerifyMailPayload): Promise<void> {
  const { to, code, verifyUrl } = payload;
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const from = process.env["EMAIL_FROM"] ?? "KetuJemi <onboarding@ketujemi.com>";

  const subject = "Konfirmoni llogarinë — KetuJemi";
  const text = [
    "Për të aktivizuar llogarinë, klikoni lidhjen më poshtë ose vendosni kodin.",
    "",
    `Kodi: ${code}`,
    "",
    verifyUrl,
  ].join("\n");

  if (!apiKey) {
    logger.info({ to, code, verifyUrl }, "email verification (no RESEND_API_KEY — link logged)");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html: `<p>Për të aktivizuar llogarinë:</p><p><strong>${code}</strong></p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email send failed: ${res.status} ${body}`);
  }
}

type PartnerActivationMailPayload = {
  to: string;
  businessName: string;
  activationCode: string;
  packageLabel: string;
  profileUrl: string;
};

export async function sendPartnerActivationEmail(
  payload: PartnerActivationMailPayload,
): Promise<void> {
  const { to, businessName, activationCode, packageLabel, profileUrl } = payload;
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const from = process.env["EMAIL_FROM"] ?? "KetuJemi <onboarding@ketujemi.com>";

  const subject = `Llogaria juaj ${packageLabel} u aktivizua — KetuJemi`;
  const text = [
    `Përshëndetje ${businessName},`,
    "",
    `Llogaria juaj si ${packageLabel} në KetuJemi është aktivizuar.`,
    "",
    `Kodi i aktivizimit: ${activationCode}`,
    "",
    "Hyni në profilin tuaj dhe shtoni linkun (website, Instagram ose Facebook) dhe logon:",
    profileUrl,
    "",
    "Ky kod është për referencë tuaj; llogaria është tashmë aktive.",
    "",
    "KetuJemi",
  ].join("\n");

  const html = `
    <p>Përshëndetje <strong>${businessName}</strong>,</p>
    <p>Llogaria juaj si <strong>${packageLabel}</strong> në KetuJemi është aktivizuar.</p>
    <p style="font-size:22px;font-weight:bold;letter-spacing:4px;margin:16px 0">${activationCode}</p>
    <p><a href="${profileUrl}">Hap profilin dhe plotëso të dhënat</a></p>
    <p style="color:#666;font-size:13px">Ruajeni këtë kod për referencë.</p>
  `;

  if (!apiKey) {
    logger.info({ to, activationCode, profileUrl }, "partner activation email (no RESEND_API_KEY)");
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
    throw new Error(`Partner activation email failed: ${res.status} ${body}`);
  }
}
