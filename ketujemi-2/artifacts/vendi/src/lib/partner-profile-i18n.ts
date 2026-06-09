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
};

const PAGES: Record<UiTranslationLocale, PartnerProfileCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
};

export function usePartnerProfileCopy(): PartnerProfileCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
