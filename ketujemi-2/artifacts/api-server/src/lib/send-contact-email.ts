import { deliverEmail } from "./send-transactional-email";

export const CONTACT_INBOX =
  process.env.CONTACT_INBOX?.trim() || "info@ketujemi.com";

export type ContactFormPayload = {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
};

function buildContactBodies(payload: ContactFormPayload) {
  const { fromName, fromEmail, subject, message } = payload;
  const subjectLine = `[KetuJemi Kontakt] ${subject}`;
  const text = [
    `Emri: ${fromName}`,
    `Email: ${fromEmail}`,
    `Subjekti: ${subject}`,
    "",
    message,
  ].join("\n");
  const html = [
    `<p><strong>Emri:</strong> ${escapeHtml(fromName)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(fromEmail)}</p>`,
    `<p><strong>Subjekti:</strong> ${escapeHtml(subject)}</p>`,
    `<hr/>`,
    `<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
  ].join("\n");
  return { subjectLine, text, html };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Deliver contact form to CONTACT_INBOX (SMTP, then Resend). */
export async function sendContactFormEmail(payload: ContactFormPayload): Promise<void> {
  const { subjectLine, text, html } = buildContactBodies(payload);

  await deliverEmail({
    to: CONTACT_INBOX,
    subject: subjectLine,
    text,
    html,
    replyTo: payload.fromEmail,
  });
}
