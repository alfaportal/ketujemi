import { Router } from "express";
import { isRecaptchaRequired } from "../lib/recaptcha-verify";
import { hasEmailDeliveryConfigured, isEmailVerificationRequired } from "../lib/email-auth";
import { isSmsAuthEnabled } from "../lib/sms-auth";
import { isFacebookOAuthEnabled, isInstagramOAuthEnabled, facebookPageUrl, instagramProfileUrl } from "../lib/meta-oauth-config";
import { isGoogleOAuthEnabled } from "../lib/google-oauth-config";
import { isB2UploadConfigured } from "../lib/b2-upload-presign";
import { paymentsConfigured, stripePublishableKey } from "../lib/payments";

const router = Router();

function resolveImageUploadProvider(): "b2" | "cloudinary" | null {
  if (isB2UploadConfigured()) return "b2";
  const cn =
    process.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    "";
  const preset =
    process.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() ||
    process.env.CLOUDINARY_UPLOAD_PRESET?.trim() ||
    "";
  if (cn && preset) return "cloudinary";
  return null;
}

/** Public runtime config (no secrets). Site key is safe to expose in the browser. */
router.get("/config/public", (_req, res) => {
  const recaptchaSiteKey =
    process.env.VITE_RECAPTCHA_SITE_KEY?.trim() ||
    process.env.RECAPTCHA_SITE_KEY?.trim() ||
    "";

  const cloudinaryCloudName =
    process.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    "";

  const cloudinaryUploadPreset =
    process.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() ||
    process.env.CLOUDINARY_UPLOAD_PRESET?.trim() ||
    "";

  res.json({
    recaptchaSiteKey,
    recaptchaRequired: isRecaptchaRequired(),
    imageUploadProvider: resolveImageUploadProvider(),
    stripeEnabled: paymentsConfigured(),
    stripePublishableKey: stripePublishableKey(),
    cloudinaryCloudName,
    cloudinaryUploadPreset,
    smsAuthEnabled: isSmsAuthEnabled(),
    emailVerificationRequired: isEmailVerificationRequired(),
    emailConfigured: hasEmailDeliveryConfigured(),
    facebookOAuthEnabled: isFacebookOAuthEnabled(),
    instagramOAuthEnabled: isInstagramOAuthEnabled(),
    googleOAuthEnabled: isGoogleOAuthEnabled(),
    facebookPageUrl: facebookPageUrl(),
    instagramProfileUrl: instagramProfileUrl(),
  });
});

export default router;
