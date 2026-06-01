import { useMarket } from "@/lib/market-context";
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
    "🆓 Plotësisht falas — 10 njoftime falas çdo muaj për çdo kategori",
    "⚡ Shpejt — njoftimi bëhet aktiv brenda minutave",
    "📱 Nga telefoni — posto nga kudo, në çdo kohë",
    "🔒 I sigurt — çdo llogari verifikohet me SMS",
    "📸 Deri 10 foto — trego produktin nga të gjitha anët",
    "👁️ Dukshmëri e lartë — njoftimet shfaqen në kërkime Google",
  ],
  stepsTitle: "SI FUNKSIONON — 3 HAPA",
  steps: [
    {
      title: "Hapi 1 — Regjistrohu",
      body: "Krijo llogarinë tënde falas me email, Google ose Facebook. Verifiko numrin e telefonit me SMS — vetëm një herë.",
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
    "10 njoftime falas në muaj për çdo kategori",
    "Çdo njoftim aktiv 3 muaj (90 ditë)",
    "Deri 10 foto për çdo njoftim",
    "Sistemi i mesazheve i integruar",
    "E disponueshme në Kosovë, Shqipëri, Maqedoni e Veriut dhe Mal i Zi",
  ],
  moreTitle: "KUR TI NEVOJITET MË SHUMË?",
  moreIntro: "Nëse biznesi yt ka nevojë për më shumë se 10 njoftime në muaj, kemi dy zgjidhje:",
  morePackagesLabel: "Kredi shtesë nga portofoli:",
  morePackages: [
    "Paketa S — €5 (~16 njoftime)",
    "Paketa M — €10 (~33 njoftime)",
    "Paketa L — €20 (~66 njoftime)",
  ],
  morePartnerBefore: "Ose bëhu ",
  morePartnerLink: "Partner i Verifikuar",
  morePartnerAfter: " për përfitime të plota biznesore",
  faqTitle: "PYETJET E SHPESHTA",
  faq: [
    {
      q: "A është vërtet falas?",
      a: "Po. 10 njoftime falas çdo muaj për çdo kategori kryesore — gjithmonë, pa kartë bankare.",
    },
    {
      q: "A duhet të kem biznes të regjistruar?",
      a: "Jo. Çdo person privat mund të hapë dyqan dhe të postojë njoftime falas.",
    },
    {
      q: "Si paguhen njoftimet shtesë?",
      a: "Vetëm kur kaloni limitin falas, mund të blini kredi nga portofoli. Asnjë detyrim paraprak.",
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
  moreTitle: "КОГА ТИ ТРЕБА ПОВЕЌЕ?",
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
  moreTitle: "KADA TI TREBA VIŠE?",
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
  stepsTitle: "HOW IT WORKS — 3 STEPS",
  includesTitle: "WHAT YOUR SHOP INCLUDES",
  moreTitle: "WHEN YOU NEED MORE?",
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
