import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type AdvertiseAdType = {
  title: string;
  bullets: string[];
};

export type AdvertiseStep = { title: string; body: string };

export type AdvertisePageCopy = {
  docTitle: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  adTypesTitle: string;
  adTypes: AdvertiseAdType[];
  whyTitle: string;
  whyBullets: string[];
  stepsTitle: string;
  steps: AdvertiseStep[];
  contactTitle: string;
  contactIntro: string;
  contactEmailLabel: string;
  contactEmail: string;
  contactSubjectLabel: string;
  contactSubjectExample: string;
  contactPhoneLabel: string;
  contactPhone: string;
  contactHoursLabel: string;
  contactHours: string;
  contactResponseNote: string;
};

const KS: AdvertisePageCopy = {
  docTitle: "Reklamoni — KetuJemi.com",
  heroBadge: "REKLAMONI",
  heroTitle: "Arrini Klientët e Duhur në Kohën e Duhur",
  heroSubtitle:
    "Hapësirat reklamuese ekskluzive në KetuJemi.com — platforma kryesore shqiptare e shpalljeve me mbi 50,000 vizitorë aktivë çdo muaj.",
  adTypesTitle: "LLOJET E REKLAMAVE",
  adTypes: [
    {
      title: "1. Banner Kryesor (Leaderboard)",
      bullets: [
        "Shfaqet në krye të faqes kryesore — e para gjë që sheh vizitori",
        "Dimensionet: 728×90 px (desktop) / 320×50 px (mobile)",
        "Targetim: të gjithë vizitorët e platformës",
        "Ideal për: njohuri të markës, lansim produkti, oferta sezonale",
      ],
    },
    {
      title: "2. Njoftime të Sponsorizuara",
      bullets: [
        'Njoftimi juaj shfaqet në krye të kategorisë së zgjedhur — para të gjithë të tjerëve',
        'Shënuar si "Sponsorizuar" — dukshmëri e lartë, besueshmëri e ruajtur',
        "Targetim sipas kategorisë: Vetura, Elektronikë, Patundshmëri, etj.",
        "Ideal për: shitje produktesh specifike, promovim dyqani",
      ],
    },
    {
      title: "3. Banner Anësor (Sidebar)",
      bullets: [
        "Shfaqet në anën e djathtë të faqeve të kategorive dhe njoftimeve",
        "Dimensionet: 300×250 px",
        "Targetim sipas kategorisë dhe lokacionit",
        "Ideal për: biznese lokale, shërbime rajonale",
      ],
    },
    {
      title: "4. Paketa e Personalizuar",
      bullets: [
        "Kombinim i disa hapësirave reklamuese sipas nevojave tuaja",
        "Raport i detajuar i performancës — shikime, klikime, konvertime",
        "Menaxher i dedikuar reklamash",
        "Ideal për: biznese të mëdha, kampanja reklamuese afatgjata",
      ],
    },
  ],
  whyTitle: "PSE REKLAMONI TE NE?",
  whyBullets: [
    "👥 50,000+ vizitorë aktivë çdo muaj — audiencë e targetuar",
    "🎯 Targetim sipas kategorisë dhe lokacionit — arrini klientët e duhur",
    "📱 Desktop dhe mobile — reklamat shfaqen në të gjitha pajisjet",
    "📊 Raporte të detajuara — shikoni saktësisht performancën e reklamës",
    "🔒 Audiencë e verifikuar — çdo përdorues me numër telefoni të verifikuar",
    "⚡ Aktivizim i shpejtë — reklamat live brenda 24 orëve",
  ],
  stepsTitle: "SI FUNKSIONON",
  steps: [
    {
      title: "Hapi 1 — Na Kontaktoni",
      body: "Dërgoni email në info@ketujemi.com me emrin e biznesit, llojin e reklamës dhe periudhën e dëshiruar.",
    },
    {
      title: "Hapi 2 — Marrim Ofertën",
      body: "Brenda 24 orëve ju dërgojmë ofertën e personalizuar me çmimin dhe detajet.",
    },
    {
      title: "Hapi 3 — Dërgoni Materialin",
      body: "Na dërgoni banerin ose tekstin e njoftimit të sponsorizuar sipas dimensioneve të kërkuara.",
    },
    {
      title: "Hapi 4 — Live",
      body: "Reklamat aktivizohen brenda 24 orëve.",
    },
  ],
  contactTitle: "NA KONTAKTONI",
  contactIntro: "Për ofertë reklamuese ose çdo pyetje:",
  contactEmailLabel: "Email:",
  contactEmail: "info@ketujemi.com",
  contactSubjectLabel: "Subjekti:",
  contactSubjectExample: "«Kërkesë Reklamë — [emri i biznesit]»",
  contactPhoneLabel: "Telefon:",
  contactPhone: "+383 43 555 294",
  contactHoursLabel: "Orari:",
  contactHours: "E Hënë – E Premte, 09:00 – 17:00",
  contactResponseNote: "Përgjigjemi brenda 24 orëve në ditët e punës.",
};

