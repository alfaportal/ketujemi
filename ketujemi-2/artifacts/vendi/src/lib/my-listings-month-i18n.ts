import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type MyListingsMonthCopy = {
  sectionTitle: string;
  loadError: string;
  freeLimitNote: string;
  resetsOn: string;
  emptyCategory: string;
  usedLabel: string;
  genericError: string;
};

const KS: MyListingsMonthCopy = {
  sectionTitle: "Njoftimet e mia këtë muaj",
  loadError: "Nuk u ngarkua historiku.",
  freeLimitNote: "Limiti falas ({limit} për kategori) riniset më {date} (ora 00:00 UTC).",
  resetsOn: "Riniset më",
  emptyCategory: "Asnjë postim këtë muaj në këtë kategori.",
  usedLabel: "used",
  genericError: "Gabim.",
};

const MK: MyListingsMonthCopy = {
  sectionTitle: "Мои огласи овој месец",
  loadError: "Историјата не се вчита.",
  freeLimitNote: "Бесплатниот лимит ({limit} по категорија) се ресетира на {date} (00:00 UTC).",
  resetsOn: "Се ресетира на",
  emptyCategory: "Нема објави овој месец во оваа категорија.",
  usedLabel: "искористено",
  genericError: "Грешка.",
};

const MNE: MyListingsMonthCopy = {
  sectionTitle: "Moji oglasi ovog mjeseca",
  loadError: "Historija nije učitana.",
  freeLimitNote: "Besplatni limit ({limit} po kategoriji) resetuje se {date} (00:00 UTC).",
  resetsOn: "Resetuje se",
  emptyCategory: "Nema objava ovog mjeseca u ovoj kategoriji.",
  usedLabel: "iskorišteno",
  genericError: "Greška.",
};

const EN: MyListingsMonthCopy = {
  sectionTitle: "My Listings This Month",
  loadError: "Could not load history.",
  freeLimitNote: "Free limit ({limit} per category) resets on {date} (00:00 UTC).",
  resetsOn: "Resets on",
  emptyCategory: "No posts this month in this category.",
  usedLabel: "used",
  genericError: "Error.",
};

const IT: MyListingsMonthCopy = {
  sectionTitle: "My Annunci This Month",
  loadError: "Could not load history.",
  freeLimitNote: "Free limit ({limit} per category) resets on {date} (00:00 UTC).",
  resetsOn: "Resets on",
  emptyCategory: "No posts this month in this category.",
  usedLabel: "used",
  genericError: "Error.",
};

const DE: MyListingsMonthCopy = {
  sectionTitle: "My Anzeigen This Month",
  loadError: "Could not load history.",
  freeLimitNote: "Free limit ({limit} per category) resets on {date} (00:00 UTC).",
  resetsOn: "Resets on",
  emptyCategory: "Nein posts this month in this category.",
  usedLabel: "used",
  genericError: "Error.",
};

const FR: MyListingsMonthCopy = {
  sectionTitle: "Mes annonces ce mois-ci",
  loadError: "Impossible de charger l'historique.",
  freeLimitNote: "La limite gratuite ({limit} par catégorie) se réinitialise le {date} (00:00 UTC).",
  resetsOn: "Réinitialisation le",
  emptyCategory: "Aucune annonce ce mois-ci dans cette catégorie.",
  usedLabel: "utilisé",
  genericError: "Erreur.",
};

const PAGES: Record<UiTranslationLocale, MyListingsMonthCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
};

export function useMyListingsMonthCopy(): MyListingsMonthCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}

export function fillMyListingsPlaceholders(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}
