import type { UiLang } from "@/lib/ui-languages";

/** Footer / help links — localized slugs per UI language. */
export function staticPagePaths(uiLang: UiLang) {
  if (uiLang === "mk") {
    return {
      contact: "/kontakt",
      faq: "/faq",
      security: "/bezbednost",
      press: "/mediji",
    };
  }
  if (uiLang === "mne") {
    return {
      contact: "/kontakt",
      faq: "/faq",
      security: "/sigurnost",
      press: "/mediji",
    };
  }
  return {
    contact: "/kontakt",
    faq: "/faq",
    security: "/siguria",
    press: "/shtypi",
  };
}
