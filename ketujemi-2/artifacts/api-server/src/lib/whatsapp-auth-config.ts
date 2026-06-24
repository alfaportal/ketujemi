/** Meta WhatsApp Cloud API — OTP regjistrimi/hyrjes. */

import { cleanMetaEnv, metaGraphVersion } from "./meta-oauth-config.js";

export function whatsappPhoneNumberId(): string | null {
  return cleanMetaEnv("WHATSAPP_PHONE_NUMBER_ID");
}

export function whatsappAccessToken(): string | null {
  return (
    cleanMetaEnv("WHATSAPP_CLOUD_API_ACCESS_TOKEN") ??
    cleanMetaEnv("WHATSAPP_ACCESS_TOKEN") ??
    cleanMetaEnv("WHATSAPP_CLOUD_API_TOKEN")
  );
}

/** Emri i template-it të aprovuar në Meta (Authentication / OTP). */
export function whatsappOtpTemplateName(): string | null {
  return cleanMetaEnv("WHATSAPP_OTP_TEMPLATE_NAME");
}

export function whatsappOtpTemplateLanguage(): string {
  return cleanMetaEnv("WHATSAPP_OTP_TEMPLATE_LANGUAGE") ?? "sq";
}

export function hasWhatsAppOtpCreds(): boolean {
  return Boolean(whatsappPhoneNumberId() && whatsappAccessToken() && whatsappOtpTemplateName());
}

/**
 * WhatsApp OTP për regjistrim/hyrje me telefon.
 * WHATSAPP_AUTH_ENABLED=true + WHATSAPP_PHONE_NUMBER_ID + token + WHATSAPP_OTP_TEMPLATE_NAME.
 */
export function isWhatsAppOtpEnabled(): boolean {
  const raw = process.env.WHATSAPP_AUTH_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  if (raw === "true" || raw === "1" || raw === "yes") return hasWhatsAppOtpCreds();
  return false;
}

/** preferred = WhatsApp first (fallback SMS); only = vetëm WhatsApp; off = vetëm SMS. */
export function whatsappOtpMode(): "preferred" | "only" | "off" {
  const raw = process.env.WHATSAPP_OTP_MODE?.trim().toLowerCase();
  if (raw === "only") return "only";
  if (raw === "off") return "off";
  if (raw === "preferred" || raw === "whatsapp_first" || raw === "first") return "preferred";
  return isWhatsAppOtpEnabled() ? "preferred" : "off";
}

export function whatsappGraphMessagesUrl(): string {
  const id = whatsappPhoneNumberId();
  if (!id) throw new Error("WHATSAPP_PHONE_NUMBER_ID not configured");
  return `https://graph.facebook.com/${metaGraphVersion()}/${encodeURIComponent(id)}/messages`;
}