const MK: AdvertisePageCopy = {
  docTitle: "Рекламирај — KetuJemi.com",
  heroBadge: "РЕКЛАМИРАЈ",
  heroTitle: "Достигнете ги вистинските клиенти во вистинско време",
  heroSubtitle:
    "Ексклузивни рекламни простори на KetuJemi.com — водечката албанска платформа за огласи со над 50.000 активни посетители месечно.",
  adTypesTitle: "ВИДОВИ РЕКЛАМИ",
  adTypes: [
    {
      title: "1. Главен банер (Leaderboard)",
      bullets: [
        "Се прикажува на врвот на главната страница — првото што го гледа посетителот",
        "Димензии: 728×90 px (desktop) / 320×50 px (mobile)",
        "Таргетирање: сите посетители на платформата",
        "Идеално за: препознатливост на бренд, лансирање производ, сезонски понуди",
      ],
    },
    {
      title: "2. Спонзорирани огласи",
      bullets: [
        "Вашиот оглас се прикажува на врвот на избраната категорија — пред сите други",
        'Означен како "Спонзорирано" — висока видливост, зачувана доверба',
        "Таргетирање по категорија: Возила, Електроника, Недвижности, итн.",
        "Идеално за: продажба на конкретни производи, промоција на продавница",
      ],
    },
    {
      title: "3. Страничен банер (Sidebar)",
      bullets: [
        "Се прикажува од десната страна на страниците со категории и огласи",
        "Димензии: 300×250 px",
        "Таргетирање по категорија и локација",
        "Идеално за: локални бизниси, регионални услуги",
      ],
    },
    {
      title: "4. Персонализиран пакет",
      bullets: [
        "Комбинација од повеќе рекламни простори според вашите потреби",
        "Детален извештај за перформанси — прегледи, кликови, конверзии",
        "Посветен менаџер за реклами",
        "Идеално за: поголеми бизниси, долготрајни рекламни кампањи",
      ],
    },
  ],
  whyTitle: "ЗОШТО КАЈ НАС?",
  whyBullets: [
    "👥 50.000+ активни посетители месечно — таргетирана публика",
    "🎯 Таргетирање по категорија и локација — стигнете до вистинските клиенти",
    "📱 Desktop и mobile — рекламите се прикажуваат на сите уреди",
    "📊 Детални извештаи — видете ја точната перформанса на рекламата",
    "🔒 Верификувана публика — секој корисник со верификуван телефонски број",
    "⚡ Брза активација — рекламите live во рок од 24 часа",
  ],
  stepsTitle: "КАКО ФУНКЦИОНИРА",
  steps: [
    {
      title: "Чекор 1 — Контактирајте не",
      body: "Испратете email на info@ketujemi.com со името на бизнисот, видот на реклама и посакуваниот период.",
    },
    {
      title: "Чекор 2 — Добивате понуда",
      body: "Во рок од 24 часа ви ја испраќаме персонализираната понуда со цена и детали.",
    },
    {
      title: "Чекор 3 — Испратете материјал",
      body: "Испратете ни го банерот или текстот на спонзорираниот оглас според бараните димензии.",
    },
    {
      title: "Чекор 4 — Live",
      body: "Рекламите се активираат во рок од 24 часа.",
    },
  ],
  contactTitle: "КОНТАКТ",
  contactIntro: "За рекламна понуда или прашања:",
  contactEmailLabel: "Email:",
  contactEmail: "info@ketujemi.com",
  contactSubjectLabel: "Предмет:",
  contactSubjectExample: "«Барање за реклама — [име на бизнис]»",
  contactPhoneLabel: "Телефон:",
  contactPhone: "+383 43 555 294",
  contactHoursLabel: "Работно време:",
  contactHours: "Понеделник – Петок, 09:00 – 17:00",
  contactResponseNote: "Одговараме во рок од 24 часа во работни денови.",
};

