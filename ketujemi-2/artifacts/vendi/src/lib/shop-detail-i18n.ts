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
  editShop: string;
  deleteShop: string;
  deleteShopTitle: string;
  deleteShopDesc: string;
  saveShop: string;
  shopSaved: string;
  shopSaveError: string;
  shopDeleted: string;
  shopDeleteError: string;
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
  editShop: "⚙️ Edito Dyqanin",
  deleteShop: "🗑️ Fshi Dyqanin",
  deleteShopTitle: "Fshi dyqanin?",
  deleteShopDesc:
    "A jeni i sigurt? Ky veprim do të fshijë dyqanin dhe të gjitha shpalljet tuaja.",
  saveShop: "Ruaj",
  shopSaved: "Dyqani u përditësua.",
  shopSaveError: "Gabim gjatë ruajtjes së dyqanit.",
  shopDeleted: "Dyqani u fshi.",
  shopDeleteError: "Gabim gjatë fshirjes së dyqanit.",
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
  editShop: "⚙️ Уреди ја продавницата",
  deleteShop: "🗑️ Избриши ја продавницата",
  deleteShopTitle: "Избриши ја продавницата?",
  deleteShopDesc:
    "Дали сте сигурни? Оваа акција ќе ја избрише продавницата и сите ваши огласи.",
  saveShop: "Зачувај",
  shopSaved: "Продавницата е ажурирана.",
  shopSaveError: "Грешка при зачувување на продавницата.",
  shopDeleted: "Продавницата е избришана.",
  shopDeleteError: "Грешка при бришење на продавницата.",
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
  editShop: "⚙️ Uredi prodavnicu",
  deleteShop: "🗑️ Obriši prodavnicu",
  deleteShopTitle: "Obrisati prodavnicu?",
  deleteShopDesc:
    "Jeste li sigurni? Ova radnja će obrisati prodavnicu i sve vaše oglase.",
  saveShop: "Sačuvaj",
  shopSaved: "Prodavnica je ažurirana.",
  shopSaveError: "Greška pri čuvanju prodavnice.",
  shopDeleted: "Prodavnica je obrisana.",
  shopDeleteError: "Greška pri brisanju prodavnice.",
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
  editShop: "⚙️ Edit Shop",
  deleteShop: "🗑️ Delete Shop",
  deleteShopTitle: "Delete shop?",
  deleteShopDesc:
    "Are you sure? This will delete your shop and all your listings.",
  saveShop: "Save",
  shopSaved: "Shop updated.",
  shopSaveError: "Error saving shop.",
  shopDeleted: "Shop deleted.",
  shopDeleteError: "Error deleting shop.",
};

const FR: ShopDetailCopy = {
  notFound: "Boutique introuvable",
  backHome: "Retour à l'accueil",
  aboutTitle: "À propos de la boutique",
  mapTitle: "Carte",
  listingsTitle: "Annonces de la boutique",
  noListings: "Aucune annonce active pour le moment.",
  negotiable: "Négociable",
  seoTitleInCity: "in {city} | KetuJemi.com",
  activeListingsCount: "{count} annonces actives",
  filterAll: "Tout",
  postNewListing: "➕ Publier une nouvelle annonce",
  editListing: "Modifier",
  deleteListing: "Supprimer",
  deleteListingTitle: "Supprimer l'annonce ?",
  deleteListingDesc: "Cette action est irréversible. L'annonce sera définitivement supprimée.",
  cancel: "Annuler",
  ownerWelcomeEmpty: "👋 Bienvenue ! Votre boutique est prête — publiez votre première annonce et commencez à vendre !",
  postFirstListing: "➕ Publiez votre première annonce →",
  editShop: "⚙️ Modifier la boutique",
  deleteShop: "🗑️ Supprimer la boutique",
  deleteShopTitle: "Supprimer la boutique ?",
  deleteShopDesc: "Êtes-vous sûr ? Cela supprimera votre boutique et toutes vos annonces.",
  saveShop: "Enregistrer",
  shopSaved: "Boutique mise à jour.",
  shopSaveError: "Erreur lors de l'enregistrement de la boutique.",
  shopDeleted: "Boutique supprimée.",
  shopDeleteError: "Erreur lors de la suppression de la boutique.",
};

const PAGES: Record<UiTranslationLocale, ShopDetailCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
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
