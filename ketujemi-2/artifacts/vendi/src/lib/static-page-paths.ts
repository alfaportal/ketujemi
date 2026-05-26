import type { UiLang } from "@/lib/ui-languages";

export const PARTNER_SIGNUP_PATH = "/partner";

/** Trusted-partner empty slots → partner registration form (optional package preselect). */
export function partnerSignupHref(tier?: "vip" | "standard"): string {
  const params = new URLSearchParams({ step: "partner" });
  if (tier === "vip" || tier === "standard") {
    params.set("package", tier);
  }
  return `${PARTNER_SIGNUP_PATH}?${params.toString()}#regjistrohu`;
}

/** Footer BIZNESE column — same path for all UI languages */
export const FOOTER_BUSINESS_OPEN_SHOP_PATH = "/partner";
export const FOOTER_BUSINESS_VIP_PATH = "/vip";
export const FOOTER_BUSINESS_PARTNERSHIP_PATH = "/partner";

/** Rrugët e faqeve informative / ligjore — pa shiritin sticky të pagesave. */
export const INFO_STATIC_PATHS = new Set([
  "/kontakt",
  "/contact",
  "/faq",
  "/siguria",
  "/bezbednost",
  "/sigurnost",
  "/shtypi",
  "/mediji",
  "/rreth-nesh",
  "/za-nas",
  "/o-nama",
  "/rregullat",
  "/pravila",
  "/privatesia",
  "/privatnost",
  "/cookies",
  "/kolacinja",
  "/kolacici",
  "/kushtet",
  "/uslovi",
  "/terms",
  "/privacy",
  "/business-rules",
  "/hap-shitore",
  "/otvori-prodavnica",
  "/otvori-prodavnicu",
  "/vip",
  "/reklamoni",
  "/reklamiraj",
  "/partner",
  "/partneritet",
  "/partnerstvo",
  "/behu-partner",
]);

export function isInfoStaticPage(pathname: string): boolean {
  return INFO_STATIC_PATHS.has(pathname);
}

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
      openShop: FOOTER_BUSINESS_OPEN_SHOP_PATH,
      vip: FOOTER_BUSINESS_VIP_PATH,
      advertise: "/reklamiraj",
      partnership: FOOTER_BUSINESS_PARTNERSHIP_PATH,
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
      openShop: FOOTER_BUSINESS_OPEN_SHOP_PATH,
      vip: FOOTER_BUSINESS_VIP_PATH,
      advertise: "/reklamiraj",
      partnership: FOOTER_BUSINESS_PARTNERSHIP_PATH,
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
    openShop: FOOTER_BUSINESS_OPEN_SHOP_PATH,
    vip: FOOTER_BUSINESS_VIP_PATH,
    advertise: "/reklamoni",
    partnership: FOOTER_BUSINESS_PARTNERSHIP_PATH,
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
      { marketCode: "ks", name: "Kosovë", iso: "XK" },
      { marketCode: "al", name: "Shqipëri", iso: "AL" },
      { marketCode: "mk", name: "Maqedoni", iso: "MK" },
    ],
    diasporaLabel: "+8 Diaspora",
  };
}
