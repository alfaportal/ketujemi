import { logger } from "./logger";
import { hasTwilioSmsCreds, toTwilioE164 } from "./twilio-sms";

/** Prefix stored in phone_verify_challenges.request_id for Twilio Verify. */
export const TWILIO_VERIFY_REQUEST_PREFIX = "twilio:";

export function isTwilioVerifyRequestId(requestId: string): boolean {
  return requestId.startsWith(TWILIO_VERIFY_REQUEST_PREFIX);
}

/** Requires TWILIO_VERIFY_SERVICE_SID (create in Twilio Console → Verify). */
export function hasTwilioVerifyCreds(): boolean {
  return hasTwilioSmsCreds() && Boolean(process.env.TWILIO_VERIFY_SERVICE_SID?.trim());
}

function twilioBasicAuth(): string {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

/**
 * Start SMS OTP via Twilio Verify v2.
 * Returns request_id like `twilio:VE...` for storage in phone_verify_challenges.
 */
export async function twilioVerifyRequest(phoneDigits: string): Promise<string> {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (!hasTwilioVerifyCreds() || !serviceSid) {
    throw new Error("TWILIO_VERIFY_NOT_CONFIGURED");
  }

  const body = new URLSearchParams({
    To: toTwilioE164(phoneDigits),
    Channel: "sms",
  });

  const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: twilioBasicAuth(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await res.json()) as {
    sid?: string;
    status?: string;
    message?: string;
  };

  if (!res.ok || !data.sid) {
    throw new Error(data.message ?? `Twilio verify start failed (${res.status})`);
  }

  logger.info({ phoneDigits: phoneDigits.slice(-4) }, "twilio verify started");
  return `${TWILIO_VERIFY_REQUEST_PREFIX}${data.sid}`;
}

export async function twilioVerifyCheck(
  _requestId: string,
  code: string,
  phoneDigits: string,
): Promise<void> {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (!hasTwilioVerifyCreds() || !serviceSid) {
    throw new Error("TWILIO_VERIFY_NOT_CONFIGURED");
  }

  const body = new URLSearchParams({
    To: toTwilioE164(phoneDigits),
    Code: code.trim(),
  });

  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
    {
      method: "POST",
      headers: {
        Authorization: twilioBasicAuth(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  const data = (await res.json()) as { status?: string; message?: string };

  if (!res.ok || data.status !== "approved") {
    throw new Error(data.message ?? `Invalid or expired code (${data.status ?? res.status})`);
  }
}
