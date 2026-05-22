import { logger } from "./logger";
import { CONTACT_INBOX } from "./send-contact-email";

export type PartnerRegistrationEmailPayload = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  iban: string;
  packageLabel: string;
  logoUrl: string | null;
  linkUrl: string;
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendResendEmail(opts: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const from = process.env["EMAIL_FROM"]?.trim() ?? "KetuJemi <onboarding@ketujemi.com>";

  if (!apiKey) {
    logger.info({ to: opts.to, subject: opts.subject }, "partner registration email (no RESEND_API_KEY)");
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
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend email failed: ${res.status} ${body}`);
  }
}

/** Confirmation to the business after /partner registration. */
export async function sendPartnerRegistrationConfirmation(
  payload: PartnerRegistrationEmailPayload,
): Promise<void> {
  const { businessName, email, packageLabel } = payload;
  const subject = "Kërkesa juaj për Partner u pranua — KetuJemi";
  const text = [
    `Përshëndetje ${businessName},`,
    "",
    "Faleminderit që u regjistruat si Partner në KetuJemi.com.",
    `Paketa: ${packageLabel}`,
    "",
    "Kërkesa juaj është në pritje. Admini do t'ju aktivizojë brenda 24 orëve.",
    "Do të merrni një email kur llogaria të jetë gati.",
    "",
    "KetuJemi.com",
  ].join("\n");

  const html = `
    <p>Përshëndetje <strong>${escapeHtml(businessName)}</strong>,</p>
    <p>Faleminderit që u regjistruat si Partner në KetuJemi.com.</p>
    <p><strong>Paketa:</strong> ${escapeHtml(packageLabel)}</p>
    <p>Kërkesa juaj është në pritje. <strong>Admini do t'ju aktivizojë brenda 24 orëve.</strong></p>
    <p>Do të merrni një email kur llogaria të jetë gati.</p>
  `;

  await sendResendEmail({ to: [email], subject, text, html });
}

/** Internal notification to info@ketujemi.com. */
export async function sendPartnerRegistrationAdminNotify(
  payload: PartnerRegistrationEmailPayload & { applicationId: number; clientIp: string | null },
): Promise<void> {
  const {
    applicationId,
    businessName,
    contactName,
    email,
    phone,
    iban,
    packageLabel,
    logoUrl,
    linkUrl,
    clientIp,
  } = payload;

  const subject = `[Partner] Kërkesë e re #${applicationId} — ${businessName}`;
  const text = [
    `ID: ${applicationId}`,
    `Biznesi: ${businessName}`,
    `Kontakti: ${contactName}`,
    `Email: ${email}`,
    `Telefon: ${phone}`,
    `IBAN: ${iban}`,
    `Paketa: ${packageLabel}`,
    `Logo: ${logoUrl ?? "(pa logo)"}`,
    `Link: ${linkUrl}`,
    `IP: ${clientIp ?? "—"}`,
  ].join("\n");

  const html = `
    <p><strong>Kërkesë e re për Partner #${applicationId}</strong></p>
    <p><strong>Biznesi:</strong> ${escapeHtml(businessName)}</p>
    <p><strong>Kontakti:</strong> ${escapeHtml(contactName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
    <p><strong>IBAN:</strong> ${escapeHtml(iban)}</p>
    <p><strong>Paketa:</strong> ${escapeHtml(packageLabel)}</p>
    <p><strong>Logo:</strong> ${logoUrl ? `<a href="${escapeHtml(logoUrl)}">${escapeHtml(logoUrl)}</a>` : "—"}</p>
    <p><strong>Link:</strong> <a href="${escapeHtml(linkUrl)}">${escapeHtml(linkUrl)}</a></p>
    <p><strong>IP:</strong> ${escapeHtml(clientIp ?? "—")}</p>
  `;

  await sendResendEmail({
    to: [CONTACT_INBOX],
    subject,
    text,
    html,
    replyTo: email,
  });
}
