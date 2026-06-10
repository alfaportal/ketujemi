import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type WalletBankPaymentCopy = {
  loginRequired: string;
  loginBtn: string;
  notFound: string;
  backProfile: string;
  pageTitle: string;
  pageSubtitle: string;
  amount: string;
  bank: string;
  beneficiary: string;
  iban: string;
  reference: string;
  referenceHint: string;
  backWallet: string;
  copied: string;
  copyFailed: string;
};

const KS: WalletBankPaymentCopy = {
  loginRequired: "Hyni në llogari për të parë udhëzimet e pagesës.",
  loginBtn: "Hyr",
  notFound: "Pagesa nuk u gjet ose transferi bankar nuk është aktiv.",
  backProfile: "Kthehu te profili",
  pageTitle: "Pagesë bankare (Kosovë)",
  pageSubtitle: "Transfer bankar për portofolin",
  amount: "Shuma",
  bank: "Banka",
  beneficiary: "Përfituesi",
  iban: "IBAN",
  reference: "Referenca (obligative)",
  referenceHint:
    "Pa kodin e referencës në përshkrim, pagesa mund të vonohet. Pas konfirmimit, rifreskoni balancën në profil.",
  backWallet: "Kthehu te portofoli",
  copied: "u kopjua",
  copyFailed: "Kopjimi dështoi",
};

const MK: WalletBankPaymentCopy = {
  loginRequired: "Најавете се за да ги видите упатствата за плаќање.",
  loginBtn: "Најава",
  notFound: "Плаќањето не е пронајдено или банкарскиот трансфер не е активен.",
  backProfile: "Назад кон профилот",
  pageTitle: "Банкарско плаќање (Косово)",
  pageSubtitle: "Банкарски трансфер за паричник",
  amount: "Износ",
  bank: "Банка",
  beneficiary: "Корисник",
  iban: "IBAN",
  reference: "Референца (задолжително)",
  referenceHint:
    "Без референца во описот, плаќањето може да се одложи. По потврда, освежете го салдото во профилот.",
  backWallet: "Назад кон паричникот",
  copied: "е копирано",
  copyFailed: "Копирањето не успеа",
};

const MNE: WalletBankPaymentCopy = {
  loginRequired: "Prijavite se da vidite upute za plaćanje.",
  loginBtn: "Prijava",
  notFound: "Plaćanje nije pronađeno ili bankovni transfer nije aktivan.",
  backProfile: "Nazad na profil",
  pageTitle: "Bankovno plaćanje (Kosovo)",
  pageSubtitle: "Bankovni transfer za novčanik",
  amount: "Iznos",
  bank: "Banka",
  beneficiary: "Korisnik",
  iban: "IBAN",
  reference: "Referenca (obavezno)",
  referenceHint:
    "Bez reference u opisu, plaćanje može kasniti. Nakon potvrde, osvježite stanje u profilu.",
  backWallet: "Nazad na novčanik",
  copied: "kopirano",
  copyFailed: "Kopiranje nije uspjelo",
};

const EN: WalletBankPaymentCopy = {
  loginRequired: "Sign in to view payment instructions.",
  loginBtn: "Sign in",
  notFound: "Payment not found or bank transfer is not active.",
  backProfile: "Back to profile",
  pageTitle: "Bank payment (Kosovo)",
  pageSubtitle: "Bank transfer for wallet",
  amount: "Amount",
  bank: "Bank",
  beneficiary: "Beneficiary",
  iban: "IBAN",
  reference: "Reference (required)",
  referenceHint:
    "Without the reference in the description, payment may be delayed. After confirmation, refresh your balance in profile.",
  backWallet: "Back to wallet",
  copied: "copied",
  copyFailed: "Copy failed",
};

const FR: WalletBankPaymentCopy = {
  loginRequired: "Connectez-vous pour voir les instructions de paiement.",
  loginBtn: "Connexion",
  notFound: "Paiement introuvable ou virement bancaire inactif.",
  backProfile: "Retour au profil",
  pageTitle: "Paiement bancaire (Kosovo)",
  pageSubtitle: "Virement bancaire pour le portefeuille",
  amount: "Montant",
  bank: "Banque",
  beneficiary: "Bénéficiaire",
  iban: "IBAN",
  reference: "Référence (obligatoire)",
  referenceHint:
    "Sans la référence dans la description, le paiement peut être retardé. Après confirmation, actualisez le solde dans le profil.",
  backWallet: "Retour au portefeuille",
  copied: "copié",
  copyFailed: "Échec de la copie",
};

const PAGES: Record<UiTranslationLocale, WalletBankPaymentCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function useWalletBankPaymentCopy(): WalletBankPaymentCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}
