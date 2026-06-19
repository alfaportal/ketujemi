/** UI languages (independent of market / currency). */
export const UI_LANGUAGES = [
  { code: "sq",    flag: "🇽🇰", flagIso: "xk", label: "Shqip",       displayCode: "XK" },
  { code: "sq-al", flag: "🇦🇱", flagIso: "al", label: "Shqip",       displayCode: "AL" },
  { code: "mk",    flag: "🇲🇰", flagIso: "mk", label: "Maqedonisht", displayCode: "MK" },
  { code: "mne",   flag: "🇲🇪", flagIso: "me", label: "Malazisht",   displayCode: "ME" },
  { code: "en",    flag: "🇬🇧", flagIso: "gb", label: "English",     displayCode: "GB" },
  { code: "fr",    flag: "🇫🇷", flagIso: "fr", label: "Français",    displayCode: "FR" },
  { code: "de",    flag: "🇩🇪", flagIso: "de", label: "Deutsch",     displayCode: "DE" },
  { code: "it",    flag: "🇮🇹", flagIso: "it", label: "Italiano",    displayCode: "IT" },
] as const;

/** Returns a reliable flag image URL that renders on Windows (no emoji font needed). */
export function flagImgUrl(flagIso: string): string {
  return `https://flagcdn.com/w40/${flagIso}.png`;
}

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
  // sq-al = Albanian (Albania) — same translations as Kosovo Albanian
  return "ks";
}

/** Returns the market code that best matches a UI language selection. */
export function marketCodeForUiLang(uiLang: UiLang): string | null {
  if (uiLang === "sq")    return "ks";
  if (uiLang === "sq-al") return "al";
  if (uiLang === "mk")    return "mk";
  if (uiLang === "mne")   return "mne";
  return null;
}

export function isUiLang(value: string): value is UiLang {
  return UI_LANGUAGES.some((l) => l.code === value);
}
