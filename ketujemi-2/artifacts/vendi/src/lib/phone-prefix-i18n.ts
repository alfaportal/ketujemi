import type { UiTranslationLocale } from "@/lib/ui-languages";

const LABELS: Record<string, Record<UiTranslationLocale, string>> = {
  "383": {
    ks: "Kosovë",
    mk: "Косово",
    mne: "Kosovo",
    en: "Kosovo",
    fr: "Kosovo",
    de: "Kosovo",
    it: "Kosovo",
  },
  "355": {
    ks: "Shqipëri",
    mk: "Албанија",
    mne: "Albanija",
    en: "Albania",
    fr: "Albanie",
    de: "Albanien",
    it: "Albania",
  },
  "389": {
    ks: "Maqedoni e Veriut",
    mk: "Северна Македонија",
    mne: "Sjeverna Makedonija",
    en: "North Macedonia",
    fr: "Macédoine du Nord",
    de: "Nordmazedonien",
    it: "Macedonia del Nord",
  },
  "382": {
    ks: "Mal i Zi",
    mk: "Црна Гора",
    mne: "Crna Gora",
    en: "Montenegro",
    fr: "Monténégro",
    de: "Montenegro",
    it: "Montenegro",
  },
};

export function smsPhonePrefixLabel(dial: string, locale: UiTranslationLocale): string {
  return LABELS[dial]?.[locale] ?? dial;
}
