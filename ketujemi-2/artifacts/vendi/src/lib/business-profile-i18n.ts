import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type BusinessProfileCopy = {
  refresh: string;
  notFound: string;
  viewAllListings: string;
  activeListingOne: string;
  activeListingMany: string;
  activeListingsHeading: string;
  noActiveListings: string;
};

const KS: BusinessProfileCopy = {
  refresh: "Rifresko",
  notFound: "Biznesi nuk u gjet.",
  viewAllListings: "Shiko të gjitha njoftimet",
  activeListingOne: "njoftim aktiv",
  activeListingMany: "njoftime aktive",
  activeListingsHeading: "Njoftimet aktive",
  noActiveListings: "Ky biznes nuk ka njoftime aktive për momentin.",
};

const MK: BusinessProfileCopy = {
  refresh: "Освежи",
  notFound: "Бизнисот не е пронајден.",
  viewAllListings: "Види ги сите огласи",
  activeListingOne: "активен оглас",
  activeListingMany: "активни огласи",
  activeListingsHeading: "Активни огласи",
  noActiveListings: "Овој бизнис моментално нема активни огласи.",
};

const MNE: BusinessProfileCopy = {
  refresh: "Osvježi",
  notFound: "Biznis nije pronađen.",
  viewAllListings: "Pogledaj sve oglase",
  activeListingOne: "aktivan oglas",
  activeListingMany: "aktivnih oglasa",
  activeListingsHeading: "Aktivni oglasi",
  noActiveListings: "Ovaj biznis trenutno nema aktivnih oglasa.",
};

const EN: BusinessProfileCopy = {
  refresh: "Refresh",
  notFound: "Business not found.",
  viewAllListings: "View all listings",
  activeListingOne: "active listing",
  activeListingMany: "active listings",
  activeListingsHeading: "Active listings",
  noActiveListings: "This business has no active listings at the moment.",
};

const FR: BusinessProfileCopy = {
  refresh: "Actualiser",
  notFound: "Entreprise introuvable.",
  viewAllListings: "Voir toutes les annonces",
  activeListingOne: "annonce active",
  activeListingMany: "annonces actives",
  activeListingsHeading: "Annonces actives",
  noActiveListings: "Cette entreprise n'a pas d'annonces actives pour le moment.",
};

const PAGES: Record<UiTranslationLocale, BusinessProfileCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function useBusinessProfileCopy(): BusinessProfileCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
