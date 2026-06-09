/** Public support channels for chatbot and escalations. */

export const SUPPORT_EMAIL = "support@ketujemi.com";
export const SUPPORT_EMAIL_ALT = "info@ketujemi.com";

/**
 * Support phone shown in help chat («Ndihmë»).
 * Default is baked into code — no Railway variable required.
 * Optional override only: SUPPORT_PHONE=+38343555294
 */
export function getSupportPhoneDisplay(): string {
  const raw = process.env.SUPPORT_PHONE?.trim();
  if (!raw) return "+383 43 555 294";
  if (raw.startsWith("+")) return raw;
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("383") && digits.length >= 11) {
    return `+383 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`.trim();
  }
  return `+${digits}`;
}

import { langText, type LangCopy, type UiLang } from "./claude-client";

const SUPPORT_FALLBACK: LangCopy = {
  sq: `Kontakto: ${SUPPORT_EMAIL}`,
  mk: `Контактирајте: ${SUPPORT_EMAIL}`,
  me: `Kontaktirajte: ${SUPPORT_EMAIL}`,
  en: `Contact: ${SUPPORT_EMAIL}`,
};

export function supportFallbackLine(lang: UiLang): string {
  return langText(SUPPORT_FALLBACK, lang);
}
