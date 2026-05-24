/** Vonage Verify for phone sign-up/login. Disabled by default until SMS_AUTH_ENABLED=true. */

export function hasSmsProviderCreds(): boolean {
  const apiKey = process.env.VONAGE_API_KEY?.trim();
  const apiSecret = process.env.VONAGE_API_SECRET?.trim();
  return Boolean(apiKey && apiSecret);
}

/**
 * Phone auth (SMS OTP). Default: off.
 * Set SMS_AUTH_ENABLED=true when Vonage (or a future Twilio adapter) is configured.
 */
export function isSmsAuthEnabled(): boolean {
  const raw = process.env.SMS_AUTH_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return hasSmsProviderCreds();
  return false;
}

export const SMS_AUTH_DISABLED_MESSAGE =
  "Regjistrimi me telefon është i çaktivizuar përkohësisht. Përdorni email.";
