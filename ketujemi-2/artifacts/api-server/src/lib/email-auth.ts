/**
 * Email sign-up verification. On by default.
 * Set EMAIL_VERIFICATION_REQUIRED=false for instant sign-up without a code.
 */

import { isTransactionalEmailConfigured } from "./send-transactional-email";

/** @deprecated Use hasEmailDeliveryConfigured */
export function hasResendConfigured(): boolean {
  return hasEmailDeliveryConfigured();
}

export function hasEmailDeliveryConfigured(): boolean {
  return isTransactionalEmailConfigured();
}

export function isEmailVerificationRequired(): boolean {
  const raw = process.env.EMAIL_VERIFICATION_REQUIRED?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  return true;
}
