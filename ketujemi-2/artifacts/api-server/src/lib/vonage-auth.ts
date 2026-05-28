/** Vonage (Nexmo) API credentials — SMS + Verify OTP. */

import { hasVonageSmsCreds } from "./vonage-sms";

function maskKey(value: string | null | undefined): string {
  if (!value?.trim()) return "(unset)";
  const v = value.trim();
  if (v.length <= 6) return "****";
  return `${v.slice(0, 4)}…${v.slice(-2)}`;
}

export function vonageConfigSummary(): Record<string, string | boolean> {
  return {
    configured: hasVonageSmsCreds(),
    apiKey: maskKey(process.env.VONAGE_API_KEY),
    smsFrom: process.env.VONAGE_SMS_FROM?.trim() || "KetuJemi",
    verifyBrand: process.env.VONAGE_VERIFY_BRAND?.trim() || "KetuJemi",
    smsAuthEnabled:
      (process.env.SMS_AUTH_ENABLED?.trim().toLowerCase() === "true" ||
        process.env.SMS_AUTH_ENABLED?.trim() === "1") &&
      hasVonageSmsCreds(),
  };
}
