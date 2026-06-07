import { deliverEmail, isTransactionalEmailConfigured } from "./send-transactional-email";

type VerifyMailPayload = {
  to: string;
  code: string;
  verifyUrl: string;
};

function ensureEmailConfigured(): void {
  if (!isTransactionalEmailConfigured()) {
    throw new Error("Email send failed: RESEND_API_KEY or SMTP not configured");
  }
}

export async function sendPasswordResetEmail(payload: VerifyMailPayload): Promise<void> {
  const { to, code } = payload;
  ensureEmailConfigured();

  const subject = "Rivendos fjalëkalimin — KetuJemi";
  const text = [
    "Keni kërkuar të ndryshoni fjalëkalimin.",
    "",
    `Kodi: ${code}`,
    "",
    "Vendoseni këtë kod në faqen e hyrjes së KetuJemi.",
    "",
    "Nëse nuk e keni kërkuar ju, injoroni këtë email.",
  ].join("\n");

  await deliverEmail({
    to,
    subject,
    text,
    html: `<p>Kodi për fjalëkalim të ri:</p><p><strong>${code}</strong></p>`,
  });
}

export async function sendEmailVerification(payload: VerifyMailPayload): Promise<void> {
  const { to, code, verifyUrl } = payload;
  ensureEmailConfigured();

  const subject = "Konfirmoni llogarinë — KetuJemi";
  const text = [
    "Për të aktivizuar llogarinë, klikoni lidhjen më poshtë ose vendosni kodin.",
    "",
    `Kodi: ${code}`,
    "",
    verifyUrl,
  ].join("\n");

  await deliverEmail({
    to,
    subject,
    text,
    html: `<p>Për të aktivizuar llogarinë:</p><p><strong>${code}</strong></p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
}

type PartnerActivationMailPayload = {
  to: string;
  businessName: string;
  activationCode: string;
  packageLabel: string;
  profileUrl: string;
};

export async function sendLoginSmsFallbackCodeEmail(payload: { to: string; code: string }): Promise<void> {
  const { to, code } = payload;
  ensureEmailConfigured();
  const subject = "Kodi i hyrjes — KetuJemi";
  const text = [
    "SMS nuk funksionoi — përdorni këtë kod për të hyrë në llogari:",
    "",
    `Kodi: ${code}`,
    "",
    "Nëse nuk e keni kërkuar ju, injoroni këtë email.",
  ].join("\n");
  await deliverEmail({
    to,
    subject,
    text,
    html: `<p>SMS nuk funksionoi — përdorni këtë kod për të hyrë:</p><p><strong>${code}</strong></p>`,
  });
}

export async function sendAdminLoginCodeEmail(payload: { to: string; code: string }): Promise<void> {
  const { to, code } = payload;
  ensureEmailConfigured();
  const subject = "Kodi i hyrjes në panel — KetuJemi";
  const text = [
    "Kodi për hyrje në panelin e administratorit:",
    "",
    `Kodi: ${code}`,
    "",
    "Kodi skadon pas 15 minutash.",
  ].join("\n");
  await deliverEmail({
    to,
    subject,
    text,
    html: `<p>Kodi për panelin e administratorit:</p><p><strong>${code}</strong></p>`,
  });
}

export async function sendProfileChangeCodeEmail(payload: { to: string; code: string }): Promise<void> {
  const { to, code } = payload;
  ensureEmailConfigured();
  const subject = "Konfirmoni ndryshimin e profilit — KetuJemi";
  const text = [
    "Për të ndryshuar të dhënat e profilit, vendosni këtë kod në faqen e profilit:",
    "",
    `Kodi: ${code}`,
    "",
    "Nëse nuk e keni kërkuar ju, injoroni këtë email.",
  ].join("\n");
  await deliverEmail({
    to,
    subject,
    text,
    html: `<p>Kodi për ndryshimin e profilit:</p><p><strong>${code}</strong></p>`,
  });
}

export async function sendPartnerActivationEmail(
  payload: PartnerActivationMailPayload,
): Promise<void> {
  const { to, businessName, activationCode, packageLabel, profileUrl } = payload;
  ensureEmailConfigured();

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

  await deliverEmail({ to, subject, text, html });
}
