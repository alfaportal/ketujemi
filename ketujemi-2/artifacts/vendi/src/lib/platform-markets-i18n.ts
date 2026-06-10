import { translationKeyForUiLang, type UiTranslationLocale, type UiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";

/** Home markets (3) + diaspora (8) — matches HOME_MARKET_CODES + DIASPORA_MARKET_CODES. */
export type PlatformMarketsCopy = {
  /** Short list for bullets: KS/AL/MK + 8 diaspora */
  regionsShort: string;
  /** “Available in …” (open shop, features) */
  availableIn: string;
};

const COPY: Record<UiTranslationLocale, PlatformMarketsCopy> = {
  ks: {
    regionsShort:
      "Kosovë, Shqipëri, Maqedoni e Veriut dhe 8 tregje të diasporës shqiptare (Gjermani, Zvicër, Austri, Francë, Itali, Angli, SHBA, Mal i Zi)",
    availableIn:
      "E disponueshme në Kosovë, Shqipëri, Maqedoni e Veriut dhe 8 tregje të diasporës shqiptare",
  },
  mk: {
    regionsShort:
      "Косово, Албанија, Северна Македонија и 8 пазари од дијаспората (Германија, Швајцарија, Австрија, Франција, Италија, Англија, САД, Црна Гора)",
    availableIn:
      "Достапно во Косово, Албанија, Северна Македонија и 8 пазари од дијаспората",
  },
  mne: {
    regionsShort:
      "Kosovo, Albanija, Sjeverna Makedonija i 8 tržišta dijaspore (Njemačka, Švicarska, Austrija, Francuska, Italija, Engleska, SAD, Crna Gora)",
    availableIn:
      "Dostupno na Kosovu, u Albaniji, Sjevernoj Makedoniji i 8 tržišta dijaspore",
  },
  en: {
    regionsShort:
      "Kosovo, Albania, North Macedonia and 8 diaspora markets (Germany, Switzerland, Austria, France, Italy, UK, USA, Montenegro)",
    availableIn:
      "Available in Kosovo, Albania, North Macedonia and 8 diaspora markets",
  },
  fr: {
    regionsShort:
      "Kosovo, Albanie, Macédoine du Nord et 8 marchés de la diaspora (Allemagne, Suisse, Autriche, France, Italie, Royaume-Uni, États-Unis, Monténégro)",
    availableIn:
      "Disponible au Kosovo, en Albanie, en Macédoine du Nord et sur 8 marchés de la diaspora",
  },
  de: {
    regionsShort:
      "Kosovo, Albanien, Nordmazedonien und 8 Diaspora-Märkte (Deutschland, Schweiz, Österreich, Frankreich, Italien, Großbritannien, USA, Montenegro)",
    availableIn:
      "Verfügbar in Kosovo, Albanien, Nordmazedonien und 8 Diaspora-Märkten",
  },
  it: {
    regionsShort:
      "Kosovo, Albania, Macedonia del Nord e 8 mercati della diaspora (Germania, Svizzera, Austria, Francia, Italia, Regno Unito, USA, Montenegro)",
    availableIn:
      "Disponibile in Kosovo, Albania, Macedonia del Nord e 8 mercati della diaspora",
  },
};

export function platformMarketsForLocale(locale: UiTranslationLocale): PlatformMarketsCopy {
  return COPY[locale];
}

export function usePlatformMarkets(): PlatformMarketsCopy {
  const { uiLang } = useMarket();
  return platformMarketsForLocale(translationKeyForUiLang(uiLang));
}

/** For non-React modules (e.g. static page copy at build time). */
export function platformMarketsForUiLang(uiLang: UiLang): PlatformMarketsCopy {
  return platformMarketsForLocale(translationKeyForUiLang(uiLang));
}
