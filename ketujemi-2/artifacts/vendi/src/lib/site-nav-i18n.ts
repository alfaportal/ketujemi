import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

const SITE_NAV: Record<UiTranslationLocale, { navBuySell: string; navShops: string; navHelp: string }> = {
  ks: { navBuySell: "Blej & Shite", navShops: "Bizneset", navHelp: "Ndihmë" },
  mk: { navBuySell: "Купи & Продај", navShops: "Бизниси", navHelp: "Помош" },
  mne: { navBuySell: "Kupi & Prodaj", navShops: "Biznisi", navHelp: "Pomoć" },
  en: { navBuySell: "Buy & Sell", navShops: "Businesses", navHelp: "Help" },
  fr: { navBuySell: "Acheter & Vendre", navShops: "Entreprises", navHelp: "Aide" },
  de: { navBuySell: "Kaufen & Verkaufen", navShops: "Unternehmen", navHelp: "Hilfe" },
  it: { navBuySell: "Compra & Vendi", navShops: "Business", navHelp: "Aiuto" },
};

/** Lightweight nav labels — avoids loading the full shop-directory i18n bundle in the header. */
export function useSiteNavCopy() {
  const { uiLang } = useMarket();
  return SITE_NAV[translationKeyForUiLang(uiLang)];
}
