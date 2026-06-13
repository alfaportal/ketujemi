import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

const SITE_NAV: Record<UiTranslationLocale, { navBuySell: string; navShops: string; navHelp: string }> = {
  ks: { navBuySell: "Bli & Shit", navShops: "Dyqanet", navHelp: "Ndihmë" },
  mk: { navBuySell: "Купи & Продај", navShops: "Продавници", navHelp: "Помош" },
  mne: { navBuySell: "Kupi & Prodaj", navShops: "Prodavnice", navHelp: "Pomoć" },
  en: { navBuySell: "Buy & Sell", navShops: "Shops", navHelp: "Help" },
  fr: { navBuySell: "Acheter & Vendre", navShops: "Boutiques", navHelp: "Aide" },
  de: { navBuySell: "Kaufen & Verkaufen", navShops: "Shops", navHelp: "Hilfe" },
  it: { navBuySell: "Compra & Vendi", navShops: "Negozi", navHelp: "Aiuto" },
};

/** Lightweight nav labels — avoids loading the full shop-directory i18n bundle in the header. */
export function useSiteNavCopy() {
  const { uiLang } = useMarket();
  return SITE_NAV[translationKeyForUiLang(uiLang)];
}