const MNE: AdvertisePageCopy = {
  docTitle: "Reklamiraj — KetuJemi.com",
  heroBadge: "REKLAMIRAJ",
  heroTitle: "Dođite do pravih klijenata u pravo vrijeme",
  heroSubtitle:
    "Ekskluzivni reklamni prostori na KetuJemi.com — vodeća albanska platforma oglasa sa preko 50.000 aktivnih posjetilaca mjesečno.",
  adTypesTitle: "VRSTE REKLAMA",
  adTypes: [
    {
      title: "1. Glavni baner (Leaderboard)",
      bullets: [
        "Prikazuje se na vrhu glavne stranice — prvo što posjetilac vidi",
        "Dimenzije: 728×90 px (desktop) / 320×50 px (mobile)",
        "Targetiranje: svi posjetioci platforme",
        "Idealno za: prepoznatljivost brenda, lansiranje proizvoda, sezonske ponude",
      ],
    },
    {
      title: "2. Sponsorizovani oglasi",
      bullets: [
        "Vaš oglas se prikazuje na vrhu izabrane kategorije — ispred svih ostalih",
        'Označeno kao "Sponsorizovano" — visoka vidljivost, očuvano povjerenje',
        "Targetiranje po kategoriji: Vozila, Elektronika, Nekretnine, itd.",
        "Idealno za: prodaju specifičnih proizvoda, promociju prodavnice",
      ],
    },
    {
      title: "3. Bočni baner (Sidebar)",
      bullets: [
        "Prikazuje se sa desne strane stranica kategorija i oglasa",
        "Dimenzije: 300×250 px",
        "Targetiranje po kategoriji i lokaciji",
        "Idealno za: lokalne biznise, regionalne usluge",
      ],
    },
    {
      title: "4. Personalizovani paket",
      bullets: [
        "Kombinacija više reklamnih prostora prema vašim potrebama",
        "Detaljan izvještaj performansi — pregledi, klikovi, konverzije",
        "Posvećeni menadžer reklama",
        "Idealno za: veće biznise, dugoročne reklamne kampanje",
      ],
    },
  ],
  whyTitle: "ZAŠTO KOD NAS?",
  whyBullets: [
    "👥 50.000+ aktivnih posjetilaca mjesečno — ciljana publika",
    "🎯 Targetiranje po kategoriji i lokaciji — dođite do pravih klijenata",
    "📱 Desktop i mobile — reklame se prikazuju na svim uređajima",
    "📊 Detaljni izvještaji — vidite tačnu performansu reklame",
    "🔒 Verifikovana publika — svaki korisnik sa verifikovanim brojem telefona",
    "⚡ Brza aktivacija — reklame live u roku od 24 sata",
  ],
  stepsTitle: "KAKO FUNKCIONIŠE",
  steps: [
    {
      title: "Korak 1 — Kontaktirajte nas",
      body: "Pošaljite email na info@ketujemi.com sa imenom biznisa, vrstom reklame i željenim periodom.",
    },
    {
      title: "Korak 2 — Dobijate ponudu",
      body: "U roku od 24 sata šaljemo personalizovanu ponudu sa cijenom i detaljima.",
    },
    {
      title: "Korak 3 — Pošaljite materijal",
      body: "Pošaljite nam baner ili tekst sponsorizovanog oglasa prema traženim dimenzijama.",
    },
    {
      title: "Korak 4 — Live",
      body: "Reklame se aktiviraju u roku od 24 sata.",
    },
  ],
  contactTitle: "KONTAKT",
  contactIntro: "Za reklamnu ponudu ili pitanja:",
  contactEmailLabel: "Email:",
  contactEmail: "info@ketujemi.com",
  contactSubjectLabel: "Predmet:",
  contactSubjectExample: "«Zahtjev za reklamu — [ime biznisa]»",
  contactPhoneLabel: "Telefon:",
  contactPhone: "+383 43 555 294",
  contactHoursLabel: "Radno vrijeme:",
  contactHours: "Ponedjeljak – Petak, 09:00 – 17:00",
  contactResponseNote: "Odgovaramo u roku od 24 sata radnim danima.",
};

