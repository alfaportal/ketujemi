import { deliverEmail, isTransactionalEmailConfigured } from "./send-transactional-email";

const DEBUG = "contact-form";

export const CONTACT_INBOX =
  process.env.CONTACT_INBOX?.trim() || "info@ketujemi.com";

export type ContactFormPayload = {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
};

/** Log email env (never log secrets in full). */
export function logContactEmailEnv(step: string): void {
  const emailFrom = process.env.EMAIL_FROM?.trim() ?? "";
  const resendKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const smtpUser = process.env.EMAIL_USER?.trim() ?? "";

  console.log(`[${DEBUG}]`, step, {
    CONTACT_INBOX,
    EMAIL_FROM: emailFrom || "(not set — default KetuJemi <onboarding@ketujemi.com>)",
    RESEND_API_KEY: resendKey ? `set (${resendKey.length} chars)` : "(not set)",
    SMTP: smtpUser ? `configured (user ${smtpUser})` : "(not set)",
    emailConfigured: isTransactionalEmailConfigured(),
  });
}

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
  logContactEmailEnv("sendContactFormEmail — env snapshot");

  const { subjectLine, text, html } = buildContactBodies(payload);

  console.log(`[${DEBUG}]`, "built email bodies", {
    to: CONTACT_INBOX,
    subject: subjectLine,
    fromName: payload.fromName,
    fromEmail: payload.fromEmail,
    messageLength: payload.message.length,
  });

  console.log(`[${DEBUG}]`, "calling deliverEmail (SMTP first, then Resend)");

  try {
    await deliverEmail({
      to: CONTACT_INBOX,
      subject: subjectLine,
      text,
      html,
      replyTo: payload.fromEmail,
      debugSource: DEBUG,
    });
    console.log(`[${DEBUG}]`, "sendContactFormEmail completed successfully");
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errStack = err instanceof Error ? err.stack : undefined;
    console.error(`[${DEBUG}]`, "sendContactFormEmail failed", {
      error: errMsg,
      stack: errStack,
    });
    throw err;
  }
}
