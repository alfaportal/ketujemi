import { CONTACT_INBOX } from "./send-contact-email";
import { deliverEmail } from "./send-transactional-email";
import type { PartnerApplicationBody } from "./partner-application";
import { packageLabelFromTier } from "./partner-application";

const DEBUG = "partner-application";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPartnerApplicationEmail(
  data: PartnerApplicationBody,
  clientIp: string | null,
): Promise<void> {
  const packageLabel = packageLabelFromTier(data.package);
  const subjectLine = `[KetuJemi Partner] Aplikim i ri — ${data.business_name} (${packageLabel})`;

  const text = [
    "Aplikim i ri për Partner / VIP Partner",
    "",
    `Emri i biznesit: ${data.business_name}`,
    `Personi i kontaktit: ${data.contact_name}`,
    `Email: ${data.email}`,
    `Telefon: ${data.phone}`,
    `Paketa: ${packageLabel}`,
    "",
    "Përshkrimi i biznesit:",
    data.description,
    "",
    clientIp ? `IP: ${clientIp}` : null,
    data.logo_base64 ? `Logo: bashkangjitur (${data.logo_filename})` : "Logo: nuk u ngarkua",
  ]
    .filter(Boolean)
    .join("\n");

  const html = [
    `<p><strong>Aplikim i ri për Partner / VIP Partner</strong></p>`,
    `<p><strong>Emri i biznesit:</strong> ${escapeHtml(data.business_name)}</p>`,
    `<p><strong>Personi i kontaktit:</strong> ${escapeHtml(data.contact_name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>`,
    `<p><strong>Telefon:</strong> ${escapeHtml(data.phone)}</p>`,
    `<p><strong>Paketa:</strong> ${escapeHtml(packageLabel)}</p>`,
    `<p><strong>Përshkrimi i biznesit:</strong></p>`,
    `<p>${escapeHtml(data.description).replace(/\n/g, "<br/>")}</p>`,
    clientIp ? `<p><strong>IP:</strong> ${escapeHtml(clientIp)}</p>` : "",
    data.logo_base64
      ? `<p><strong>Logo:</strong> bashkangjitur (${escapeHtml(data.logo_filename ?? "logo")})</p>`
      : `<p><strong>Logo:</strong> nuk u ngarkua</p>`,
  ].join("\n");

  const attachments =
    data.logo_base64 && data.logo_filename
      ? [
          {
            filename: data.logo_filename,
            content: Buffer.from(data.logo_base64, "base64"),
            contentType: data.logo_mime ?? undefined,
          },
        ]
      : undefined;

  await deliverEmail({
    to: CONTACT_INBOX,
    subject: subjectLine,
    text,
    html,
    replyTo: data.email,
    debugSource: DEBUG,
    attachments,
  });
}
