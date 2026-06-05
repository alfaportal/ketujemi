import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type ShopDetailCopy = {
  notFound: string;
  backHome: string;
  aboutTitle: string;
  mapTitle: string;
  listingsTitle: string;
  noListings: string;
  negotiable: string;
};

const KS: ShopDetailCopy = {
  notFound: "Dyqani nuk u gjet",
  backHome: "Kthehu në kryefaqe",
  aboutTitle: "Rreth dyqanit",
  mapTitle: "Harta",
  listingsTitle: "Shpalljet e dyqanit",
  noListings: "Nuk ka shpallje aktive për momentin.",
  negotiable: "Me marrëveshje",
};

const MK: ShopDetailCopy = {
  notFound: "Продавницата не е пронајдена",
  backHome: "Назад на почетна",
  aboutTitle: "За продавницата",
  mapTitle: "Мапа",
  listingsTitle: "Огласи на продавницата",
  noListings: "Моментално нема активни огласи.",
  negotiable: "По договор",
};

const MNE: ShopDetailCopy = {
  notFound: "Prodavnica nije pronađena",
  backHome: "Nazad na početnu",
  aboutTitle: "O prodavnici",
  mapTitle: "Mapa",
  listingsTitle: "Oglasi prodavnice",
  noListings: "Trenutno nema aktivnih oglasa.",
  negotiable: "Po dogovoru",
};

const EN: ShopDetailCopy = {
  notFound: "Shop not found",
  backHome: "Back to home",
  aboutTitle: "About the shop",
  mapTitle: "Map",
  listingsTitle: "Shop listings",
  noListings: "No active listings at the moment.",
  negotiable: "Negotiable",
};

const PAGES: Record<UiTranslationLocale, ShopDetailCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
};

export function useShopDetailCopy(): ShopDetailCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
