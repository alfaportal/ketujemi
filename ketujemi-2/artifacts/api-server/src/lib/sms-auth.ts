/** Phone sign-up/login via SMS OTP (Vonage Verify, Twilio Verify fallback). */

import { hasVonageSmsCreds } from "./vonage-sms";
import { hasTwilioApiCreds, hasTwilioSmsCreds } from "./twilio-sms";
import { hasTwilioVerifyCreds } from "./twilio-verify";

export function hasSmsProviderCreds(): boolean {
  return hasVonageSmsCreds() || hasTwilioSmsCreds() || hasTwilioApiCreds();
}

/** At least one OTP provider: Vonage Verify or Twilio Verify service. */
export function hasSmsVerifyProviderCreds(): boolean {
  return hasVonageSmsCreds() || hasTwilioVerifyCreds();
}

/**
 * Phone auth (SMS OTP). Default: off.
 * Set SMS_AUTH_ENABLED=true when Vonage and/or Twilio Verify is configured.
 */
export function isSmsAuthEnabled(): boolean {
  const raw = process.env.SMS_AUTH_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return hasSmsVerifyProviderCreds();
  return false;
}

export const SMS_AUTH_DISABLED_MESSAGE =
  "Regjistrimi me telefon është i çaktivizuar përkohësisht. Përdorni email.";
