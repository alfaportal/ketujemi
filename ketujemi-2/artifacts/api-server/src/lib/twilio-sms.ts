import { logger } from "./logger";
import {
  cleanTwilioEnv,
  getTwilioAuth,
  hasTwilioSmsCreds,
  parseTwilioJson,
  TwilioApiError,
  type TwilioAuth,
} from "./twilio-auth";

export { hasTwilioSmsCreds, hasTwilioApiCreds } from "./twilio-auth";

/** E.164 with leading + for Twilio REST API. */
export function toTwilioE164(phoneDigits: string): string {
  const digits = phoneDigits.replace(/\D/g, "");
  return `+${digits}`;
}

/**
 * Twilio Messages API send (queue worker).
 * Returns true when Twilio accepts the message (status queued/sent).
 */
export async function runTwilioSendSms(phoneDigits: string, text: string): Promise<boolean> {
  const auth = getTwilioAuth();
  const from = cleanTwilioEnv("TWILIO_PHONE_NUMBER");
  const accountSid = auth?.accountSid;

  if (!auth || !from || !accountSid) {
    logger.warn(
      { phoneDigits: phoneDigits.slice(-4), hasAuth: Boolean(auth), hasFrom: Boolean(from) },
      "twilio sms skipped (need AC+token or SK+secret, TWILIO_PHONE_NUMBER)",
    );
    return false;
  }

  try {
    await twilioPostForm(
      auth,
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        To: toTwilioE164(phoneDigits),
        From: from,
        Body: text.slice(0, 1600),
      },
    );
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    logger.error({ phoneDigits: phoneDigits.slice(-4), err: message }, "twilio sms failed");
    return false;
  }
}

/** Transactional SMS via Twilio — enqueued when REDIS_URL is set. */
export async function twilioSendSms(phoneDigits: string, text: string): Promise<boolean> {
  if (!process.env.REDIS_URL?.trim()) {
    return runTwilioSendSms(phoneDigits, text);
  }
  const { enqueueSms } = await import("../queues/jobQueue.js");
  await enqueueSms("twilio-send", { phoneDigits, text });
  return true;
}

export async function twilioPostForm(
  auth: TwilioAuth,
  url: string,
  fields: Record<string, string>,
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams(fields);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth.authorization,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await parseTwilioJson(res);
  if (!res.ok) {
    const message =
      typeof data.message === "string" ? data.message : `Twilio HTTP ${res.status}`;
    const code = typeof data.code === "number" ? data.code : undefined;
    throw new TwilioApiError(message, res.status, code);
  }
  return data;
}
