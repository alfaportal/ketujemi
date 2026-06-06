import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type ShopDashboardCopy = {
  verifiedBadge: string;
  myShop: string;
  statusApproved: string;
  statusPending: string;
  postListing: string;
  manageListings: string;
  editShop: string;
  totalListings: string;
  totalViews: string;
  viewShop: string;
  saveShop: string;
  shopSaved: string;
  shopName: string;
  logo: string;
  description: string;
  address: string;
  city: string;
  region: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  website: string;
  noShopListings: string;
  activeListingsCount: string;
  filterAll: string;
};

const KS: ShopDashboardCopy = {
  verifiedBadge: "✓ Dyqan i Verifikuar",
  myShop: "Dyqani im",
  statusApproved: "Aprovuar",
  statusPending: "Në pritje",
  postListing: "Posto Shpallje",
  manageListings: "Menaxho Shpalljet",
  editShop: "Edito Dyqanin",
  totalListings: "Shpallje totale",
  totalViews: "Shikime totale",
  viewShop: "Shiko dyqanin →",
  saveShop: "Ruaj ndryshimet",
  shopSaved: "Dyqani u përditësua.",
  shopName: "Emri i dyqanit",
  logo: "Logo",
  description: "Përshkrimi",
  address: "Adresa",
  city: "Qyteti",
  region: "Rajoni/Lagja",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
  noShopListings: "Nuk ka shpallje aktive nga dyqani juaj.",
  activeListingsCount: "{count} shpallje aktive",
  filterAll: "Të gjitha",
};

const MK: ShopDashboardCopy = {
  verifiedBadge: "✓ Верификувана продавница",
  myShop: "Моја продавница",
  statusApproved: "Одобрено",
  statusPending: "Во чекање",
  postListing: "Објави оглас",
  manageListings: "Управувај со огласи",
  editShop: "Уреди продавница",
  totalListings: "Вкупно огласи",
  totalViews: "Вкупно прегледи",
  viewShop: "Види продавница →",
  saveShop: "Зачувај промени",
  shopSaved: "Продавницата е ажурирана.",
  shopName: "Име на продавница",
  logo: "Лого",
  description: "Опис",
  address: "Адреса",
  city: "Град",
  region: "Регион/Населба",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Веб-сајт",
  noShopListings: "Немате активни огласи од продавницата.",
  activeListingsCount: "{count} активни огласи",
  filterAll: "Сите",
};

const MNE: ShopDashboardCopy = {
  verifiedBadge: "✓ Verifikovana prodavnica",
  myShop: "Moja prodavnica",
  statusApproved: "Odobreno",
  statusPending: "Na čekanju",
  postListing: "Objavi oglas",
  manageListings: "Upravljaj oglasima",
  editShop: "Uredi prodavnicu",
  totalListings: "Ukupno oglasa",
  totalViews: "Ukupno pregleda",
  viewShop: "Pogledaj prodavnicu →",
  saveShop: "Sačuvaj izmjene",
  shopSaved: "Prodavnica je ažurirana.",
  shopName: "Naziv prodavnice",
  logo: "Logo",
  description: "Opis",
  address: "Adresa",
  city: "Grad",
  region: "Regija/Naselje",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
  noShopListings: "Nemate aktivnih oglasa iz prodavnice.",
  activeListingsCount: "{count} aktivnih oglasa",
  filterAll: "Sve",
};

const EN: ShopDashboardCopy = {
  verifiedBadge: "✓ Verified Shop",
  myShop: "My Shop",
  statusApproved: "Approved",
  statusPending: "Pending",
  postListing: "Post Listing",
  manageListings: "Manage Listings",
  editShop: "Edit Shop",
  totalListings: "Total listings",
  totalViews: "Total views",
  viewShop: "View shop →",
  saveShop: "Save changes",
  shopSaved: "Shop updated.",
  shopName: "Shop name",
  logo: "Logo",
  description: "Description",
  address: "Address",
  city: "City",
  region: "Area/Neighbourhood",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
  noShopListings: "No active listings from your shop.",
  activeListingsCount: "{count} active listings",
  filterAll: "All",
};

const PAGES: Record<UiTranslationLocale, ShopDashboardCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
};

export function useShopDashboardCopy(): ShopDashboardCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
