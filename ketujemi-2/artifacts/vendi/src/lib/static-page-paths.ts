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

export type FooterMarketChip = {
  marketCode?: "ks" | "al" | "mk";
  name: string;
  iso: string;
};

export type FooterMarketsStripCopy = {
  title: string;
  primary: FooterMarketChip[];
  diasporaLabel: string;
};

export function footerMarketsStripCopy(uiLang: UiLang): FooterMarketsStripCopy {
  if (uiLang === "mk") {
    return {
      title: "СЛУЖБЕНИ ПАЗАРИ",
      primary: [
        { marketCode: "ks", name: "Косово", iso: "XK" },
        { marketCode: "al", name: "Албанија", iso: "AL" },
        { marketCode: "mk", name: "Македонија", iso: "MK" },
      ],
      diasporaLabel: "+8 земји од дијаспората",
    };
  }
  if (uiLang === "mne") {
    return {
      title: "SLUŽBENA TRŽIŠTA",
      primary: [
        { marketCode: "ks", name: "Kosovo", iso: "XK" },
        { marketCode: "al", name: "Albanija", iso: "AL" },
        { marketCode: "mk", name: "Makedonija", iso: "MK" },
      ],
      diasporaLabel: "+8 zemalja dijaspore",
    };
  }
  return {
    title: "TREGJET ZYRTARE",
    primary: [
      { marketCode: "ks", name: "Kosovo", iso: "XK" },
      { marketCode: "al", name: "Shqipëri", iso: "AL" },
      { marketCode: "mk", name: "Maqedoni", iso: "MK" },
    ],
    diasporaLabel: "+8 Vende të Diasporës",
  };
}
