import type { UiLang } from "./ui-languages";

/** API lang for listing AI (category suggest, photo analyze, polish). */
export type ListingApiLang = "sq" | "mk" | "me" | "en";

export function listingApiLangFromUi(uiLang: UiLang): ListingApiLang {
  if (uiLang === "en") return "en";
  if (uiLang === "mk") return "mk";
  if (uiLang === "mne") return "me";
  return "sq";
}
