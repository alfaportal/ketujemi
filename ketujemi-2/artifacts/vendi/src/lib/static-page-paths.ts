import type { UiLang } from "@/lib/ui-languages";

export const PARTNER_SIGNUP_PATH = "/behu-partner";

export type StaticPagePaths = {
  contact: string;
  faq: string;
  security: string;
  press: string;
  about: string;
  rules: string;
  privacy: string;
  cookies: string;
  terms: string;
  openShop: string;
  vip: string;
  advertise: string;
  partnership: string;
};

/** Footer / help links — localized slugs per UI language. */
export function staticPagePaths(uiLang: UiLang): StaticPagePaths {
  if (uiLang === "mk") {
    return {
      contact: "/kontakt",
      faq: "/faq",
      security: "/bezbednost",
      press: "/mediji",
      about: "/za-nas",
      rules: "/pravila",
      privacy: "/privatnost",
      cookies: "/kolacinja",
      terms: "/uslovi",
      openShop: "/otvori-prodavnica",
      vip: "/vip",
      advertise: "/reklamiraj",
      partnership: "/partnerstvo",
    };
  }
  if (uiLang === "mne") {
    return {
      contact: "/kontakt",
      faq: "/faq",
      security: "/sigurnost",
      press: "/mediji",
      about: "/o-nama",
      rules: "/pravila",
      privacy: "/privatnost",
      cookies: "/kolacici",
      terms: "/uslovi",
      openShop: "/otvori-prodavnicu",
      vip: "/vip",
      advertise: "/reklamiraj",
      partnership: "/partnerstvo",
    };
  }
  return {
    contact: "/kontakt",
    faq: "/faq",
    security: "/siguria",
    press: "/shtypi",
    about: "/rreth-nesh",
    rules: "/rregullat",
    privacy: "/privatesia",
    cookies: "/cookies",
    terms: "/kushtet",
    openShop: "/hap-shitore",
    vip: "/vip",
    advertise: "/reklamoni",
    partnership: "/partneritet",
  };
}

/** 11 tregje — shiriti i footer-it (tekst i vetëm). */
export const FOOTER_MARKETS_STRIP_LABEL = "KetuJemi në 11 tregje";
export const FOOTER_MARKETS_STRIP_COUNTRIES =
  "Kosovë - Shqipëri - Maqedoni - Mal i Zi - Gjermani - Zvicër - Austri - Francë - Itali - Angli - SHBA";
