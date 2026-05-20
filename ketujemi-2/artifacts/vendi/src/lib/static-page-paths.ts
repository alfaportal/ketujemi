import type { UiLang } from "@/lib/ui-languages";

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
  };
}
