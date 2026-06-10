import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type MyListingsMonthCopy = {
  loadError: string;
  resetsOn: string;
  emptyCategory: string;
  usedLabel: string;
};

const KS: MyListingsMonthCopy = {
  loadError: "Nuk u ngarkua historiku.",
  resetsOn: "Riniset më",
  emptyCategory: "Asnjë postim këtë muaj në këtë kategori.",
  usedLabel: "used",
};

const MK: MyListingsMonthCopy = {
  loadError: "Историјата не се вчита.",
  resetsOn: "Се ресетира на",
  emptyCategory: "Нема објави овој месец во оваа категорија.",
  usedLabel: "искористено",
};

const MNE: MyListingsMonthCopy = {
  loadError: "Historija nije učitana.",
  resetsOn: "Resetuje se",
  emptyCategory: "Nema objava ovog mjeseca u ovoj kategoriji.",
  usedLabel: "iskorišteno",
};

const EN: MyListingsMonthCopy = {
  loadError: "Could not load history.",
  resetsOn: "Resets on",
  emptyCategory: "No posts this month in this category.",
  usedLabel: "used",
};

const FR: MyListingsMonthCopy = {
  loadError: "Impossible de charger l'historique.",
  resetsOn: "Réinitialisation le",
  emptyCategory: "Aucune annonce ce mois-ci dans cette catégorie.",
  usedLabel: "utilisé",
};

const PAGES: Record<UiTranslationLocale, MyListingsMonthCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function useMyListingsMonthCopy(): MyListingsMonthCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