const EN: AdvertisePageCopy = {
  docTitle: "Advertise — KetuJemi.com",
  heroBadge: "ADVERTISE",
  heroTitle: "Reach the right customers at the right time",
  heroSubtitle:
    "Exclusive ad placements on KetuJemi.com — the leading Albanian classifieds platform with 50,000+ active visitors every month.",
  adTypesTitle: "AD TYPES",
  adTypes: [
    {
      title: "1. Main banner (Leaderboard)",
      bullets: [
        "Shown at the top of the homepage — the first thing visitors see",
        "Dimensions: 728×90 px (desktop) / 320×50 px (mobile)",
        "Targeting: all platform visitors",
        "Ideal for: brand awareness, product launches, seasonal offers",
      ],
    },
    {
      title: "2. Sponsored listings",
      bullets: [
        "Your listing appears at the top of the chosen category — above everyone else",
        'Marked as "Sponsored" — high visibility with trust preserved',
        "Category targeting: Vehicles, Electronics, Real estate, etc.",
        "Ideal for: specific product sales, shop promotion",
      ],
    },
    {
      title: "3. Sidebar banner",
      bullets: [
        "Shown on the right side of category and listing pages",
        "Dimensions: 300×250 px",
        "Targeting by category and location",
        "Ideal for: local businesses, regional services",
      ],
    },
    {
      title: "4. Custom package",
      bullets: [
        "A combination of ad placements tailored to your needs",
        "Detailed performance report — views, clicks, conversions",
        "Dedicated ads manager",
        "Ideal for: larger businesses, long-term ad campaigns",
      ],
    },
  ],
  whyTitle: "WHY ADVERTISE WITH US?",
  whyBullets: [
    "👥 50,000+ active visitors every month — a targeted audience",
    "🎯 Category and location targeting — reach the right customers",
    "📱 Desktop and mobile — ads shown on all devices",
    "📊 Detailed reports — see exactly how your ad performs",
    "🔒 Verified audience — every user with a verified phone number",
    "⚡ Fast activation — ads go live within 24 hours",
  ],
  stepsTitle: "HOW IT WORKS",
  steps: [
    {
      title: "Step 1 — Contact us",
      body: "Email info@ketujemi.com with your business name, ad type, and desired period.",
    },
    {
      title: "Step 2 — Receive your quote",
      body: "Within 24 hours we send a personalized quote with price and details.",
    },
    {
      title: "Step 3 — Send your assets",
      body: "Send us the banner or sponsored listing text in the required dimensions.",
    },
    {
      title: "Step 4 — Live",
      body: "Ads go live within 24 hours.",
    },
  ],
  contactTitle: "CONTACT US",
  contactIntro: "For advertising quotes or any questions:",
  contactEmailLabel: "Email:",
  contactEmail: "info@ketujemi.com",
  contactSubjectLabel: "Subject:",
  contactSubjectExample: "«Advertising request — [business name]»",
  contactPhoneLabel: "Phone:",
  contactPhone: "+383 43 555 294",
  contactHoursLabel: "Hours:",
  contactHours: "Monday – Friday, 09:00 – 17:00",
  contactResponseNote: "We respond within 24 hours on business days.",
};

