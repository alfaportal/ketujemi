/** UI languages (independent of market / currency). */
export const UI_LANGUAGES = [
  { code: "sq", flag: "🇦🇱", label: "Shqip", displayCode: "AL" },
  { code: "mk", flag: "🇲🇰", label: "Maqedonisht", displayCode: "MK" },
  { code: "mne", flag: "🇲🇪", label: "Malazisht", displayCode: "ME" },
] as const;

export type UiLang = (typeof UI_LANGUAGES)[number]["code"];

export const DEFAULT_UI_LANG: UiLang = "sq";

/** Maps UI language → translation bundle keys in `market-context` / `app-extra-i18n`. */
export function translationKeyForUiLang(uiLang: UiLang): "ks" | "mk" | "mne" {
  if (uiLang === "mk") return "mk";
  if (uiLang === "mne") return "mne";
  return "ks";
}

export function isUiLang(value: string): value is UiLang {
  return UI_LANGUAGES.some((l) => l.code === value);
}
