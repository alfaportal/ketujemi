import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type ReportListingCopy = {
  trigger: string;
  title: string;
  description: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  detailLabel: string;
  detailPlaceholder: string;
  nameLabel: string;
  cancel: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  minLength: string;
  reasons: readonly string[];
};

const KS: ReportListingCopy = {
  trigger: "Raporto",
  title: "Raporto shpalljen",
  description: "Na tregoni problemin. Ekipi shqyrton raportimet brenda 24 orëve.",
  reasonLabel: "Arsyeja",
  reasonPlaceholder: "Zgjidhni…",
  detailLabel: "Detaje (opsionale)",
  detailPlaceholder: "Përshkruani problemin…",
  nameLabel: "Emri juaj (opsional)",
  cancel: "Anulo",
  submit: "Dërgo raportin",
  submitting: "Duke dërguar…",
  success: "Raportimi u dërgua.",
  error: "Gabim",
  minLength: "Shkruani arsyen (min. 10 karaktere)",
  reasons: [
    "Mashtrim / fake",
    "Produkt i falsifikuar",
    "Përmbajtje e papërshtatshme",
    "Spam / reklamë",
    "Informacion i rremë",
    "Tjetër",
  ],
};

const MK: ReportListingCopy = {
  trigger: "Пријави",
  title: "Пријавете го огласот",
  description: "Кажете ни го проблемот. Тимот ги разгледува пријавите во рок од 24 часа.",
  reasonLabel: "Причина",
  reasonPlaceholder: "Изберете…",
  detailLabel: "Детали (опционално)",
  detailPlaceholder: "Опишете го проблемот…",
  nameLabel: "Вашето име (опционално)",
  cancel: "Откажи",
  submit: "Испрати пријава",
  submitting: "Се испраќа…",
  success: "Пријавата е испратена.",
  error: "Грешка",
  minLength: "Напишете причина (мин. 10 знаци)",
  reasons: [
    "Измама / лажно",
    "Фалсификуван производ",
    "Несоодветна содржина",
    "Спам / реклама",
    "Неточни информации",
    "Друго",
  ],
};

const MNE: ReportListingCopy = {
  trigger: "Prijavi",
  title: "Prijavite oglas",
  description: "Recite nam problem. Tim razmatra prijave u roku od 24 sata.",
  reasonLabel: "Razlog",
  reasonPlaceholder: "Izaberite…",
  detailLabel: "Detalji (opciono)",
  detailPlaceholder: "Opišite problem…",
  nameLabel: "Vaše ime (opciono)",
  cancel: "Otkaži",
  submit: "Pošalji prijavu",
  submitting: "Šalje se…",
  success: "Prijava je poslata.",
  error: "Greška",
  minLength: "Napišite razlog (min. 10 znakova)",
  reasons: [
    "Prevara / lažno",
    "Falsifikovani proizvod",
    "Neprikladan sadržaj",
    "Spam / reklama",
    "Netačne informacije",
    "Drugo",
  ],
};

const EN: ReportListingCopy = {
  trigger: "Report",
  title: "Report listing",
  description: "Tell us the problem. Our team reviews reports within 24 hours.",
  reasonLabel: "Reason",
  reasonPlaceholder: "Choose…",
  detailLabel: "Details (optional)",
  detailPlaceholder: "Describe the problem…",
  nameLabel: "Your name (optional)",
  cancel: "Cancel",
  submit: "Send report",
  submitting: "Sending…",
  success: "Report submitted.",
  error: "Error",
  minLength: "Enter a reason (min. 10 characters)",
  reasons: [
    "Scam / fake",
    "Counterfeit product",
    "Inappropriate content",
    "Spam / advertising",
    "False information",
    "Other",
  ],
};

const IT: ReportListingCopy = {
  trigger: "Report",
  title: "Report listing",
  description: "Tell us the problem. Our team reviews reports within 24 hours.",
  reasonLabel: "Reason",
  reasonPlaceholder: "Choose…",
  detailLabel: "Dettagli (optional)",
  detailPlaceholder: "Descrivi il problema…",
  nameLabel: "Your name (optional)",
  cancel: "Annulla",
  submit: "Send report",
  submitting: "Sending…",
  success: "Report submitted.",
  error: "Error",
  minLength: "Enter a reason (min. 10 characters)",
  reasons: [
    "Scam / fake",
    "Counterfeit product",
    "Inappropriate content",
    "Spam / advertising",
    "False information",
    "Other",
  ],
};

const DE: ReportListingCopy = {
  trigger: "Report",
  title: "Report listing",
  description: "Tell us the problem. Our team reviews reports within 24 hours.",
  reasonLabel: "Reason",
  reasonPlaceholder: "Choose…",
  detailLabel: "Details (optional)",
  detailPlaceholder: "Beschreiben Sie das Problem…",
  nameLabel: "Your name (optional)",
  cancel: "Abbrechen",
  submit: "Send report",
  submitting: "Sending…",
  success: "Report submitted.",
  error: "Error",
  minLength: "Enter a reason (min. 10 characters)",
  reasons: [
    "Scam / fake",
    "Counterfeit product",
    "Inappropriate content",
    "Spam / advertising",
    "False information",
    "Other",
  ],
};

const FR: ReportListingCopy = {
  trigger: "Signaler",
  title: "Signaler l'annonce",
  description: "Décrivez le problème. Notre équipe examine les signalements sous 24 h.",
  reasonLabel: "Motif",
  reasonPlaceholder: "Choisir…",
  detailLabel: "Détails (facultatif)",
  detailPlaceholder: "Décrivez le problème…",
  nameLabel: "Votre nom (facultatif)",
  cancel: "Annuler",
  submit: "Envoyer le signalement",
  submitting: "Envoi…",
  success: "Signalement envoyé.",
  error: "Erreur",
  minLength: "Indiquez un motif (min. 10 caractères)",
  reasons: [
    "Arnaque / faux",
    "Produit contrefait",
    "Contenu inapproprié",
    "Spam / publicité",
    "Informations erronées",
    "Autre",
  ],
};

const PAGES: Record<UiTranslationLocale, ReportListingCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
};

export function reportListingForLocale(locale: UiTranslationLocale): ReportListingCopy {
  return PAGES[locale];
}

export function useReportListingCopy(): ReportListingCopy {
  const { uiLang } = useMarket();
  return reportListingForLocale(translationKeyForUiLang(uiLang));
}
