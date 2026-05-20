import type { UiLang } from "./claude-client";

/** Guess UI language from E.164 digits (no +). */
export function inferUiLangFromPhoneDigits(digits: string | null | undefined): UiLang {
  if (!digits) return "sq";
  if (digits.startsWith("389")) return "mk";
  if (digits.startsWith("382")) return "me";
  return "sq";
}
