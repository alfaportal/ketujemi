import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type OpenShopFaq = { q: string; a: string };
export type OpenShopWhyCard = { emoji: string; title: string; description: string };

export type OpenShopPageCopy = {
  docTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  whyTitle: string;
  whyCards: OpenShopWhyCard[];
  faqTitle: string;
  faq: OpenShopFaq[];
  ctaButton: string;
};

const KS: OpenShopPageCopy = {
  docTitle: "Hap dyqanin tënd — KetuJemi.com",
  heroTitle: "Hap Dyqanin Tënd Dixhital — Falas",
  heroSubtitle:
    "Krijo dyqanin tënd dixhital në KetuJemi.com dhe arrij mijëra blerës çdo ditë pa komisione, pa tarifa të fshehura.",
  whyTitle: "PSE KETUJEMI?",
  whyCards: [
    {
      emoji: "🆓",
      title: "Plotësisht falas",
      description: "Pa kartë bankare, pa tarifa të fshehura, pa komisione",
    },
    {
      emoji: "⚡",
      title: "Aktiv brenda 24 orëve",
      description: "Apliko sot, nesër dyqani yt është live",
    },
    {
      emoji: "📱",
      title: "Nga telefoni",
      description: "Menaxho dyqanin tënd nga kudo, në çdo kohë",
    },
    {
      emoji: "🔒",
      title: "I sigurt",
      description: "Kërkohet regjistrim dhe hyrje për të postuar",
    },
    {
      emoji: "📸",
      title: "Foto të pakufizuara + video",
      description: "Trego produktin nga të gjitha anët",
    },
    {
      emoji: "🌍",
      title: "Arrihet nga e gjithë bota",
      description: "Kosovë, Shqipëri, Maqedoni, Mal i Zi dhe Diaspora",
    },
    {
      emoji: "🔍",
      title: "Dukshmëri e lartë",
      description: "Dyqani yt shfaqet në kërkim Google",
    },
    {
      emoji: "🏪",
      title: "Faqe e dedikuar",
      description: "Dyqani yt ka adresë të veçantë në KetuJemi",
    },
    {
      emoji: "📍",
      title: "Hartë Google Maps",
      description: "Klientët të gjejnë lehtë",
    },
    {
      emoji: "📊",
      title: "Pa algoritëm",
      description: "Çdo shpallje shihet njësoj, pa pagesë shtesë",
    },
  ],
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
      q: "Sa foto mund të ngarkoj për shpallje?",
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
  ctaButton: "🏪 Hap Dyqanin Tënd Falas →",
};

const MK: OpenShopPageCopy = {
  ...KS,
  docTitle: "Отвори продавница — KetuJemi.com",
  heroTitle: "Отвори ја твојата дигитална продавница — бесплатно",
  heroSubtitle:
    "Создајте ја вашата дигитална продавница на KetuJemi.com и стигнете до илјадници купувачи секој ден без провизии и без скриени трошоци.",
  whyTitle: "ЗОШТО KETUJEMI?",
  whyCards: [
    {
      emoji: "🆓",
      title: "Целосно бесплатно",
      description: "Без банкарска картичка, без скриени трошоци, без провизии",
    },
    {
      emoji: "⚡",
      title: "Активна за 24 часа",
      description: "Аплицирајте денес, утре продавницата е live",
    },
    {
      emoji: "📱",
      title: "Од телефон",
      description: "Управувајте ја продавницата од каде било, во секое време",
    },
    {
      emoji: "🔒",
      title: "Безбедно",
      description: "Потребна е регистрација и најава за објавување",
    },
    {
      emoji: "📸",
      title: "Неограничени фотографии + видео",
      description: "Прикажете го производот од сите страни",
    },
    {
      emoji: "🌍",
      title: "Достапно низ целиот свет",
      description: "Косово, Албанија, Македонија, Црна Гора и дијаспора",
    },
    {
      emoji: "🔍",
      title: "Висока видливост",
      description: "Вашата продавница се појавува во Google пребарување",
    },
    {
      emoji: "🏪",
      title: "Посветена страница",
      description: "Вашата продавница има сопствена адреса на KetuJemi",
    },
    {
      emoji: "📍",
      title: "Google Maps",
      description: "Клиентите ве наоѓаат лесно",
    },
    {
      emoji: "📊",
      title: "Без алгоритам",
      description: "Секој оглас се гледа подеднакво, без дополнителни трошоци",
    },
  ],
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
  ctaButton: "🏪 Отвори ја твојата продавница бесплатно →",
};

