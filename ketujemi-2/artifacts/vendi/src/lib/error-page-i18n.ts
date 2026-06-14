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
  fr: {
    title: "La page n'a pas pu se charger",
    hint: "Essayez d'actualiser la page. Si le problème persiste, videz le cache du navigateur pour ketujemi.com.",
    refresh: "Actualiser",
  },
  de: {
    title: "Seite konnte nicht geladen werden",
    hint: "Versuchen Sie, die Seite zu aktualisieren. Wenn das Problem weiterhin besteht, leeren Sie den Browser-Cache für ketujemi.com.",
    refresh: "Aktualisieren",
  },
  it: {
    title: "Impossibile caricare la pagina",
    hint: "Prova ad aggiornare la pagina. Se il problema persiste, svuota la cache del browser per ketujemi.com.",
    refresh: "Aggiorna",
  },
};

export type ListingDetailErrorCopy = {
  subtitle: string;
  retry: string;
  backToList: string;
};

export const LISTING_DETAIL_ERROR_COPY: Record<UiLang, ListingDetailErrorCopy> = {
  sq: {
    subtitle: "Shpallja nuk u shfaq. Provo përsëri pa rifreskuar faqen.",
    retry: "Provo përsëri",
    backToList: "Kthehu te lista",
  },
  mk: {
    subtitle: "Огласот не се прикажа. Обидете се повторно без освежување на страницата.",
    retry: "Обиди се повторно",
    backToList: "Назад кон листата",
  },
  mne: {
    subtitle: "Oglas se nije prikazao. Pokušajte ponovo bez osvježavanja stranice.",
    retry: "Pokušaj ponovo",
    backToList: "Nazad na listu",
  },
  en: {
    subtitle: "The listing could not be shown. Try again without refreshing the page.",
    retry: "Try again",
    backToList: "Back to listings",
  },
  fr: {
    subtitle: "L'annonce n'a pas pu s'afficher. Réessayez sans actualiser la page.",
    retry: "Réessayer",
    backToList: "Retour à la liste",
  },
  de: {
    subtitle: "Die Anzeige konnte nicht angezeigt werden. Versuchen Sie es erneut, ohne die Seite zu aktualisieren.",
    retry: "Erneut versuchen",
    backToList: "Zurück zur Liste",
  },
  it: {
    subtitle: "L'annuncio non è stato mostrato. Riprova senza aggiornare la pagina.",
    retry: "Riprova",
    backToList: "Torna all'elenco",
  },
};

export function listingDetailErrorCopyForStoredLang(): ErrorPageCopy & ListingDetailErrorCopy {
  const titleCopy = errorPageCopyForStoredLang();
  let detail = LISTING_DETAIL_ERROR_COPY[DEFAULT_UI_LANG];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("vendi_ui_lang");
      if (saved && isUiLang(saved)) detail = LISTING_DETAIL_ERROR_COPY[saved];
    } catch {
      /* ignore */
    }
  }
  return { ...titleCopy, ...detail };
}

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
