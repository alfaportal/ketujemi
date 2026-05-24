import { logger } from "./logger";
import {
  cleanTwilioEnv,
  getTwilioAuth,
  hasTwilioApiCreds,
  TwilioApiError,
} from "./twilio-auth";
import { toTwilioE164, twilioPostForm } from "./twilio-sms";

/** Prefix stored in phone_verify_challenges.request_id for Twilio Verify. */
export const TWILIO_VERIFY_REQUEST_PREFIX = "twilio:";

export function isTwilioVerifyRequestId(requestId: string): boolean {
  return requestId.startsWith(TWILIO_VERIFY_REQUEST_PREFIX);
}

/** Verify v2 — needs API creds + service SID only (no From phone). */
export function hasTwilioVerifyCreds(): boolean {
  return hasTwilioApiCreds() && Boolean(cleanTwilioEnv("TWILIO_VERIFY_SERVICE_SID"));
}

/**
 * Start SMS OTP via Twilio Verify v2 (REST, not SDK).
 * Returns request_id like `twilio:VE...` for storage in phone_verify_challenges.
 */
export async function twilioVerifyRequest(phoneDigits: string): Promise<string> {
  const serviceSid = cleanTwilioEnv("TWILIO_VERIFY_SERVICE_SID");
  const auth = getTwilioAuth();

  if (!auth || !serviceSid) {
    throw new Error("TWILIO_VERIFY_NOT_CONFIGURED");
  }

  if (!serviceSid.startsWith("VA")) {
    logger.warn({ serviceSid: `${serviceSid.slice(0, 4)}…` }, "TWILIO_VERIFY_SERVICE_SID should start with VA");
  }

  try {
    const data = await twilioPostForm(
      auth,
      `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
      {
        To: toTwilioE164(phoneDigits),
        Channel: "sms",
      },
    );

    const sid = typeof data.sid === "string" ? data.sid : null;
    if (!sid) {
      throw new Error("Twilio verify start failed (no sid in response)");
    }

    logger.info({ phoneDigits: phoneDigits.slice(-4), authMode: auth.mode }, "twilio verify started");
    return `${TWILIO_VERIFY_REQUEST_PREFIX}${sid}`;
  } catch (err) {
    if (err instanceof TwilioApiError && err.isAuthFailure) {
      throw new Error(
        "Twilio Authenticate (20003): kontrollo TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN (AC… + token), ose TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET (SK…). Mos i përziej me Verify Service SID (VA…).",
      );
    }
    throw err;
  }
}

export async function twilioVerifyCheck(
  _requestId: string,
  code: string,
  phoneDigits: string,
): Promise<void> {
  const serviceSid = cleanTwilioEnv("TWILIO_VERIFY_SERVICE_SID");
  const auth = getTwilioAuth();

  if (!auth || !serviceSid) {
    throw new Error("TWILIO_VERIFY_NOT_CONFIGURED");
  }

  const data = await twilioPostForm(
    auth,
    `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
    {
      To: toTwilioE164(phoneDigits),
      Code: code.trim(),
    },
  );

  if (data.status !== "approved") {
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : `Invalid or expired code (${String(data.status ?? "pending")})`,
    );
  }
}
