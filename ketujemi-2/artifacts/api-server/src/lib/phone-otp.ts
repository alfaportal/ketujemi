/** Unified phone OTP — WhatsApp Cloud API (Meta) dhe/ose Vonage SMS. */

import { logger } from "./logger.js";
import { isSmsAuthEnabled } from "./sms-auth.js";
import {
  isWhatsAppOtpEnabled,
  whatsappOtpMode,
} from "./whatsapp-auth-config.js";
import {
  isWhatsAppVerifyRequestId,
  startWhatsAppOtpChallenge,
  verifyWhatsAppOtpCode,
} from "./whatsapp-otp.js";
import { vonageVerifyCheck, vonageVerifyRequest } from "./vonage-verify.js";
import { isTwilioVerifyRequestId } from "./twilio-verify.js";

export type PhoneOtpChannel = "whatsapp" | "sms";

export function isPhoneOtpAuthEnabled(): boolean {
  return isSmsAuthEnabled() || isWhatsAppOtpEnabled();
}

export const PHONE_OTP_DISABLED_MESSAGE =
  "Regjistrimi me telefon është i çaktivizuar. Përdorni email ose aktivizoni WhatsApp/SMS në server.";

function parsePreferredChannel(raw: unknown): PhoneOtpChannel | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (v === "whatsapp" || v === "wa") return "whatsapp";
  if (v === "sms") return "sms";
  return null;
}

export function resolvePhoneOtpChannel(preferred?: unknown): PhoneOtpChannel {
  const want = parsePreferredChannel(preferred);
  const wa = isWhatsAppOtpEnabled();
  const sms = isSmsAuthEnabled();
  const mode = whatsappOtpMode();

  if (want === "whatsapp" && wa) return "whatsapp";
  if (want === "sms" && sms) return "sms";

  if (mode === "only" && wa) return "whatsapp";
  if (mode === "off" || !wa) {
    if (sms) return "sms";
    if (wa) return "whatsapp";
    throw new Error("PHONE_OTP_NOT_CONFIGURED");
  }

  if (wa) return "whatsapp";
  if (sms) return "sms";
  throw new Error("PHONE_OTP_NOT_CONFIGURED");
}

export async function startPhoneOtpChallenge(
  phoneDigits: string,
  preferredChannel?: unknown,
): Promise<{ requestId: string; otpCodeHash: string | null; channel: PhoneOtpChannel }> {
  let channel = resolvePhoneOtpChannel(preferredChannel);
  const mode = whatsappOtpMode();
  const sms = isSmsAuthEnabled();

  const tryWhatsApp = async () => {
    const wa = await startWhatsAppOtpChallenge(phoneDigits);
    return {
      requestId: wa.requestId,
      otpCodeHash: wa.otpCodeHash,
      channel: "whatsapp" as const,
    };
  };

  const trySms = async () => {
    const requestId = await vonageVerifyRequest(phoneDigits);
    return { requestId, otpCodeHash: null, channel: "sms" as const };
  };

  if (channel === "whatsapp") {
    try {
      return await tryWhatsApp();
    } catch (err) {
      if (sms && mode === "preferred") {
        logger.warn({ err, phoneTail: phoneDigits.slice(-4) }, "whatsapp otp failed; fallback sms");
        return await trySms();
      }
      throw err;
    }
  }

  return await trySms();
}

export async function verifyPhoneOtpChallenge(
  challenge: { request_id: string; otp_code_hash?: string | null },
  code: string,
  phoneDigits: string,
): Promise<void> {
  if (isWhatsAppVerifyRequestId(challenge.request_id)) {
    await verifyWhatsAppOtpCode(challenge.otp_code_hash, code);
    return;
  }

  if (isTwilioVerifyRequestId(challenge.request_id)) {
    await vonageVerifyCheck(challenge.request_id, code, phoneDigits);
    return;
  }

  await vonageVerifyCheck(challenge.request_id, code, phoneDigits);
}