const MNE: OpenShopPageCopy = {
  ...KS,
  docTitle: "Otvori prodavnicu — KetuJemi.com",
  heroTitle: "Otvori svoju digitalnu prodavnicu — besplatno",
  heroSubtitle:
    "Kreiraj svoju digitalnu prodavnicu na KetuJemi.com i dođi do hiljada kupaca svaki dan bez provizija i skrivenih troškova.",
  whyTitle: "ZAŠTO KETUJEMI?",
  whyCards: [
    {
      emoji: "🆓",
      title: "Potpuno besplatno",
      description: "Bez bankovne kartice, bez skrivenih troškova, bez provizija",
    },
    {
      emoji: "⚡",
      title: "Aktivno za 24 sata",
      description: "Prijavite se danas, sutra prodavnica je live",
    },
    {
      emoji: "📱",
      title: "Sa telefona",
      description: "Upravljajte prodavnicom odakle god, u bilo koje vrijeme",
    },
    {
      emoji: "🔒",
      title: "Sigurno",
      description: "Potrebna je registracija i prijava za objavljivanje",
    },
    {
      emoji: "📸",
      title: "Neograničene fotografije + video",
      description: "Pokažite proizvod sa svih strana",
    },
    {
      emoji: "🌍",
      title: "Dostupno širom svijeta",
      description: "Kosovo, Albanija, Makedonija, Crna Gora i dijaspora",
    },
    {
      emoji: "🔍",
      title: "Visoka vidljivost",
      description: "Vaša prodavnica se pojavljuje u Google pretrazi",
    },
    {
      emoji: "🏪",
      title: "Posvećena stranica",
      description: "Vaša prodavnica ima vlastitu adresu na KetuJemi",
    },
    {
      emoji: "📍",
      title: "Google Maps",
      description: "Kupci vas lako pronalaze",
    },
    {
      emoji: "📊",
      title: "Bez algoritma",
      description: "Svaki oglas se vidi jednako, bez dodatnih troškova",
    },
  ],
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
  ctaButton: "🏪 Otvori svoju prodavnicu besplatno →",
};

const EN: OpenShopPageCopy = {
  ...KS,
  docTitle: "Open your shop — KetuJemi.com",
  heroTitle: "Open Your Digital Shop — Free",
  heroSubtitle:
    "Create your digital shop on KetuJemi.com and reach thousands of buyers every day with no commissions and no hidden fees.",
  whyTitle: "WHY KETUJEMI?",
  whyCards: [
    {
      emoji: "🆓",
      title: "Completely free",
      description: "No bank card, no hidden fees, no commissions",
    },
    {
      emoji: "⚡",
      title: "Active within 24 hours",
      description: "Apply today, your shop is live tomorrow",
    },
    {
      emoji: "📱",
      title: "From your phone",
      description: "Manage your shop anywhere, anytime",
    },
    {
      emoji: "🔒",
      title: "Secure",
      description: "Registration and sign-in required to post",
    },
    {
      emoji: "📸",
      title: "Unlimited photos + video",
      description: "Show your product from every angle",
    },
    {
      emoji: "🌍",
      title: "Reach worldwide",
      description: "Kosovo, Albania, North Macedonia, Montenegro and the diaspora",
    },
    {
      emoji: "🔍",
      title: "High visibility",
      description: "Your shop appears in Google search",
    },
    {
      emoji: "🏪",
      title: "Dedicated page",
      description: "Your shop has its own address on KetuJemi",
    },
    {
      emoji: "📍",
      title: "Google Maps",
      description: "Customers find you easily",
    },
    {
      emoji: "📊",
      title: "No algorithm",
      description: "Every listing is shown equally, no extra fees",
    },
  ],
  faqTitle: "FREQUENTLY ASKED QUESTIONS",
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
  ctaButton: "🏪 Open your shop for free →",
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
