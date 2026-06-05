import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type VipPackagesFaq = { q: string; a: string };
export type VipPackagesCompareRow = {
  feature: string;
  free: string;
  standard: string;
  vip: string;
};

export type VipPackagesPageCopy = {
  docTitle: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  packagesTitle: string;
  standardTitle: string;
  standardFeatures: string[];
  standardCta: string;
  vipTitle: string;
  vipRecommended: string;
  vipFeatures: string[];
  vipCta: string;
  compareTitle: string;
  compareColFeature: string;
  compareColFree: string;
  compareColStandard: string;
  compareColVip: string;
  compareRows: VipPackagesCompareRow[];
  faqTitle: string;
  faq: VipPackagesFaq[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  ctaFinePrint: string;
};

const KS: VipPackagesPageCopy = {
  docTitle: "Paketat e Biznesit — KetuJemi.com",
  heroBadge: "PAKETAT E BIZNESIT",
  heroTitle: "Zgjidh Paketën që i Përshtatet Biznesit Tënd",
  heroSubtitle:
    "Rrit dukshmërinë, merr më shumë klientë dhe menaxho biznesin tënd profesionalisht.",
  packagesTitle: "PAKETAT — KRAHASO",
  standardTitle: "PARTNER",
  standardFeatures: [
    "Dyqan i personalizuar në KetuJemi.com",
    "Deri 50 njoftime aktive njëkohësisht",
    "Logo e biznesit me link në faqen kryesore",
    'Badge "Partner i Verifikuar" në çdo njoftim',
    "Panel biznesi me statistika bazë",
    "Suport me email brenda 24 orëve",
    "Prioritet ndaj njoftimeve të rregullta",
  ],
  standardCta: "Apliko si Partner",
  vipTitle: "VIP PARTNER",
  vipRecommended: "E rekomanduar",
  vipFeatures: [
    "Gjithçka nga Standard +",
    "Deri 100 njoftime aktive njëkohësisht",
    "Pozicion prioritar në kërkim — del i pari gjithmonë",
    "Badge VIP i dukshëm në çdo njoftim",
    "Logo e madhe e biznesit me link në faqen kryesore",
    "Statistika të avancuara — shikime, klikime, kontakte",
    "Suport prioritar me telefon dhe email brenda 4 orëve",
    'Shfaqje e logos në faqen kryesore te "Partnerët tanë të besuar"',
  ],
  vipCta: "Apliko si VIP Partner",
  compareTitle: "KRAHASIMI I PLOTË",
  compareColFeature: "Veçoria",
  compareColFree: "Falas",
  compareColStandard: "Partner",
  compareColVip: "VIP Partner",
  compareRows: [
    { feature: "Njoftime aktive", free: "Pa limit", standard: "Pa limit", vip: "Pa limit" },
    { feature: "Badge i verifikuar", free: "❌", standard: "✅", vip: "✅ VIP" },
    { feature: "Logo në faqen kryesore", free: "❌", standard: "✅ e vogël", vip: "✅ e madhe" },
    { feature: "Pozicion në kërkim", free: "Normal", standard: "Prioritar", vip: "I pari" },
    { feature: "Statistika", free: "❌", standard: "Bazë", vip: "Të avancuara" },
    { feature: "Suport", free: "—", standard: "Email 24h", vip: "Tel + Email 4h" },
    { feature: 'Shfaqje te "Partnerët"', free: "❌", standard: "❌", vip: "✅" },
  ],
  faqTitle: "PYETJET E SHPESHTA",
  faq: [
    {
      q: "Si aplikoj për Partner ose VIP Partner?",
      a: "Plotësoni formularin në faqen /partner me të dhënat e biznesit. Ekipi ynë do t'ju kontaktojë pas shqyrtimit.",
    },
    {
      q: "A ka pagesë për të aplikuar?",
      a: "Jo. Aplikimi është falas — pa pagesë online. Aktivizimi bëhet manualisht nga administratori pas miratimit.",
    },
    {
      q: "A mund të ndryshoj paketën më vonë?",
      a: "Po. Kontaktoni info@ketujemi.com për të kaluar nga Partner në VIP Partner ose anasjelltas.",
    },
    {
      q: "Cila paketë është më e mirë për fillim?",
      a: "Postimi është falas për të gjithë. Partner shton profil biznesi dhe badge; VIP shton logo në kryefaqe dhe maksimum dukshmëri.",
    },
  ],
  ctaTitle: "Gati të rritësh biznesin tënd?",
  ctaSubtitle: "Bashkohu me partnerët tanë të verifikuar dhe arrij mijëra klientë çdo ditë.",
  ctaButton: "Apliko si Partner",
  ctaFinePrint: "Pa pagesë online — do t'ju kontaktojmë pas shqyrtimit.",
};

const MK: VipPackagesPageCopy = {
  ...KS,
  docTitle: "Бизнис пакети — KetuJemi.com",
  heroBadge: "БИЗНИС ПАКЕТИ",
  heroTitle: "Изберете пакет што одговара на вашиот бизнис",
  heroSubtitle: "Зголемете ја видливоста, добијте повеќе клиенти и управувајте професионално.",
  packagesTitle: "ПАКЕТИ — СПОРЕДБА",
  standardCta: "Аплицирај како Partner",
  vipCta: "Аплицирај како VIP Partner",
  compareTitle: "ЦЕЛОСНА СПОРЕДБА",
  compareColFeature: "Карактеристика",
  compareColFree: "Бесплатно",
  compareColStandard: "Partner",
  compareColVip: "VIP Partner",
  faqTitle: "ЧЕСТО ПОСТАВУВАНИ ПРАШАЊА",
  ctaTitle: "Подготвени да го развиете бизнисот?",
  ctaSubtitle: "Придружете се на нашите верификувани партнери.",
  ctaButton: "Аплицирај како партнер",
  ctaFinePrint: "Без онлајн плаќање — ќе ве контактираме по преглед.",
};

const MNE: VipPackagesPageCopy = {
  ...KS,
  docTitle: "Biznis paketi — KetuJemi.com",
  heroBadge: "BIZNIS PAKETI",
  heroTitle: "Izaberite paket koji odgovara vašem biznisu",
  heroSubtitle: "Povećajte vidljivost, dobijte više klijenata i upravljajte profesionalno.",
  packagesTitle: "PAKETI — UPOREDBA",
  standardCta: "Prijavi se kao Partner",
  vipCta: "Prijavi se kao VIP Partner",
  compareTitle: "POTPUNA UPOREDBA",
  compareColFeature: "Karakteristika",
  compareColFree: "Besplatno",
  compareColStandard: "Partner",
  compareColVip: "VIP Partner",
  faqTitle: "ČESTO POSTAVLJANA PITANJA",
  ctaTitle: "Spremni da razvijete biznis?",
  ctaSubtitle: "Pridružite se našim verifikovanim partnerima.",
  ctaButton: "Prijavi se kao partner",
  ctaFinePrint: "Bez online plaćanja — kontaktiraćemo vas nakon pregleda.",
};

const EN: VipPackagesPageCopy = {
  ...KS,
  docTitle: "Business packages — KetuJemi.com",
  heroBadge: "BUSINESS PACKAGES",
  heroTitle: "Choose the package that fits your business",
  heroSubtitle: "Grow visibility, reach more customers, and manage your business professionally.",
  packagesTitle: "PACKAGES — COMPARE",
  standardCta: "Apply as Partner",
  vipCta: "Apply as VIP Partner",
  compareTitle: "FULL COMPARISON",
  compareColFeature: "Feature",
  compareColFree: "Free",
  compareColStandard: "Partner",
  compareColVip: "VIP Partner",
  faqTitle: "FREQUENTLY ASKED QUESTIONS",
  ctaTitle: "Ready to grow your business?",
  ctaSubtitle: "Join our verified partners and reach thousands of customers every day.",
  ctaButton: "Apply as partner",
  ctaFinePrint: "No online payment — we will contact you after review.",
};

const VIP_PACKAGES_PAGES: Record<UiTranslationLocale, VipPackagesPageCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
};

export function vipPackagesPageForLocale(locale: UiTranslationLocale): VipPackagesPageCopy {
  return VIP_PACKAGES_PAGES[locale];
}

export function useVipPackagesPage(): VipPackagesPageCopy {
  const { uiLang } = useMarket();
  return vipPackagesPageForLocale(translationKeyForUiLang(uiLang));
}
