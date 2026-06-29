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
  pwaInstalls: string;
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
  editStorefront: string;
  saveStorefront: string;
  shopSavedPublic: string;
  shopSavedPublicHint: string;
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
  pwaInstalls: "Instalime app (PWA)",
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
  editStorefront: "Ndrysho webfaqen",
  saveStorefront: "Ruaj webfaqen",
  shopSavedPublic: "Webfaqja u ruajt!",
  shopSavedPublicHint: "Vizitorët shohin faqen tuaj publike — jo panelin e editimit.",
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
  pwaInstalls: "Инсталации app (PWA)",
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
  editStorefront: "Уреди веб-страница",
  saveStorefront: "Зачувај веб-страница",
  shopSavedPublic: "Веб-страницата е зачувана!",
  shopSavedPublicHint: "Посетителите ја гледаат јавната страница — не панелот.",
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
  pwaInstalls: "Instalacije app (PWA)",
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
  editStorefront: "Uredi web stranicu",
  saveStorefront: "Sačuvaj web stranicu",
  shopSavedPublic: "Web stranica sačuvana!",
  shopSavedPublicHint: "Posjetioci vide javnu stranicu — ne panel za uređivanje.",
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
  pwaInstalls: "App installs (PWA)",
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
  editStorefront: "Edit storefront",
  saveStorefront: "Save storefront",
  shopSavedPublic: "Storefront saved!",
  shopSavedPublicHint: "Visitors see your public page — not this edit panel.",
};

const IT: ShopDashboardCopy = {
  verifiedBadge: "✓ Negozio verificato",
  myShop: "Il mio negozio",
  statusApproved: "Approvato",
  statusPending: "In attesa",
  postListing: "Post Listing",
  manageListings: "Gestisci annunci",
  editShop: "Modifica negozio",
  totalListings: "Annunci totali",
  totalViews: "Visualizzazioni totali",
  pwaInstalls: "Installazioni app (PWA)",
  viewShop: "Vedi negozio →",
  saveShop: "Salva",
  shopSaved: "Negozio aggiornato.",
  shopName: "Nome del negozio",
  logo: "Logo",
  description: "Descrizione",
  address: "Indirizzo",
  city: "Città",
  region: "Quartiere",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
  noShopListings: "Nessun annuncio attivo dal tuo negozio.",
  activeListingsCount: "{count} annunci attivi",
  filterAll: "Tutto",
  editStorefront: "Modifica vetrina",
  saveStorefront: "Salva vetrina",
  shopSavedPublic: "Vetrina salvata!",
  shopSavedPublicHint: "I visitatori vedono la pagina pubblica — non questo pannello.",
};

const DE: ShopDashboardCopy = {
  verifiedBadge: "✓ Verifizierter Shop",
  myShop: "Mein Shop",
  statusApproved: "Genehmigt",
  statusPending: "Ausstehend",
  postListing: "Post Listing",
  manageListings: "Anzeigen verwalten",
  editShop: "Shop bearbeiten",
  totalListings: "Anzeigen gesamt",
  totalViews: "Aufrufe gesamt",
  pwaInstalls: "App-Installationen (PWA)",
  viewShop: "Shop ansehen →",
  saveShop: "Speichern",
  shopSaved: "Shop aktualisiert.",
  shopName: "Shop-Name",
  logo: "Logo",
  description: "Beschreibung",
  address: "Adresse",
  city: "Stadt",
  region: "Stadtteil",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
  noShopListings: "Keine aktiven Anzeigen aus Ihrem Shop.",
  activeListingsCount: "{count} aktive Anzeigen",
  filterAll: "Alle",
  editStorefront: "Webseite bearbeiten",
  saveStorefront: "Webseite speichern",
  shopSavedPublic: "Webseite gespeichert!",
  shopSavedPublicHint: "Besucher sehen Ihre öffentliche Seite — nicht dieses Panel.",
};

const FR: ShopDashboardCopy = {
  verifiedBadge: "✓ Boutique vérifiée",
  myShop: "Ma boutique",
  statusApproved: "Approuvé",
  statusPending: "En attente",
  postListing: "Post Listing",
  manageListings: "Gérer les annonces",
  editShop: "Modifier la boutique",
  totalListings: "Annonces au total",
  totalViews: "Vues au total",
  pwaInstalls: "Installations app (PWA)",
  viewShop: "Voir la boutique →",
  saveShop: "Enregistrer",
  shopSaved: "Boutique mise à jour.",
  shopName: "Nom de la boutique",
  logo: "Logo",
  description: "Description",
  address: "Adresse",
  city: "Ville",
  region: "Quartier",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
  noShopListings: "Aucune annonce active de votre boutique.",
  activeListingsCount: "{count} annonces actives",
  filterAll: "Tout",
  editStorefront: "Modifier la vitrine",
  saveStorefront: "Enregistrer la vitrine",
  shopSavedPublic: "Vitrine enregistrée !",
  shopSavedPublicHint: "Les visiteurs voient la page publique — pas ce panneau.",
};

const PAGES: Record<UiTranslationLocale, ShopDashboardCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
};

export function useShopDashboardCopy(): ShopDashboardCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
