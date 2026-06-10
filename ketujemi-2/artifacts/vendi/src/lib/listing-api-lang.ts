import type { UiLang } from "./ui-languages";

/** API lang for listing AI (category suggest, photo analyze, polish). */
export type ListingApiLang = "sq" | "mk" | "me" | "en" | "fr" | "de" | "it";

export function listingApiLangFromUi(uiLang: UiLang): ListingApiLang {
  if (uiLang === "en") return "en";
  if (uiLang === "fr") return "fr";
  if (uiLang === "de") return "de";
  if (uiLang === "it") return "it";
  if (uiLang === "mk") return "mk";
  if (uiLang === "mne") return "me";
  return "sq";
}
