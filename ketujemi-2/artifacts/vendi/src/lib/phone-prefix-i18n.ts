import type { UiTranslationLocale } from "@/lib/ui-languages";

const LABELS: Record<string, Record<UiTranslationLocale, string>> = {
  "383": {
    ks: "Kosovë",
    mk: "Косово",
    mne: "Kosovo",
    en: "Kosovo",
    fr: "Kosovo",
  },
  "355": {
    ks: "Shqipëri",
    mk: "Албанија",
    mne: "Albanija",
    en: "Albania",
    fr: "Albanie",
  },
  "389": {
    ks: "Maqedoni e Veriut",
    mk: "Северна Македонија",
    mne: "Sjeverna Makedonija",
    en: "North Macedonia",
    fr: "Macédoine du Nord",
  },
  "382": {
    ks: "Mal i Zi",
    mk: "Црна Гора",
    mne: "Crna Gora",
    en: "Montenegro",
    fr: "Monténégro",
  },
};

export function smsPhonePrefixLabel(dial: string, locale: UiTranslationLocale): string {
  return LABELS[dial]?.[locale] ?? dial;
}
