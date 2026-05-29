import { CONTACT_INBOX } from "./send-contact-email";
import { deliverEmail } from "./send-transactional-email";

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
    "Për të aktivizuar llogarinë, përfundoni pagesën me kartë (lidhja që hapët pas regjistrimit).",
    "Pas pagesës, llogaria aktivizohet automatikisht dhe merrni email me kod aktivizimi.",
    "",
    "KetuJemi.com",
  ].join("\n");

  const html = `
    <p>Përshëndetje <strong>${escapeHtml(businessName)}</strong>,</p>
    <p>Faleminderit që u regjistruat si Partner në KetuJemi.com.</p>
    <p><strong>Paketa:</strong> ${escapeHtml(packageLabel)}</p>
    <p><strong>Përfundoni pagesën me kartë</strong> për të aktivizuar llogarinë automatikisht.</p>
    <p>Pas pagesës do të merrni email me kod aktivizimi dhe akses në panel.</p>
  `;

  await deliverEmail({ to: email, subject, text, html });
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

  await deliverEmail({
    to: CONTACT_INBOX,
    subject,
    text,
    html,
    replyTo: email,
  });
}

export async function sendPartnerUnpaidReminderEmail(opts: {
  to: string;
  businessName: string;
  packageLabel: string;
  payUrl: string;
  daysUnpaid: number;
}): Promise<void> {
  const { to, businessName, packageLabel, payUrl, daysUnpaid } = opts;
  const subject =
    daysUnpaid >= 15
      ? "Paralajmërim: pezullim pas 30 ditësh — KetuJemi Partner"
      : `Kujtesë pagesë Partner (${daysUnpaid} ditë) — KetuJemi`;
  const text = [
    `Përshëndetje ${businessName},`,
    "",
    `Paketa juaj ${packageLabel} në KetuJemi ende nuk është paguar (${daysUnpaid} ditë).`,
    "",
    `Përfundoni pagesën këtu: ${payUrl}`,
    "",
    "KetuJemi.com",
  ].join("\n");
  const html = `
    <p>Përshëndetje <strong>${escapeHtml(businessName)}</strong>,</p>
    <p>Paketa <strong>${escapeHtml(packageLabel)}</strong> nuk është paguar ende (${daysUnpaid} ditë).</p>
    <p><a href="${escapeHtml(payUrl)}">Përfundoni pagesën me kartë</a></p>
  `;
  await deliverEmail({ to, subject, text, html });
}

export async function sendPartnerSuspensionWarningEmail(opts: {
  to: string;
  businessName: string;
  packageLabel: string;
  payUrl: string;
}): Promise<void> {
  const { to, businessName, packageLabel, payUrl } = opts;
  const subject = "Llogaria Partner u pezullua — KetuJemi";
  const text = [
    `Përshëndetje ${businessName},`,
    "",
    `Pas 30 ditësh pa pagesë për ${packageLabel}, llogaria juaj Partner është pezulluar.`,
    `Për ta riaktivizuar, përfundoni pagesën: ${payUrl}`,
    "",
    "KetuJemi.com",
  ].join("\n");
  const html = `
    <p>Përshëndetje <strong>${escapeHtml(businessName)}</strong>,</p>
    <p>Llogaria Partner (<strong>${escapeHtml(packageLabel)}</strong>) u <strong>pezullua</strong> pas 30 ditësh pa pagesë.</p>
    <p><a href="${escapeHtml(payUrl)}">Përfundoni pagesën për riaktivizim</a></p>
  `;
  await deliverEmail({ to, subject, text, html });
}
