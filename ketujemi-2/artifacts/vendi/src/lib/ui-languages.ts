/** UI languages (independent of market / currency). */
export const UI_LANGUAGES = [
  { code: "sq", flag: "🇦🇱", label: "Shqip", displayCode: "AL" },
  { code: "mk", flag: "🇲🇰", label: "Maqedonisht", displayCode: "MK" },
  { code: "mne", flag: "🇲🇪", label: "Malazisht", displayCode: "ME" },
  { code: "en", flag: "🇬🇧", label: "English", displayCode: "EN" },
  { code: "fr", flag: "🇫🇷", label: "Français", displayCode: "FR" },
  { code: "de", flag: "🇩🇪", label: "Deutsch", displayCode: "DE" },
  { code: "it", flag: "🇮🇹", label: "Italiano", displayCode: "IT" },
] as const;

export type UiLang = (typeof UI_LANGUAGES)[number]["code"];

export const DEFAULT_UI_LANG: UiLang = "sq";

/** UI language → translation bundle keys in `market-context` / `app-extra-i18n`. */
export type UiTranslationLocale = "ks" | "mk" | "mne" | "en" | "fr" | "de" | "it";

/** Maps UI language → translation bundle keys in `market-context` / `app-extra-i18n`. */
export function translationKeyForUiLang(uiLang: UiLang): UiTranslationLocale {
  if (uiLang === "mk") return "mk";
  if (uiLang === "mne") return "mne";
  if (uiLang === "en") return "en";
  if (uiLang === "fr") return "fr";
  if (uiLang === "de") return "de";
  if (uiLang === "it") return "it";
  return "ks";
}

export function isUiLang(value: string): value is UiLang {
  return UI_LANGUAGES.some((l) => l.code === value);
}
