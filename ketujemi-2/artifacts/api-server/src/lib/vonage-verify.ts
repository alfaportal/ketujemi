/** Vonage Verify (Nexmo) with Twilio Verify fallback — https://developer.vonage.com/en/verify/overview */

import { logger } from "./logger";
import { hasVonageSmsCreds } from "./vonage-sms";
import {
  hasTwilioVerifyCreds,
  isTwilioVerifyRequestId,
  twilioVerifyCheck,
  twilioVerifyRequest,
} from "./twilio-verify";

function getCreds(): { apiKey: string; apiSecret: string } {
  const apiKey = process.env.VONAGE_API_KEY?.trim();
  const apiSecret = process.env.VONAGE_API_SECRET?.trim();
  if (!apiKey || !apiSecret) {
    throw new Error("VONAGE_API_KEY and VONAGE_API_SECRET must be set");
  }
  return { apiKey, apiSecret };
}

async function vonageVerifyRequestOnly(phoneDigits: string): Promise<string> {
  const { apiKey, apiSecret } = getCreds();
  const body = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    number: phoneDigits,
    brand: "KetuJemi",
  });

  const res = await fetch("https://api.nexmo.com/verify/json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as {
    request_id?: string;
    status?: string;
    error_text?: string;
  };

  if (String(data.status) !== "0" || !data.request_id) {
    throw new Error(data.error_text ?? `Vonage verify start failed (status ${data.status})`);
  }

  return data.request_id;
}

async function vonageVerifyCheckOnly(requestId: string, code: string): Promise<void> {
  const { apiKey, apiSecret } = getCreds();
  const body = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    request_id: requestId,
    code: code.trim(),
  });

  const res = await fetch("https://api.nexmo.com/verify/check/json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as { status?: string; error_text?: string };

  if (String(data.status) !== "0") {
    throw new Error(data.error_text ?? `Invalid or expired code (status ${data.status})`);
  }
}

function preferTwilioForVerify(): boolean {
  const raw = process.env.SMS_PREFER_TWILIO?.trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

/** Start phone OTP — Vonage first (unless SMS_PREFER_TWILIO), Twilio Verify fallback. */
export async function vonageVerifyRequest(phoneDigits: string): Promise<string> {
  if (hasTwilioVerifyCreds() && preferTwilioForVerify()) {
    return twilioVerifyRequest(phoneDigits);
  }

  if (hasVonageSmsCreds()) {
    try {
      return await vonageVerifyRequestOnly(phoneDigits);
    } catch (err) {
      const message = err instanceof Error ? err.message : "VONAGE_VERIFY_FAILED";
      logger.warn(
        { phoneDigits: phoneDigits.slice(-4), err: message },
        "vonage verify failed — trying twilio",
      );
      if (!hasTwilioVerifyCreds()) throw err;
    }
  }

  if (hasTwilioVerifyCreds()) {
    return twilioVerifyRequest(phoneDigits);
  }

  throw new Error(
    hasVonageSmsCreds()
      ? "SMS verification unavailable (Vonage failed; configure TWILIO_VERIFY_SERVICE_SID for Twilio fallback)"
      : "SMS verification not configured (VONAGE or TWILIO_VERIFY_SERVICE_SID)",
  );
}

/** Confirm OTP — routes by request_id prefix (Twilio vs Vonage). */
export async function vonageVerifyCheck(
  requestId: string,
  code: string,
  phoneDigits?: string,
): Promise<void> {
  if (isTwilioVerifyRequestId(requestId)) {
    if (!phoneDigits?.trim()) {
      throw new Error("Phone number required for Twilio verification");
    }
    await twilioVerifyCheck(requestId, code, phoneDigits);
    return;
  }

  await vonageVerifyCheckOnly(requestId, code);
}
