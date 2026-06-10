import type { UiTranslationLocale } from "@/lib/ui-languages";

export type StripeCheckoutErrorKey = "card_failed" | "confirm_failed" | "session_failed";

const MESSAGES: Record<StripeCheckoutErrorKey, Record<UiTranslationLocale, string>> = {
  card_failed: {
    ks: "Pagesa me kartë dështoi",
    mk: "Плаќањето со картичка не успеа",
    mne: "Plaćanje karticom nije uspjelo",
    en: "Card payment failed",
    fr: "Le paiement par carte a échoué",
    de: "Kartenzahlung fehlgeschlagen",
    it: "Pagamento con carta non riuscito",
  },
  confirm_failed: {
    ks: "Konfirmimi i pagesës dështoi",
    mk: "Потврдата на плаќањето не успеа",
    mne: "Potvrda plaćanja nije uspjela",
    en: "Payment confirmation failed",
    fr: "La confirmation du paiement a échoué",
    de: "Zahlungsbestätigung fehlgeschlagen",
    it: "Conferma del pagamento non riuscita",
  },
  session_failed: {
    ks: "Nuk u krijua sesioni i pagesës",
    mk: "Сесијата за плаќање не беше создадена",
    mne: "Sesija plaćanja nije kreirana",
    en: "Payment session was not created",
    fr: "La session de paiement n'a pas été créée",
    de: "Zahlungssitzung wurde nicht erstellt",
    it: "Sessione di pagamento non creata",
  },
};

export function stripeCheckoutErrorMessage(
  key: StripeCheckoutErrorKey,
  locale: UiTranslationLocale,
): string {
  return MESSAGES[key][locale] ?? MESSAGES[key].en;
}
