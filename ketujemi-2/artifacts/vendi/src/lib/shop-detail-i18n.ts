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
  seoTitleInCity: string;
};

function seoTitle(shopName: string, category: string, city: string, suffix: string): string {
  return `${shopName} — ${category} ${suffix.replace("{city}", city)}`;
}

const KS: ShopDetailCopy = {
  notFound: "Dyqani nuk u gjet",
  backHome: "Kthehu në kryefaqe",
  aboutTitle: "Rreth dyqanit",
  mapTitle: "Harta",
  listingsTitle: "Shpalljet e dyqanit",
  noListings: "Nuk ka shpallje aktive për momentin.",
  negotiable: "Me marrëveshje",
  seoTitleInCity: "në {city} | KetuJemi.com",
};

const MK: ShopDetailCopy = {
  notFound: "Продавницата не е пронајдена",
  backHome: "Назад на почетна",
  aboutTitle: "За продавницата",
  mapTitle: "Мапа",
  listingsTitle: "Огласи на продавницата",
  noListings: "Моментално нема активни огласи.",
  negotiable: "По договор",
  seoTitleInCity: "во {city} | KetuJemi.com",
};

const MNE: ShopDetailCopy = {
  notFound: "Prodavnica nije pronađena",
  backHome: "Nazad na početnu",
  aboutTitle: "O prodavnici",
  mapTitle: "Mapa",
  listingsTitle: "Oglasi prodavnice",
  noListings: "Trenutno nema aktivnih oglasa.",
  negotiable: "Po dogovoru",
  seoTitleInCity: "u {city} | KetuJemi.com",
};

const EN: ShopDetailCopy = {
  notFound: "Shop not found",
  backHome: "Back to home",
  aboutTitle: "About the shop",
  mapTitle: "Map",
  listingsTitle: "Shop listings",
  noListings: "No active listings at the moment.",
  negotiable: "Negotiable",
  seoTitleInCity: "in {city} | KetuJemi.com",
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

export function shopDetailSeoTitle(
  copy: ShopDetailCopy,
  shopName: string,
  categoryLabel: string,
  city: string,
): string {
  return seoTitle(shopName, categoryLabel, city, copy.seoTitleInCity);
}
