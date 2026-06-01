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
  /** Enables detailed console.log (e.g. contact form debugging). */
  debugSource?: string;
};

function debugLog(source: string | undefined, step: string, data?: Record<string, unknown>): void {
  if (!source) return;
  const prefix = `[${source}]`;
  if (data && Object.keys(data).length > 0) {
    console.log(prefix, step, data);
  } else {
    console.log(prefix, step);
  }
}

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
  if (!user || !pass) {
    debugLog(mail.debugSource, "SMTP skipped — EMAIL_USER or EMAIL_PASS not set");
    return false;
  }

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = defaultFrom();

  debugLog(mail.debugSource, "SMTP attempt", {
    host,
    port,
    secure,
    from,
    to: toList,
    subject: mail.subject,
    replyTo: mail.replyTo ?? null,
  });

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

  debugLog(mail.debugSource, "SMTP success");
  logger.info({ to: toList, subject: mail.subject }, "email sent (SMTP)");
  return true;
}

async function sendViaResend(mail: DeliverEmailOptions, toList: string[]): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    debugLog(mail.debugSource, "Resend skipped — RESEND_API_KEY not set");
    return false;
  }

  const from = defaultFrom();

  debugLog(mail.debugSource, "calling Resend API", {
    from,
    to: toList,
    subject: mail.subject,
    replyTo: mail.replyTo ?? null,
    apiKeyPresent: true,
    apiKeyLength: apiKey.length,
  });

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
    debugLog(mail.debugSource, "Resend API error", {
      status: res.status,
      statusText: res.statusText,
      body,
    });
    throw new Error(`Resend email failed: ${res.status} ${body}`);
  }

  const resendBody = await res.text().catch(() => "");
  debugLog(mail.debugSource, "Resend API success", {
    status: res.status,
    body: resendBody.slice(0, 500),
  });
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
 * Send email immediately (SMTP, then Resend). Used by queue workers.
 * Throws if nothing is configured or both providers fail.
 */
export async function deliverEmailNow(mail: DeliverEmailOptions): Promise<void> {
  const toList = recipients(mail.to);
  debugLog(mail.debugSource, "deliverEmail start", {
    to: toList,
    subject: mail.subject,
    replyTo: mail.replyTo ?? null,
  });

  if (toList.length === 0) {
    debugLog(mail.debugSource, "deliverEmail failed — no recipients");
    throw new Error("No email recipients");
  }

  try {
    if (await sendViaSmtp(mail, toList)) {
      debugLog(mail.debugSource, "deliverEmail done via SMTP");
      return;
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    debugLog(mail.debugSource, "SMTP threw — falling back to Resend", { error: errMsg });
    logger.warn({ err, to: toList, subject: mail.subject }, "SMTP failed — trying Resend");
  }

  if (await sendViaResend(mail, toList)) {
    debugLog(mail.debugSource, "deliverEmail done via Resend");
    return;
  }

  debugLog(mail.debugSource, "deliverEmail failed — no provider available");
  logger.error(
    { to: toList, subject: mail.subject },
    "email not sent — set RESEND_API_KEY and EMAIL_FROM (verified domain), or EMAIL_USER/EMAIL_PASS",
  );
  throw new Error("Email is not configured on the server");
}

/** Enqueue email for background delivery when REDIS_URL is set. */
export async function deliverEmail(mail: DeliverEmailOptions): Promise<void> {
  if (!process.env.REDIS_URL?.trim()) {
    return deliverEmailNow(mail);
  }
  const { enqueueEmail } = await import("../queues/jobQueue.js");
  await enqueueEmail(mail);
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
