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
    "📸 Foto të pakufizuara — trego produktin nga të gjitha anët",
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
      body: "Zgjidhni kategorinë, shto titullin, përshkrimin, çmimin, foto të pakufizuara dhe një video. Publiko me një klikim.",
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
    "Foto të pakufizuara dhe video për çdo shpallje",
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
      a: "Po — postimi është plotësisht falas dhe i pakufizuar për të gjithë, pa kartë bankare, pa tarifa të fshehura.",
    },
    {
      q: "A duhet të kem biznes të regjistruar?",
      a: "Jo. Çdo person privat mund të hapë dyqan dhe të postojë shpallje falas.",
    },
    {
      q: "A ka pagesa?",
      a: "Postimi është falas. Opsioni i vetëm me pagesë është Boost TOP — promovim opsional për të shfaqur shpalljen në krye të kërkimeve.",
    },
    {
      q: "Sa foto mund të ngarkojë për shpallje?",
      a: "Mund të ngarkoni foto të pakufizuara dhe një video deri në 150MB për çdo shpallje.",
    },
    {
      q: "A mund të fshij shpalljen kur të dua?",
      a: "Po, në çdo kohë nga Profili → Njoftimet e mia.",
    },
    {
      q: "Sa kohë qëndron aktive shpallja?",
      a: "3 muaj (90 ditë) — pastaj rinovohet falas me një klikim.",
    },
    {
      q: "A mund ta shohin dyqanin tim njerëzit nga qytete dhe tregje të ndryshme?",
      a: "Po — dyqani juaj është i dukshëm për të gjithë vizitorët e KetuJemi, pavarësisht nga ku janë. Një blerës nga Prishtina mund të gjejë dyqanin tuaj në Ferizaj, Tiranë, Shkup apo diaspora shqiptare në Gjermani, Zvicër, Itali dhe më gjerë. Kjo do të thotë që produktet tuaja arrijnë mijëra blerës të mundshëm çdo ditë — pa kosto reklamimi, pa komisione, pa kufij gjeografikë. Sa më shumë shpallje postoni → aq më shumë njerëz ju gjejnë → aq më shumë shitje keni.",
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
  faq: [
    {
      q: "Дали навистина е бесплатно?",
      a: "Да — објавувањето е целосно бесплатно и неограничено за сите, без банкарска картичка, без скриени трошоци.",
    },
    {
      q: "Дали морам да имам регистриран бизнис?",
      a: "Не. Секое физичко лице може да отвори продавница и да објавува огласи бесплатно.",
    },
    {
      q: "Дали има плаќања?",
      a: "Објавувањето е бесплатно. Единствената платена опција е Boost TOP — опционална промоција за приказ на огласот на врвот на пребарувањата.",
    },
    {
      q: "Колку фотографии можам да прикачам по оглас?",
      a: "Можете да прикачите неограничени фотографии и едно видео до 150MB за секој оглас.",
    },
    {
      q: "Дали можам да го избришам огласот кога сакам?",
      a: "Да, во секое време од Профил → Мои огласи.",
    },
    {
      q: "Колку долго останува активен огласот?",
      a: "3 месеци (90 дена) — потоа се обновува бесплатно со еден клик.",
    },
    {
      q: "Дали луѓе од различни градови и пазари можат да ја видат мојата продавница?",
      a: "Да — вашата продавница е видлива за сите посетители на KetuJemi, без разлика од каде се. Купувач од Скопје може да ја најде вашата продавница во Прилеп, Тирана, Приштина или албанската дијаспора во Германија, Швајцарија, Италија и пошироко. Тоа значи дека вашите производи стигнуваат до илјадници потенцијални купувачи секој ден — без трошоци за рекламирање, без провизии, без географски ограничувања. Колку повеќе огласи објавувате → повеќе луѓе ве наоѓаат → повеќе продажби имате.",
    },
  ],
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
  faq: [
    {
      q: "Da li je stvarno besplatno?",
      a: "Da — objavljivanje je potpuno besplatno i neograničeno za sve, bez bankovne kartice, bez skrivenih troškova.",
    },
    {
      q: "Da li moram imati registrovan biznis?",
      a: "Ne. Svaka fizička osoba može otvoriti prodavnicu i besplatno objavljivati oglase.",
    },
    {
      q: "Da li ima plaćanja?",
      a: "Objavljivanje je besplatno. Jedina plaćena opcija je Boost TOP — opcionalna promocija za prikaz oglasa na vrhu pretrage.",
    },
    {
      q: "Koliko fotografija mogu učitati po oglasu?",
      a: "Možete učitati neograničen broj fotografija i jedan video do 150MB po oglasu.",
    },
    {
      q: "Mogu li obrisati oglas kad god želim?",
      a: "Da, u bilo kom trenutku iz Profil → Moji oglasi.",
    },
    {
      q: "Koliko dugo oglas ostaje aktivan?",
      a: "3 mjeseca (90 dana) — zatim se besplatno obnavlja jednim klikom.",
    },
    {
      q: "Mogu li ljudi iz različitih gradova i tržišta vidjeti moju prodavnicu?",
      a: "Da — vaša prodavnica je vidljiva svim posjetiocima KetuJemi, bez obzira odakle su. Kupac iz Podgorice može pronaći vašu prodavnicu u Tivtu, Tirani, Skoplju ili albanskoj diaspori u Njemačkoj, Švicarskoj, Italiji i šire. To znači da vaši proizvodi dnevno stižu do hiljada potencijalnih kupaca — bez troškova oglašavanja, bez provizija, bez geografskih ograničenja. Što više oglasa objavite → više ljudi vas pronalazi → više prodaje imate.",
    },
  ],
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
    "📸 Unlimited photos — show your product from every angle",
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
      body: "Choose a category, add title, description, price, unlimited photos and a video. Publish in one click.",
    },
    {
      title: "Step 3 — Get contacts",
      body: "Buyers contact you through the platform. You set price and terms — we take no commission.",
    },
  ],
  includesTitle: "WHAT YOUR SHOP INCLUDES",
  includesBullets: [
    "Public business profile with name and logo",
    "All your listings on one page",
    "Direct links — clients find you easily",
    "Unlimited free posting in any category",
    "Each listing active for 3 months (90 days)",
    "Unlimited photos and video per listing",
    "Integrated messaging system",
    platformMarketsForLocale("en").availableIn,
  ],
  moreTitle: "EXTRA VISIBILITY (OPTIONAL)",
  moreIntro: "Posting is free. If you want more visibility for a specific listing:",
  morePackagesLabel: "Optional promotion:",
  morePackages: ["Boost to Top — homepage placement (€2 / €5 / €8)"],
  morePartnerAfter: " for marketing benefits (logo, badge)",
  faq: [
    {
      q: "Is it really free?",
      a: "Yes — posting is completely free and unlimited for everyone, with no bank card and no hidden fees.",
    },
    {
      q: "Do I need a registered business?",
      a: "No. Any private person can open a shop and post listings for free.",
    },
    {
      q: "Are there any fees?",
      a: "Posting is free. The only paid option is Boost TOP — optional promotion to show your listing at the top of search results.",
    },
    {
      q: "How many photos can I upload per listing?",
      a: "You can upload unlimited photos and one video up to 150MB per listing.",
    },
    {
      q: "Can I delete a listing whenever I want?",
      a: "Yes, anytime from Profile → My listings.",
    },
    {
      q: "How long does a listing stay active?",
      a: "3 months (90 days) — then renews for free with one click.",
    },
    {
      q: "Can people from different cities and markets see my shop?",
      a: "Yes — your shop is visible to all KetuJemi visitors, no matter where they are. A buyer in Pristina can find your shop in Ferizaj, Tirana, Skopje or the Albanian diaspora in Germany, Switzerland, Italy and beyond. That means your products reach thousands of potential buyers every day — no advertising costs, no commissions, no geographic limits. The more listings you post → the more people find you → the more sales you make.",
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
