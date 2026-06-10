import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type ListingLimitCopy = {
  title: string;
  closeAria: string;
  intro: string;
  usedLabel: string;
  resetLabel: string;
  balanceLabel: string;
  priceLabel: string;
  perListing: string;
  body: string;
  addBalance: string;
  cancel: string;
};

const KS: ListingLimitCopy = {
  title: "Limiti i postimeve falas",
  closeAria: "Anulo",
  intro: "Keni përdorur të gjitha postimet falas këtë muaj për kategorinë:",
  usedLabel: "Përdorur këtë muaj",
  resetLabel: "Limiti riniset më",
  balanceLabel: "Balanca në portofol",
  priceLabel: "Çmimi për postim të ri",
  perListing: "/ shpallje",
  body: "Mund të vazhdoni të postoni duke mbushur portofolin. Çdo shpallje pas limitit falas kushton vetëm €0.30.",
  addBalance: "Shto balancë në portofol",
  cancel: "Anulo",
};

const MK: ListingLimitCopy = {
  title: "Лимит на бесплатни објави",
  closeAria: "Откажи",
  intro: "Ги искористивте сите бесплатни објави овој месец за категоријата:",
  usedLabel: "Искористено овој месец",
  resetLabel: "Лимитот се ресетира на",
  balanceLabel: "Салдо во паричник",
  priceLabel: "Цена за нова објава",
  perListing: "/ оглас",
  body: "Можете да продолжите со објавување со полнење на паричникот. Секоја објава по бесплатниот лимит чини само €0.30.",
  addBalance: "Додај средства во паричник",
  cancel: "Откажи",
};

const MNE: ListingLimitCopy = {
  title: "Limit besplatnih objava",
  closeAria: "Otkaži",
  intro: "Iskoristili ste sve besplatne objave ovog mjeseca za kategoriju:",
  usedLabel: "Iskorišteno ovog mjeseca",
  resetLabel: "Limit se resetuje",
  balanceLabel: "Stanje u novčaniku",
  priceLabel: "Cijena za novu objavu",
  perListing: "/ oglas",
  body: "Možete nastaviti objavljivati punjenjem novčanika. Svaka objava nakon besplatnog limita košta samo €0.30.",
  addBalance: "Dodaj sredstva u novčanik",
  cancel: "Otkaži",
};

const EN: ListingLimitCopy = {
  title: "Free posting limit",
  closeAria: "Close",
  intro: "You have used all free posts this month for the category:",
  usedLabel: "Used this month",
  resetLabel: "Limit resets on",
  balanceLabel: "Wallet balance",
  priceLabel: "Price for a new post",
  perListing: "/ listing",
  body: "You can keep posting by topping up your wallet. Each listing after the free limit costs only €0.30.",
  addBalance: "Add wallet balance",
  cancel: "Cancel",
};

const FR: ListingLimitCopy = {
  title: "Limite de publications gratuites",
  closeAria: "Fermer",
  intro: "Vous avez utilisé toutes les publications gratuites ce mois-ci pour la catégorie :",
  usedLabel: "Utilisé ce mois-ci",
  resetLabel: "La limite se réinitialise le",
  balanceLabel: "Solde du portefeuille",
  priceLabel: "Prix d'une nouvelle annonce",
  perListing: "/ annonce",
  body: "Vous pouvez continuer à publier en rechargeant votre portefeuille. Chaque annonce après la limite gratuite coûte seulement 0,30 €.",
  addBalance: "Recharger le portefeuille",
  cancel: "Annuler",
};

const PAGES: Record<UiTranslationLocale, ListingLimitCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function useListingLimitCopy(): ListingLimitCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
