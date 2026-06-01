/**
 * Phone OTP via Vonage Verify (Nexmo).
 * https://developer.vonage.com/en/verify/overview
 *
 * Legacy challenges with request_id `twilio:…` still complete via Twilio until they expire.
 */

import { logger } from "./logger";
import { hasVonageSmsCreds } from "./vonage-sms";
import {
  isTwilioVerifyRequestId,
  twilioVerifyCheck,
} from "./twilio-verify";

function getCreds(): { apiKey: string; apiSecret: string } {
  const apiKey = process.env.VONAGE_API_KEY?.trim();
  const apiSecret = process.env.VONAGE_API_SECRET?.trim();
  if (!apiKey || !apiSecret) {
    throw new Error("VONAGE_API_KEY and VONAGE_API_SECRET must be set");
  }
  return { apiKey, apiSecret };
}

function verifyBrand(): string {
  return process.env.VONAGE_VERIFY_BRAND?.trim() || "KetuJemi";
}

export async function runVonageVerifyRequestOnly(phoneDigits: string): Promise<string> {
  const { apiKey, apiSecret } = getCreds();
  const body = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    number: phoneDigits,
    brand: verifyBrand(),
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
    const detail = data.error_text ?? `status ${data.status ?? "?"}`;
    logger.error({ phoneDigits: phoneDigits.slice(-4), detail }, "vonage verify start failed");
    throw new Error(detail);
  }

  logger.info({ phoneDigits: phoneDigits.slice(-4) }, "vonage verify started");
  return data.request_id;
}

export async function runVonageVerifyCheckOnly(requestId: string, code: string): Promise<void> {
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

/** Start phone OTP — Vonage Verify only. */
export async function vonageVerifyRequest(phoneDigits: string): Promise<string> {
  if (!hasVonageSmsCreds()) {
    throw new Error(
      "SMS verification not configured. Set VONAGE_API_KEY and VONAGE_API_SECRET in Railway Variables.",
    );
  }
  if (!process.env.REDIS_URL?.trim()) {
    return runVonageVerifyRequestOnly(phoneDigits);
  }
  const { enqueueSmsVerifyRequest } = await import("../queues/jobQueue.js");
  return enqueueSmsVerifyRequest(phoneDigits);
}

/** Confirm OTP — Vonage; legacy `twilio:` request_id only for in-flight challenges. */
export async function vonageVerifyCheck(
  requestId: string,
  code: string,
  phoneDigits?: string,
): Promise<void> {
  if (isTwilioVerifyRequestId(requestId)) {
    if (!phoneDigits?.trim()) {
      throw new Error("Phone number required for legacy Twilio verification");
    }
    logger.warn({ requestId: requestId.slice(0, 12) }, "completing legacy twilio verify challenge");
    await twilioVerifyCheck(requestId, code, phoneDigits);
    return;
  }

  if (!process.env.REDIS_URL?.trim()) {
    await runVonageVerifyCheckOnly(requestId, code);
    return;
  }
  const { enqueueSmsVerifyCheck } = await import("../queues/jobQueue.js");
  await enqueueSmsVerifyCheck(requestId, code);
}
