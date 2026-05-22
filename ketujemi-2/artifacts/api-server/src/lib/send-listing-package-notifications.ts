import type { User } from "@workspace/db";
import { logger } from "./logger";
import { sendListingPackageConfirmationEmail } from "./send-listing-package-email";
import {
  buildListingPackageActivationSms,
  normalizeSmsPhoneDigits,
  vonageSendSms,
} from "./vonage-sms";

export type ListingPackageNotifyPayload = {
  user: User;
  packageName: string;
  extraSlots: number;
  effectiveLimit: number;
  expiresAt: Date;
  activationCode: string;
};

/** SMS primary; email secondary when address exists. */
export async function notifyListingPackageActivated(
  payload: ListingPackageNotifyPayload,
): Promise<{ sms_sent: boolean; email_sent: boolean }> {
  const { user, packageName, extraSlots, effectiveLimit, expiresAt, activationCode } = payload;
  const displayName = user.display_name?.trim() || "Përdorues";

  let sms_sent = false;
  const phone =
    normalizeSmsPhoneDigits(user.phone_e164_digits) ??
    normalizeSmsPhoneDigits(user.contact_phone);

  if (phone) {
    try {
      sms_sent = await vonageSendSms(phone, buildListingPackageActivationSms(activationCode));
    } catch (err) {
      logger.error({ err, userId: user.id }, "listing package activation sms failed");
    }
  } else {
    logger.warn({ userId: user.id }, "listing package activation sms skipped (no phone)");
  }

  let email_sent = false;
  const email = user.email?.trim();
  if (email) {
    try {
      await sendListingPackageConfirmationEmail({
        to: email,
        displayName,
        packageName,
        extraSlots,
        effectiveLimit,
        expiresAt,
        activationCode,
      });
      email_sent = true;
    } catch (err) {
      logger.error({ err, userId: user.id }, "listing package confirmation email failed");
    }
  }

  return { sms_sent, email_sent };
}
