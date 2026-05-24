/**
 * Email sign-up verification (Resend). Off by default while SMS/Vonage is unavailable.
 * Set EMAIL_VERIFICATION_REQUIRED=true when verification emails are reliable.
 */
export function isEmailVerificationRequired(): boolean {
  const raw = process.env.EMAIL_VERIFICATION_REQUIRED?.trim().toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  return false;
}
