/** Phone sign-up/login via SMS OTP (Vonage Verify). */

import { hasVonageSmsCreds } from "./vonage-sms";

export function hasSmsProviderCreds(): boolean {
  return hasVonageSmsCreds();
}

export function hasSmsVerifyProviderCreds(): boolean {
  return hasVonageSmsCreds();
}

/**
 * Phone auth (SMS OTP). Default: off.
 * Set SMS_AUTH_ENABLED=true and VONAGE_API_KEY + VONAGE_API_SECRET.
 */
export function isSmsAuthEnabled(): boolean {
  const raw = process.env.SMS_AUTH_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return hasSmsVerifyProviderCreds();
  return false;
}

export const SMS_AUTH_DISABLED_MESSAGE =
  "Regjistrimi me telefon është i çaktivizuar përkohësisht. Përdorni email.";
