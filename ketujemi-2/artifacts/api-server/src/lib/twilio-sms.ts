import { logger } from "./logger";

export function hasTwilioSmsCreds(): boolean {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_PHONE_NUMBER?.trim();
  return Boolean(accountSid && authToken && from);
}

function twilioBasicAuth(): string | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken) return null;
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

/** E.164 with leading + for Twilio REST API. */
export function toTwilioE164(phoneDigits: string): string {
  const digits = phoneDigits.replace(/\D/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/**
 * Transactional SMS via Twilio Messages API.
 * Returns true when Twilio accepts the message (status queued/sent).
 */
export async function twilioSendSms(phoneDigits: string, text: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const from = process.env.TWILIO_PHONE_NUMBER?.trim();
  const auth = twilioBasicAuth();

  if (!accountSid || !from || !auth) {
    logger.warn({ phoneDigits: phoneDigits.slice(-4) }, "twilio sms skipped (no TWILIO creds)");
    return false;
  }

  const body = new URLSearchParams({
    To: toTwilioE164(phoneDigits),
    From: from,
    Body: text.slice(0, 1600),
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  const data = (await res.json()) as { sid?: string; message?: string; code?: number };

  if (res.ok && data.sid) {
    return true;
  }

  logger.error(
    { phoneDigits: phoneDigits.slice(-4), code: data.code, message: data.message },
    "twilio sms failed",
  );
  return false;
}
