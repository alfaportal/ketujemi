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
  activeListingsCount: string;
  filterAll: string;
  postNewListing: string;
  editListing: string;
  deleteListing: string;
  deleteListingTitle: string;
  deleteListingDesc: string;
  cancel: string;
  ownerWelcomeEmpty: string;
  postFirstListing: string;
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
  activeListingsCount: "{count} shpallje aktive",
  filterAll: "Të gjitha",
  postNewListing: "➕ Posto Shpallje të Re",
  editListing: "Edito",
  deleteListing: "Fshi",
  deleteListingTitle: "Fshi shpalljen?",
  deleteListingDesc: "Kjo veprim nuk mund të zhbehet. Shpallja do të fshihet përgjithmonë.",
  cancel: "Anulo",
  ownerWelcomeEmpty:
    "👋 Mirë se erdhe! Dyqani yt është gati — posto shpalljen e parë tani dhe fillo të shesësh!",
  postFirstListing: "➕ Posto Shpalljen e Parë →",
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
  activeListingsCount: "{count} активни огласи",
  filterAll: "Сите",
  postNewListing: "➕ Објави нов оглас",
  editListing: "Уреди",
  deleteListing: "Избриши",
  deleteListingTitle: "Избриши го огласот?",
  deleteListingDesc: "Оваа акција не може да се врати. Огласот ќе биде трајно избришан.",
  cancel: "Откажи",
  ownerWelcomeEmpty:
    "👋 Добредојдовте! Вашата продавница е подготвена — објавете го првиот оглас сега и започнете со продажба!",
  postFirstListing: "➕ Објави го првиот оглас →",
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
  activeListingsCount: "{count} aktivnih oglasa",
  filterAll: "Sve",
  postNewListing: "➕ Objavi novi oglas",
  editListing: "Uredi",
  deleteListing: "Obriši",
  deleteListingTitle: "Obrisati oglas?",
  deleteListingDesc: "Ova radnja se ne može poništiti. Oglas će biti trajno uklonjen.",
  cancel: "Otkaži",
  ownerWelcomeEmpty:
    "👋 Dobrodošli! Vaša prodavnica je spremna — objavite prvi oglas sada i počnite prodavati!",
  postFirstListing: "➕ Objavi prvi oglas →",
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
  activeListingsCount: "{count} active listings",
  filterAll: "All",
  postNewListing: "➕ Post New Listing",
  editListing: "Edit",
  deleteListing: "Delete",
  deleteListingTitle: "Delete listing?",
  deleteListingDesc: "This cannot be undone. The listing will be permanently removed.",
  cancel: "Cancel",
  ownerWelcomeEmpty:
    "👋 Welcome! Your shop is ready — post your first listing now and start selling!",
  postFirstListing: "➕ Post Your First Listing →",
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
