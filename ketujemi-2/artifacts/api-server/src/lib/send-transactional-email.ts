import nodemailer from "nodemailer";
import { logger } from "./logger";

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

async function sendViaSmtp(mail: TransactionalEmail): Promise<boolean> {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) return false;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = process.env.EMAIL_FROM?.trim() || `KetuJemi <${user}>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });

  logger.info({ to: mail.to, subject: mail.subject }, "transactional email sent (SMTP)");
  return true;
}

async function sendViaResend(mail: TransactionalEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from = process.env.EMAIL_FROM?.trim() || "KetuJemi <onboarding@ketujemi.com>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend transactional email failed: ${res.status} ${body}`);
  }

  logger.info({ to: mail.to, subject: mail.subject }, "transactional email sent (Resend)");
  return true;
}

export function isTransactionalEmailConfigured(): boolean {
  return !!(
    (process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim()) ||
    process.env.RESEND_API_KEY?.trim()
  );
}

/** User-facing email (SMTP preferred, then Resend). */
export async function sendTransactionalEmail(mail: TransactionalEmail): Promise<boolean> {
  if (await sendViaSmtp(mail)) return true;
  if (await sendViaResend(mail)) return true;

  logger.warn(
    { to: mail.to, subject: mail.subject },
    "transactional email not sent — set EMAIL_USER/EMAIL_PASS or RESEND_API_KEY",
  );
  return false;
}
