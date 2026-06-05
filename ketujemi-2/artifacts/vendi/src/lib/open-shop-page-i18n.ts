import { useMarket } from "@/lib/market-context";
import { platformMarketsForLocale } from "@/lib/platform-markets-i18n";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type OpenShopStep = { title: string; body: string };
export type OpenShopFaq = { q: string; a: string };

export type OpenShopPageCopy = {
  docTitle: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  heroCta: string;
  whyTitle: string;
  whyBullets: string[];
  stepsTitle: string;
  steps: OpenShopStep[];
  includesTitle: string;
  includesBullets: string[];
  moreTitle: string;
  moreIntro: string;
  morePackagesLabel: string;
  morePackages: string[];
  morePartnerBefore: string;
  morePartnerLink: string;
  morePartnerAfter: string;
  faqTitle: string;
  faq: OpenShopFaq[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  ctaFinePrint: string;
};

const KS: OpenShopPageCopy = {
  docTitle: "Hap dyqanin tënd — KetuJemi.com",
  heroBadge: "HAP DYQANIN TËND",
  heroTitle: "Shite Online — Falas, Shpejt, Thjesht",
  heroSubtitle: "Krijo dyqanin tënd dixhital në KetuJemi.com dhe arrij mijëra blerës çdo ditë",
  heroTagline: "pa komisione, pa tarifa të fshehura.",
  heroCta: "Hap Dyqanin Tënd Falas",
  whyTitle: "PSE KETUJEMI?",
  whyBullets: [
    "🆓 Plotësisht falas — njoftime të pakufizuara në çdo kategori",
    "⚡ Shpejt — njoftimi bëhet aktiv brenda minutave",
    "📱 Nga telefoni — posto nga kudo, në çdo kohë",
    "🔒 I sigurt — kërkohet regjistrim dhe hyrje për të postuar",
    "📸 Deri 10 foto — trego produktin nga të gjitha anët",
    "👁️ Dukshmëri e lartë — njoftimet shfaqen në kërkime Google",
  ],
  stepsTitle: "SI FUNKSIONON — 3 HAPA",
  steps: [
    {
      title: "Hapi 1 — Regjistrohu",
      body: "Krijo llogarinë tënde falas me email, Google ose Facebook. Hyr në llogari për të postuar.",
    },
    {
      title: "Hapi 2 — Posto Njoftimin",
      body: "Zgjidhni kategorinë, shto titullin, përshkrimin, çmimin dhe deri 10 foto. Publiko me një klikim.",
    },
    {
      title: "Hapi 3 — Merr Kontakte",
      body: "Blerësit të kontaktojnë direkt përmes platformës. Ti vendos çmimin dhe kushtet — ne nuk marrim komision.",
    },
  ],
  includesTitle: "ÇFARË PËRFSHIN DYQANI YT",
  includesBullets: [
    "Profil publik i biznesit me emër dhe logo",
    "Të gjitha njoftimet e tua në një faqe të vetme",
    "Lidhje direkte — klientët të gjejnë lehtë",
    "Postim i pakufizuar dhe falas në çdo kategori",
    "Çdo njoftim aktiv 3 muaj (90 ditë)",
    "Deri 10 foto për çdo njoftim",
    "Sistemi i mesazheve i integruar",
    platformMarketsForLocale("ks").availableIn,
  ],
  moreTitle: "DUKSHMËRI SHTESË (OPSIONALE)",
  moreIntro: "Postimi është falas. Nëse doni më shumë dukshmëri për një njoftim specifik:",
  morePackagesLabel: "Promovim opsional:",
  morePackages: [
    "Boost TOP — shfaqje në kryefaqe (€2 / €5 / €8)",
  ],
  morePartnerBefore: "Ose bëhu ",
  morePartnerLink: "Partner i Verifikuar",
  morePartnerAfter: " për përfitime marketingu (logo, badge)",
  faqTitle: "PYETJET E SHPESHTA",
  faq: [
    {
      q: "A është vërtet falas?",
      a: "Po. Postimi është i pakufizuar dhe falas për të gjithë — pa kartë bankare, pa limit kategori.",
    },
    {
      q: "A duhet të kem biznes të regjistruar?",
      a: "Jo. Çdo person privat mund të hapë dyqan dhe të postojë njoftime falas.",
    },
    {
      q: "A ka pagesa për të postuar?",
      a: "Jo. Opsioni i vetëm me pagesë është Boost TOP — promovim opsional i një njoftimi në kryefaqe.",
    },
    {
      q: "A mund të fshij njoftimin kur të dua?",
      a: "Po, në çdo kohë nga Profili → Njoftimet e mia.",
    },
    {
      q: "Sa kohë qëndron aktiv njoftimi?",
      a: "3 muaj (90 ditë) — pastaj fshihet automatikisht nëse nuk e rinovoni.",
    },
  ],
  ctaTitle: "Gati të fillosh?",
  ctaSubtitle: "Mijëra blerës të presin — hap dyqanin tënd falas tani.",
  ctaButton: "Hap Dyqanin Tënd Falas",
  ctaFinePrint: "Nuk kërkohet kartë bankare. Aktivizim i menjëhershëm.",
};

const MK: OpenShopPageCopy = {
  ...KS,
  docTitle: "Отвори продавница — KetuJemi.com",
  heroBadge: "ОТВОРИ ПРОДАВНИЦА",
  heroTitle: "Продавајте онлајн — бесплатно, брзо, едноставно",
  heroSubtitle: "Создајте дигитална продавница на KetuJemi.com и стигнете до илјадници купувачи секој ден",
  heroTagline: "без провизии, без скриени трошоци.",
  heroCta: "Отвори ја твојата продавница бесплатно",
  whyTitle: "ЗОШТО KETUJEMI?",
  stepsTitle: "КАКО ФУНКЦИОНИРА — 3 ЧЕКОРИ",
  includesTitle: "ШТО ВКЛУЧУВА ТВОЈАТА ПРОДАВНИЦА",
  includesBullets: [
    ...KS.includesBullets.slice(0, -1),
    platformMarketsForLocale("mk").availableIn,
  ],
  moreTitle: "ДОПОЛНИТЕЛНА ВИДЛИВОСТ (ОПЦИОНАЛНО)",
  faqTitle: "ЧЕСТО ПОСТАВУВАНИ ПРАШАЊА",
  ctaTitle: "Подготвени да започнете?",
  ctaSubtitle: "Илјадници купувачи ве чекаат — отворете ја продавницата бесплатно сега.",
  ctaButton: "Отвори ја твојата продавница бесплатно",
  ctaFinePrint: "Не се бара картичка. Веднаш активирање.",
};

const MNE: OpenShopPageCopy = {
  ...KS,
  docTitle: "Otvori prodavnicu — KetuJemi.com",
  heroBadge: "OTVORI PRODAVNICU",
  heroTitle: "Prodaj online — besplatno, brzo, jednostavno",
  heroSubtitle: "Kreiraj digitalnu prodavnicu na KetuJemi.com i dođi do hiljada kupaca svaki dan",
  heroTagline: "bez provizija, bez skrivenih troškova.",
  heroCta: "Otvori svoju prodavnicu besplatno",
  whyTitle: "ZAŠTO KETUJEMI?",
  stepsTitle: "KAKO FUNKCIONIŠE — 3 KORAKA",
  includesTitle: "ŠTA UKLJUČUJE TVOJA PRODAVNICA",
  includesBullets: [
    ...KS.includesBullets.slice(0, -1),
    platformMarketsForLocale("mne").availableIn,
  ],
  moreTitle: "DODATNA VIDLJIVOST (OPCIONO)",
  faqTitle: "ČESTO POSTAVLJANA PITANJA",
  ctaTitle: "Spremni da počnete?",
  ctaSubtitle: "Hiljade kupaca čeka — otvorite prodavnicu besplatno sada.",
  ctaButton: "Otvori svoju prodavnicu besplatno",
  ctaFinePrint: "Kartica nije potrebna. Trenutna aktivacija.",
};

const EN: OpenShopPageCopy = {
  ...KS,
  docTitle: "Open your shop — KetuJemi.com",
  heroBadge: "OPEN YOUR SHOP",
  heroTitle: "Sell online — free, fast, simple",
  heroSubtitle: "Create your digital shop on KetuJemi.com and reach thousands of buyers every day",
  heroTagline: "no commissions, no hidden fees.",
  heroCta: "Open your shop for free",
  whyTitle: "WHY KETUJEMI?",
  whyBullets: [
    "🆓 Completely free — unlimited listings in any category",
    "⚡ Fast — your listing goes live within minutes",
    "📱 From your phone — post anytime, anywhere",
    "🔒 Secure — registration and sign-in required to post",
    "📸 Up to 10 photos — show your product from every angle",
    "👁️ High visibility — listings appear in Google search",
  ],
  stepsTitle: "HOW IT WORKS — 3 STEPS",
  steps: [
    {
      title: "Step 1 — Register",
      body: "Create your free account with email, Google or Facebook. Sign in to post.",
    },
    {
      title: "Step 2 — Post a listing",
      body: "Choose a category, add title, description, price and up to 10 photos. Publish in one click.",
    },
    {
      title: "Step 3 — Get contacts",
      body: "Buyers contact you through the platform. You set price and terms — we take no commission.",
    },
  ],
  includesTitle: "WHAT YOUR SHOP INCLUDES",
  moreTitle: "EXTRA VISIBILITY (OPTIONAL)",
  moreIntro: "Posting is free. If you want more visibility for a specific listing:",
  morePackagesLabel: "Optional promotion:",
  morePackages: ["Boost to Top — homepage placement (€2 / €5 / €8)"],
  morePartnerAfter: " for marketing benefits (logo, badge)",
  faq: [
    {
      q: "Is it really free?",
      a: "Yes. Posting is unlimited and free for everyone — no bank card, no category limits.",
    },
    {
      q: "Do I need a registered business?",
      a: "No. Any private person can open a shop and post listings for free.",
    },
    {
      q: "Are there fees to post?",
      a: "No. The only paid option is Boost to Top — optional promotion on the homepage.",
    },
    {
      q: "Can I delete a listing anytime?",
      a: "Yes, anytime from Profile → My listings.",
    },
    {
      q: "How long does a listing stay active?",
      a: "3 months (90 days) — then removed automatically unless you renew.",
    },
  ],
  faqTitle: "FREQUENTLY ASKED QUESTIONS",
  ctaTitle: "Ready to start?",
  ctaSubtitle: "Thousands of buyers are waiting — open your shop for free now.",
  ctaButton: "Open your shop for free",
  ctaFinePrint: "No bank card required. Instant activation.",
};

const OPEN_SHOP_PAGES: Record<UiTranslationLocale, OpenShopPageCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
};

export function openShopPageForLocale(locale: UiTranslationLocale): OpenShopPageCopy {
  return OPEN_SHOP_PAGES[locale];
}

export function useOpenShopPage(): OpenShopPageCopy {
  const { uiLang } = useMarket();
  return openShopPageForLocale(translationKeyForUiLang(uiLang));
}
