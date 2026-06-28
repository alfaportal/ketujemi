/** Unified phone OTP — WhatsApp Cloud API only (SMS/Vonage disabled). */

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  isWhatsAppOtpEnabled,
} from "./whatsapp-auth-config.js";
import { generateOTP, sendWhatsAppOTP } from "./whatsapp-otp.js";

export type PhoneOtpChannel = "whatsapp";

const WHATSAPP_VERIFY_REQUEST_PREFIX = "whatsapp:";

export function isWhatsAppVerifyRequestId(requestId: string): boolean {
  return requestId.startsWith(WHATSAPP_VERIFY_REQUEST_PREFIX);
}

async function verifyWhatsAppOtpCode(
  otpCodeHash: string | null | undefined,
  code: string,
): Promise<void> {
  if (!otpCodeHash?.trim()) {
    throw new Error("WhatsApp verification challenge invalid");
  }
  const ok = await bcrypt.compare(code.trim(), otpCodeHash);
  if (!ok) {
    throw new Error("Invalid or expired code");
  }
}

export function isPhoneOtpAuthEnabled(): boolean {
  return isWhatsAppOtpEnabled();
}

export const PHONE_OTP_DISABLED_MESSAGE =
  "Regjistrimi me telefon kërkon WhatsApp. Përdorni email ose aktivizoni WhatsApp OTP në server.";

export function resolvePhoneOtpChannel(_preferred?: unknown): PhoneOtpChannel {
  if (!isWhatsAppOtpEnabled()) {
    throw new Error("PHONE_OTP_NOT_CONFIGURED");
  }
  return "whatsapp";
}

export async function startPhoneOtpChallenge(
  phoneDigits: string,
  preferredChannel?: unknown,
): Promise<{ requestId: string; otpCodeHash: string | null; channel: PhoneOtpChannel }> {
  if (typeof preferredChannel === "string" && preferredChannel.trim().toLowerCase() === "sms") {
    throw new Error("SMS_OTP_DISABLED");
  }
  if (!isWhatsAppOtpEnabled()) {
    throw new Error("PHONE_OTP_NOT_CONFIGURED");
  }

  const code = generateOTP();
  const ok = await sendWhatsAppOTP(phoneDigits, code);
  if (!ok) {
    throw new Error("WhatsApp OTP send failed");
  }
  const otpCodeHash = await bcrypt.hash(code, 10);
  return {
    requestId: `${WHATSAPP_VERIFY_REQUEST_PREFIX}${randomUUID()}`,
    otpCodeHash,
    channel: "whatsapp",
  };
}

export async function verifyPhoneOtpChallenge(
  challenge: { request_id: string; otp_code_hash?: string | null },
  code: string,
  _phoneDigits: string,
): Promise<void> {
  if (!isWhatsAppVerifyRequestId(challenge.request_id)) {
    throw new Error("Legacy SMS verification is no longer supported. Request a new WhatsApp code.");
  }
  await verifyWhatsAppOtpCode(challenge.otp_code_hash, code);
}
