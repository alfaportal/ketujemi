import { translationKeyForUiLang, type UiLang } from "@/lib/ui-languages";

/** Sync fallbacks — listing cards must never wait for lazy app-extra-i18n. */
export const LISTING_CARD_EXPIRY_COPY: Record<
  string,
  { tomorrow: string; inDays: string }
> = {
  ks: {
    tomorrow: "Skadon nesër",
    inDays: "Skadon për {days} ditë",
  },
  al: {
    tomorrow: "Skadon nesër",
    inDays: "Skadon për {days} ditë",
  },
  mk: {
    tomorrow: "Истекува утре",
    inDays: "Истекува за {days} дена",
  },
  mne: {
    tomorrow: "Ističe sutra",
    inDays: "Ističe za {days} dana",
  },
  en: {
    tomorrow: "Expires tomorrow",
    inDays: "Expires in {days} days",
  },
};

export function listingCardExpiryStrings(
  uiLang: UiLang,
  tx: Record<string, string | undefined>,
): { tomorrow: string; inDays: string } {
  const locale = translationKeyForUiLang(uiLang);
  const base = LISTING_CARD_EXPIRY_COPY[locale] ?? LISTING_CARD_EXPIRY_COPY.ks;
  return {
    tomorrow: tx.ui_listingExpiresTomorrow ?? base.tomorrow,
    inDays: tx.ui_listingExpiresInDays ?? base.inDays,
  };
}
