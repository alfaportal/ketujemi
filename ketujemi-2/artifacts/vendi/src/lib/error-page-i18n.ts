import { DEFAULT_UI_LANG, isUiLang, type UiLang } from "@/lib/ui-languages";

export type ErrorPageCopy = {
  title: string;
  hint: string;
  refresh: string;
};

export const ERROR_PAGE_COPY: Record<UiLang, ErrorPageCopy> = {
  sq: {
    title: "Faqja nuk u ngarkua",
    hint: "Provo të rifreskosh faqen. Nëse problemi vazhdon, pastro cache-in e shfletuesit për ketujemi.com.",
    refresh: "Rifresko",
  },
  mk: {
    title: "Страницата не се вчита",
    hint: "Обидете се да ја освежите страницата. Ако проблемот продолжи, исчистете ја кеш-меморијата за ketujemi.com.",
    refresh: "Освежи",
  },
  mne: {
    title: "Stranica se nije učitala",
    hint: "Pokušajte osvježiti stranicu. Ako problem traje, očistite keš pregledača za ketujemi.com.",
    refresh: "Osvježi",
  },
  en: {
    title: "Page could not load",
    hint: "Try refreshing the page. If the problem continues, clear your browser cache for ketujemi.com.",
    refresh: "Refresh",
  },
};

export function errorPageCopyForStoredLang(): ErrorPageCopy {
  if (typeof window === "undefined") return ERROR_PAGE_COPY[DEFAULT_UI_LANG];
  try {
    const saved = localStorage.getItem("vendi_ui_lang");
    if (saved && isUiLang(saved)) return ERROR_PAGE_COPY[saved];
  } catch {
    /* ignore */
  }
  return ERROR_PAGE_COPY[DEFAULT_UI_LANG];
}
