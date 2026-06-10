import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type PartnerProfileCopy = {
  back: string;
  notFoundTitle: string;
  notFoundSub: string;
  standardBadge: string;
  vipBadge: string;
  locationTitle: string;
  contactTitle: string;
  mapTitle: string;
  openInMaps: string;
};

const KS: PartnerProfileCopy = {
  back: "Kthehu",
  notFoundTitle: "Partneri nuk u gjet",
  notFoundSub: "Ky profil nuk është i disponueshëm.",
  standardBadge: "Partner",
  vipBadge: "VIP Partner",
  locationTitle: "Lokacioni",
  contactTitle: "Kontakt & rrjetet sociale",
  mapTitle: "Harta",
  openInMaps: "Hap në Google Maps",
};

const MK: PartnerProfileCopy = {
  back: "Назад",
  notFoundTitle: "Партнерот не е пронајден",
  notFoundSub: "Овој профил не е достапен.",
  standardBadge: "Партнер",
  vipBadge: "VIP партнер",
  locationTitle: "Локација",
  contactTitle: "Контакт и социјални мрежи",
  mapTitle: "Мапа",
  openInMaps: "Отвори во Google Maps",
};

const MNE: PartnerProfileCopy = {
  back: "Nazad",
  notFoundTitle: "Partner nije pronađen",
  notFoundSub: "Ovaj profil nije dostupan.",
  standardBadge: "Partner",
  vipBadge: "VIP partner",
  locationTitle: "Lokacija",
  contactTitle: "Kontakt i društvene mreže",
  mapTitle: "Mapa",
  openInMaps: "Otvori u Google Maps",
};

const EN: PartnerProfileCopy = {
  back: "Back",
  notFoundTitle: "Partner not found",
  notFoundSub: "This profile is not available.",
  standardBadge: "Partner",
  vipBadge: "VIP Partner",
  locationTitle: "Location",
  contactTitle: "Contact & social",
  mapTitle: "Map",
  openInMaps: "Open in Google Maps",
};

const IT: PartnerProfileCopy = {
  back: "Indietro",
  notFoundTitle: "Partner non trovato",
  notFoundSub: "Questo profilo non è disponibile.",
  standardBadge: "Partner",
  vipBadge: "Partner VIP",
  locationTitle: "Posizione",
  contactTitle: "Contatto e social",
  mapTitle: "Mappa",
  openInMaps: "Apri in Google Maps",
};

const DE: PartnerProfileCopy = {
  back: "Zurück",
  notFoundTitle: "Partner nicht gefunden",
  notFoundSub: "Dieses Profil ist nicht verfügbar.",
  standardBadge: "Partner",
  vipBadge: "VIP-Partner",
  locationTitle: "Standort",
  contactTitle: "Kontakt & soziale Medien",
  mapTitle: "Karte",
  openInMaps: "In Google Maps öffnen",
};

const FR: PartnerProfileCopy = {
  back: "Retour",
  notFoundTitle: "Partenaire introuvable",
  notFoundSub: "Ce profil n'est pas disponible.",
  standardBadge: "Partenaire",
  vipBadge: "Partenaire VIP",
  locationTitle: "Localisation",
  contactTitle: "Contact et réseaux sociaux",
  mapTitle: "Carte",
  openInMaps: "Ouvrir dans Google Maps",
};

const PAGES: Record<UiTranslationLocale, PartnerProfileCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
};

export function usePartnerProfileCopy(): PartnerProfileCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
