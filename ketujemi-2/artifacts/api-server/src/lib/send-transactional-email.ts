import nodemailer from "nodemailer";
import { logger } from "./logger";

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type DeliverEmailOptions = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

function recipients(to: string | string[]): string[] {
  const list = Array.isArray(to) ? to : [to];
  return list.map((x) => x.trim()).filter(Boolean);
}

function defaultFrom(): string {
  const user = process.env.EMAIL_USER?.trim();
  return (
    process.env.EMAIL_FROM?.trim() ||
    (user ? `KetuJemi <${user}>` : "KetuJemi <onboarding@ketujemi.com>")
  );
}

async function sendViaSmtp(mail: DeliverEmailOptions, toList: string[]): Promise<boolean> {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) return false;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = defaultFrom();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: toList.join(", "),
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });

  logger.info({ to: toList, subject: mail.subject }, "email sent (SMTP)");
  return true;
}

async function sendViaResend(mail: DeliverEmailOptions, toList: string[]): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from = defaultFrom();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: toList,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend email failed: ${res.status} ${body}`);
  }

  logger.info({ to: toList, subject: mail.subject }, "email sent (Resend)");
  return true;
}

export function isTransactionalEmailConfigured(): boolean {
  return !!(
    (process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim()) ||
    process.env.RESEND_API_KEY?.trim()
  );
}

/**
 * Deliver email via SMTP, then Resend on SMTP failure or when SMTP is not set.
 * Throws if nothing is configured or both providers fail.
 */
export async function deliverEmail(mail: DeliverEmailOptions): Promise<void> {
  const toList = recipients(mail.to);
  if (toList.length === 0) {
    throw new Error("No email recipients");
  }

  try {
    if (await sendViaSmtp(mail, toList)) return;
  } catch (err) {
    logger.warn({ err, to: toList, subject: mail.subject }, "SMTP failed — trying Resend");
  }

  if (await sendViaResend(mail, toList)) return;

  logger.error(
    { to: toList, subject: mail.subject },
    "email not sent — set RESEND_API_KEY and EMAIL_FROM (verified domain), or EMAIL_USER/EMAIL_PASS",
  );
  throw new Error("Email is not configured on the server");
}

/** User-facing email (SMTP preferred, then Resend). Returns false if not configured. */
export async function sendTransactionalEmail(mail: TransactionalEmail): Promise<boolean> {
  if (!isTransactionalEmailConfigured()) {
    logger.warn(
      { to: mail.to, subject: mail.subject },
      "transactional email skipped — no RESEND_API_KEY or SMTP credentials",
    );
    return false;
  }

  try {
    await deliverEmail(mail);
    return true;
  } catch (err) {
    logger.error({ err, to: mail.to, subject: mail.subject }, "transactional email failed");
    return false;
  }
}
