import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type ShopRatingCopy = {
  noRatingYet: string;
  ratingsCount: string;
  ratingsTitle: string;
  rateThisShop: string;
  yourRating: string;
  commentPlaceholder: string;
  submitRating: string;
  updateRating: string;
  loginToRate: string;
  ratingSaved: string;
  anonymousUser: string;
};

const KS: ShopRatingCopy = {
  noRatingYet: "Ende pa vlerësim",
  ratingsCount: "{score} — {count} vlerësime",
  ratingsTitle: "Vlerësimet e përdoruesve",
  rateThisShop: "Vlerëso këtë dyqan",
  yourRating: "Vlerësimi juaj",
  commentPlaceholder: "Koment opsional…",
  submitRating: "Dërgo vlerësimin",
  updateRating: "Përditëso vlerësimin",
  loginToRate: "Kyçu për të vlerësuar",
  ratingSaved: "Faleminderit për vlerësimin!",
  anonymousUser: "Përdorues",
};

const MK: ShopRatingCopy = {
  noRatingYet: "Сè уште без оценка",
  ratingsCount: "{score} — {count} оцени",
  ratingsTitle: "Оцени од корисници",
  rateThisShop: "Оцени ја продавницата",
  yourRating: "Вашата оценка",
  commentPlaceholder: "Опционален коментар…",
  submitRating: "Испрати оценка",
  updateRating: "Ажурирај оценка",
  loginToRate: "Најавете се за да оцените",
  ratingSaved: "Ви благодариме за оценката!",
  anonymousUser: "Корисник",
};

const MNE: ShopRatingCopy = {
  noRatingYet: "Još bez ocjene",
  ratingsCount: "{score} — {count} ocjena",
  ratingsTitle: "Ocjene korisnika",
  rateThisShop: "Ocijenite prodavnicu",
  yourRating: "Vaša ocjena",
  commentPlaceholder: "Opcionalni komentar…",
  submitRating: "Pošalji ocjenu",
  updateRating: "Ažuriraj ocjenu",
  loginToRate: "Prijavite se da ocijenite",
  ratingSaved: "Hvala na ocjeni!",
  anonymousUser: "Korisnik",
};

const EN: ShopRatingCopy = {
  noRatingYet: "No ratings yet",
  ratingsCount: "{score} — {count} ratings",
  ratingsTitle: "User ratings",
  rateThisShop: "Rate this shop",
  yourRating: "Your rating",
  commentPlaceholder: "Optional comment…",
  submitRating: "Submit rating",
  updateRating: "Update rating",
  loginToRate: "Log in to rate",
  ratingSaved: "Thanks for your rating!",
  anonymousUser: "User",
};

const FR: ShopRatingCopy = {
  noRatingYet: "Pas encore d'avis",
  ratingsCount: "{score} — {count} avis",
  ratingsTitle: "Avis des utilisateurs",
  rateThisShop: "Noter cette boutique",
  yourRating: "Votre avis",
  commentPlaceholder: "Commentaire facultatif…",
  submitRating: "Envoyer l'avis",
  updateRating: "Mettre à jour l'avis",
  loginToRate: "Connectez-vous pour noter",
  ratingSaved: "Merci pour votre avis !",
  anonymousUser: "Utilisateur",
};

const PAGES: Record<UiTranslationLocale, ShopRatingCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function useShopRatingCopy(): ShopRatingCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}

export function formatRatingsCount(copy: ShopRatingCopy, score: number, count: number): string {
  return copy.ratingsCount.replace("{score}", score.toFixed(1)).replace("{count}", String(count));
}
