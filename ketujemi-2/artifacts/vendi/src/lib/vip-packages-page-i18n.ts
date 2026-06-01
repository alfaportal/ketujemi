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
  standardPrice: string;
  periodPerMonth: string;
  standardFeatures: string[];
  standardCta: string;
  vipTitle: string;
  vipPrice: string;
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
  standardTitle: "PARTNER STANDARD",
  standardPrice: "€30",
  periodPerMonth: "/muaj",
  standardFeatures: [
    "Dyqan i personalizuar në KetuJemi.com",
    "Deri 50 njoftime aktive njëkohësisht",
    "Logo e biznesit me link në faqen kryesore",
    'Badge "Partner i Verifikuar" në çdo njoftim',
    "Panel biznesi me statistika bazë",
    "Suport me email brenda 24 orëve",
    "Prioritet ndaj njoftimeve të rregullta",
  ],
  standardCta: "Zgjidhni Standard",
  vipTitle: "VIP PARTNER",
  vipPrice: "€50",
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
  vipCta: "Zgjidhni VIP",
  compareTitle: "KRAHASIMI I PLOTË",
  compareColFeature: "Veçoria",
  compareColFree: "Falas",
  compareColStandard: "Standard €30",
  compareColVip: "VIP €50",
  compareRows: [
    { feature: "Njoftime aktive", free: "10/muaj/kategori", standard: "50", vip: "100" },
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
      q: "A mund të ndryshoj paketën më vonë?",
      a: "Po. Mund të kaloni nga Standard në VIP ose anasjelltas në çdo kohë — ndryshimi bëhet nga paneli juaj.",
    },
    {
      q: "Si bëhet pagesa?",
      a: "Me kartë bankare përmes Stripe — e sigurt dhe automatike çdo muaj.",
    },
    {
      q: "A mund ta anuloj kur të dua?",
      a: "Po. Anuloni në çdo kohë me 30 ditë njoftim paraprak me email.",
    },
    {
      q: "A rimbursohen pagesat?",
      a: "Pagesat e bëra nuk rimbursohen sipas kushteve të kontratës.",
    },
    {
      q: "Cila paketë është më e mirë për fillim?",
      a: "Nëse keni deri 50 njoftime, Standard është i mjaftueshëm. Nëse doni maksimum dukshmëri dhe del i pari në kërkim — VIP është investimi i duhur.",
    },
  ],
  ctaTitle: "Gati të rritësh biznesin tënd?",
  ctaSubtitle: "Bashkohu me partnerët tanë të verifikuar dhe arrij mijëra klientë çdo ditë.",
  ctaButton: "Regjistrohu si Partner",
  ctaFinePrint: "Aktivizim i menjëhershëm pas pagesës së parë.",
};

const MK: VipPackagesPageCopy = {
  ...KS,
  docTitle: "Бизнис пакети — KetuJemi.com",
  heroBadge: "БИЗНИС ПАКЕТИ",
  heroTitle: "Изберете пакет што одговара на вашиот бизнис",
  heroSubtitle: "Зголемете ја видливоста, добијте повеќе клиенти и управувајте професионално.",
  packagesTitle: "ПАКЕТИ — СПОРЕДБА",
  standardCta: "Изберете Standard",
  vipCta: "Изберете VIP",
  compareTitle: "ЦЕЛОСНА СПОРЕДБА",
  compareColFeature: "Карактеристика",
  compareColFree: "Бесплатно",
  compareColStandard: "Standard €30",
  compareColVip: "VIP €50",
  faqTitle: "ЧЕСТО ПОСТАВУВАНИ ПРАШАЊА",
  ctaTitle: "Подготвени да го развиете бизнисот?",
  ctaSubtitle: "Придружете се на нашите верификувани партнери.",
  ctaButton: "Регистрирајте се како партнер",
  ctaFinePrint: "Веднаш активирање по првата уплата.",
};

const MNE: VipPackagesPageCopy = {
  ...KS,
  docTitle: "Biznis paketi — KetuJemi.com",
  heroBadge: "BIZNIS PAKETI",
  heroTitle: "Izaberite paket koji odgovara vašem biznisu",
  heroSubtitle: "Povećajte vidljivost, dobijte više klijenata i upravljajte profesionalno.",
  packagesTitle: "PAKETI — UPOREDBA",
  standardCta: "Izaberite Standard",
  vipCta: "Izaberite VIP",
  compareTitle: "POTPUNA UPOREDBA",
  compareColFeature: "Karakteristika",
  compareColFree: "Besplatno",
  compareColStandard: "Standard €30",
  compareColVip: "VIP €50",
  faqTitle: "ČESTO POSTAVLJANA PITANJA",
  ctaTitle: "Spremni da razvijete biznis?",
  ctaSubtitle: "Pridružite se našim verifikovanim partnerima.",
  ctaButton: "Registrujte se kao partner",
  ctaFinePrint: "Trenutna aktivacija nakon prve uplate.",
};

const EN: VipPackagesPageCopy = {
  ...KS,
  docTitle: "Business packages — KetuJemi.com",
  heroBadge: "BUSINESS PACKAGES",
  heroTitle: "Choose the package that fits your business",
  heroSubtitle: "Grow visibility, reach more customers, and manage your business professionally.",
  packagesTitle: "PACKAGES — COMPARE",
  standardCta: "Choose Standard",
  vipCta: "Choose VIP",
  compareTitle: "FULL COMPARISON",
  compareColFeature: "Feature",
  compareColFree: "Free",
  compareColStandard: "Standard €30",
  compareColVip: "VIP €50",
  faqTitle: "FREQUENTLY ASKED QUESTIONS",
  ctaTitle: "Ready to grow your business?",
  ctaSubtitle: "Join our verified partners and reach thousands of customers every day.",
  ctaButton: "Register as a partner",
  ctaFinePrint: "Instant activation after your first payment.",
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
