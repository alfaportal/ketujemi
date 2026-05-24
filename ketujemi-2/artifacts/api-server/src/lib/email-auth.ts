/**
 * Email sign-up verification via Resend. On by default.
 * Set EMAIL_VERIFICATION_REQUIRED=false for instant sign-up without a code.
 */

export function hasResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function isEmailVerificationRequired(): boolean {
  const raw = process.env.EMAIL_VERIFICATION_REQUIRED?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  return true;
}
