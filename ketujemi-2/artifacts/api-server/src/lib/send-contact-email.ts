import nodemailer from "nodemailer";
import { logger } from "./logger";

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

async function sendViaNodemailer(payload: ContactFormPayload): Promise<boolean> {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) return false;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from =
    process.env.EMAIL_FROM?.trim() || `KetuJemi <${user}>`;

  const { subjectLine, text, html } = buildContactBodies(payload);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: CONTACT_INBOX,
    replyTo: `${payload.fromName} <${payload.fromEmail}>`,
    subject: subjectLine,
    text,
    html,
  });

  logger.info({ to: CONTACT_INBOX }, "contact form email sent (SMTP)");
  return true;
}

async function sendViaResend(payload: ContactFormPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from = process.env.EMAIL_FROM?.trim() || "KetuJemi <onboarding@ketujemi.com>";
  const { subjectLine, text, html } = buildContactBodies(payload);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [CONTACT_INBOX],
      reply_to: payload.fromEmail,
      subject: subjectLine,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend contact email failed: ${res.status} ${body}`);
  }

  logger.info({ to: CONTACT_INBOX }, "contact form email sent (Resend)");
  return true;
}

/** Deliver contact form to CONTACT_INBOX (SMTP preferred, then Resend). */
export async function sendContactFormEmail(payload: ContactFormPayload): Promise<void> {
  if (await sendViaNodemailer(payload)) return;
  if (await sendViaResend(payload)) return;

  logger.warn(
    { to: CONTACT_INBOX, from: payload.fromEmail },
    "contact form not sent — set EMAIL_USER/EMAIL_PASS or RESEND_API_KEY",
  );
  throw new Error("Email is not configured on the server");
}