const FR: AdvertisePageCopy = {
  docTitle: "Advertise — KetuJemi.com",
  heroBadge: "ADVERTISE",
  heroTitle: "Reach the right customers at the right time",
  heroSubtitle: "Exclusive ad placements on KetuJemi.com — the leading Albanian classifieds platform with 50,000+ active visitors every month.",
  adTypesTitle: "AD TYPES",
  adTypes: [
    {
      title: "1. Main banner (Leaderboard)",
      bullets: [
        "Shown at the top of the homepage — the first thing visitors see",
        "Dimensions: 728×90 px (desktop) / 320×50 px (mobile)",
        "Targeting: all platform visitors",
        "Ideal for: brand awareness, product launches, seasonal offers",
      ],
    },
    {
      title: "2. Sponsored listings",
      bullets: [
        "Your listing appears at the top of the chosen category — above everyone else",
        'Marked as "Sponsored" — high visibility with trust preserved',
        "Catégorie targeting: Vehicles, Electronics, Real estate, etc.",
        "Ideal for: specific product sales, shop promotion",
      ],
    },
    {
      title: "3. Sidebar banner",
      bullets: [
        "Shown on the right side of category and listing pages",
        "Dimensions: 300×250 px",
        "Targeting by category and location",
        "Ideal for: local businesses, regional services",
      ],
    },
    {
      title: "4. Custom package",
      bullets: [
        "A combination of ad placements tailored to your needs",
        "Detailed performance report — views, clicks, conversions",
        "Dedicated ads manager",
        "Ideal for: larger businesses, long-term ad campaigns",
      ],
    },
  ],
  whyTitle: "WHY ADVERTISE WITH US?",
  whyBullets: [
    "👥 50,000+ active visitors every month — a targeted audience",
    "🎯 Catégorie and location targeting — reach the right customers",
    "📱 Desktop and mobile — ads shown on all devices",
    "📊 Detailed reports — see exactly how your ad performs",
    "🔒 Verified audience — every user with a verified phone number",
    "⚡ Fast activation — ads go live within 24 hours",
  ],
  stepsTitle: "HOW IT WORKS",
  steps: [
    {
      title: "Step 1 — Nous contacter",
      body: "Email info@ketujemi.com with your business name, ad type, and desired period.",
    },
    {
      title: "Step 2 — Receive your quote",
      body: "Within 24 hours we send a personalized quote with price and details.",
    },
    {
      title: "Step 3 — Send your assets",
      body: "Send us the banner or sponsored listing text in the required dimensions.",
    },
    {
      title: "Step 4 — Live",
      body: "Ads go live within 24 hours.",
    },
  ],
  contactTitle: "CONTACT US",
  contactIntro: "For advertising quotes or any questions:",
  contactEmailLabel: "Email:",
  contactEmail: "info@ketujemi.com",
  contactSubjectLabel: "Subject:",
  contactSubjectExample: "«Advertising request — [business name]»",
  contactPhoneLabel: "Téléphone :",
  contactPhone: "+383 43 555 294",
  contactHoursLabel: "Hours:",
  contactHours: "Lundi – Vendredi, 09:00 – 17:00",
  contactResponseNote: "We respond within 24 hours on business days.",
};

const ADVERTISE_PAGES: Record<UiTranslationLocale, AdvertisePageCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function advertisePageForLocale(locale: UiTranslationLocale): AdvertisePageCopy {
  return ADVERTISE_PAGES[locale];
}

export function useAdvertisePage(): AdvertisePageCopy {
  const { uiLang } = useMarket();
  return advertisePageForLocale(translationKeyForUiLang(uiLang));
}
