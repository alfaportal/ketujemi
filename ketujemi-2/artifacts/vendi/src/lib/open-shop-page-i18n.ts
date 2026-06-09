import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type OpenShopFaq = { q: string; a: string };
export type OpenShopWhyCard = { emoji: string; title: string; description: string };
export type OpenShopHowStep = {
  emoji: string;
  stepLabel: string;
  title: string;
  description: string;
};

export type OpenShopPartnershipCopy = {
  title: string;
  intro: string;
  youGetTitle: string;
  youGetItems: string[];
  weAskTitle: string;
  weAskItems: string[];
  promoTitle: string;
  promoText: string;
  coffeeTitle: string;
  coffeeText: string;
  closing: string;
};

export type OpenShopPageCopy = {
  docTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  howItWorksTitle: string;
  howItWorksSteps: OpenShopHowStep[];
  whyTitle: string;
  whyCards: OpenShopWhyCard[];
  partnership: OpenShopPartnershipCopy;
  faqTitle: string;
  faq: OpenShopFaq[];
  ctaButton: string;
};

const KS: OpenShopPageCopy = {
  docTitle: "Hap dyqanin tënd — KetuJemi.com",
  heroTitle: "Hap Dyqanin Tënd Dixhital — Falas",
  heroSubtitle:
    "Krijo dyqanin tënd dixhital në KetuJemi.com dhe arrij mijëra blerës çdo ditë pa komisione, pa tarifa të fshehura.",
  howItWorksTitle: "Si funksionon?",
  howItWorksSteps: [
    {
      emoji: "📝",
      stepLabel: "Hapi 1",
      title: "Regjistrohu",
      description: "Krijo llogarinë tënde falas në KetuJemi.com — vetëm 1 minutë",
    },
    {
      emoji: "🏪",
      stepLabel: "Hapi 2",
      title: "Hap Dyqanin",
      description:
        "Plotëso formularin e dyqanit me logon, adresën dhe rrjetet sociale. Ne e aprovojmë brenda 24 orëve.",
    },
    {
      emoji: "📸",
      stepLabel: "Hapi 3",
      title: "Posto Shpalljet",
      description: "Ngarko foto të produkteve ose shërbimeve tuaja. Pa limite, pa pagesa — falas gjithmonë.",
    },
    {
      emoji: "🚀",
      stepLabel: "Hapi 4",
      title: "Shpërndaje & Shit",
      description:
        "Shpërndaje shpalljet në Facebook, Instagram dhe TikTok me një klikim. Klientët të gjejnë lehtë!",
    },
  ],
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
  partnership: {
    title: "🤝 Bëhu VIP Partner i KetuJemi",
    intro:
      "Partneriteti me KetuJemi është bashkëpunim i ndërsjelltë — ju na ndihmoni neve, ne ju bëjmë të famshëm.",
    youGetTitle: "Çfarë merrni ju:",
    youGetItems: [
      "Logo juaj në faqen kryesore të ketujemi.com — e parë nga mijëra vizitorë çdo ditë",
      "Shpalljet dhe ofertat tuaja të publikuara çdo ditë në Instagram @jemi.ketu, Facebook KetuJemi.com dhe TikTok @ketujemi7",
      "Profil i dedikuar me adresë, hartë dhe të gjitha kontaktet tuaja",
      "Promovim i vazhdueshëm — njerëzit mësojnë për biznesin tuaj çdo ditë",
      "Rritje e ndjekësve dhe klientëve tuaj — falas",
    ],
    weAskTitle: "Çfarë kërkojmë nga ju:",
    weAskItems: [
      "Të na ndiqni në Instagram @jemi.ketu, Facebook KetuJemi.com dhe TikTok @ketujemi7",
      "Të na përmendni te ndjekësit tuaj herë pas here",
    ],
    promoTitle: "📢 Si funksionon promovimi:",
    promoText:
      "Ne i publikojmë dhe promovojmë shpalljet tuaja çdo ditë në rrjetet tona sociale — por vetëm nëse keni shpallje aktive në ketujemi.com. Një faqe bosh nuk kemi çfarë ta promovojmë — postoni produktet dhe ofertat tuaja, ne i çojmë te audienca. Sa më shumë postoni → aq më shumë ju promovojmë → aq më shumë klientë dhe shitje keni. 🚀",
    coffeeTitle: "💡 Një detaj i vogël, por i rëndësishëm:",
    coffeeText:
      "Bashkëpunimi ynë është si kafja — funksionon vetëm kur të dyja palët e hedhin sheqerin. 😄 Ne ju promovojmë çdo ditë te ndjekësit tanë — por edhe ju duhet të na ndiqni në rrjetet tona sociale. Shkurt: na ndiqni → ju bëjmë të njohur. Nuk na ndiqni → humbim të dyja palët. 🤝",
    closing: "Plotësoni formularin dhe ne ju kontaktojmë brenda 24 orëve. 📩",
  },
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
  partnership: {
    title: "🤝 Станете VIP партнер на KetuJemi",
    intro:
      "Партнерството со KetuJemi е взаемна соработка — вие ни помагате, ние ве правиме познати.",
    youGetTitle: "Што добивате вие:",
    youGetItems: [
      "Вашето лого на главната страница ketujemi.com — видено од илјадници посетители секој ден",
      "Вашите огласи и понуди објавувани секој ден на Instagram @jemi.ketu, Facebook KetuJemi.com и TikTok @ketujemi7",
      "Посветен профил со адреса, мапа и сите ваши контакти",
      "Континуирана промоција — луѓето секој ден дознаваат за вашиот бизнис",
      "Раст на вашите следбеници и клиенти — бесплатно",
    ],
    weAskTitle: "Што бараме од вас:",
    weAskItems: [
      "Да нè следите на Instagram @jemi.ketu, Facebook KetuJemi.com и TikTok @ketujemi7",
      "Повремено да нè спомнете кај вашите следбеници",
    ],
    promoTitle: "📢 Како функционира промоцијата:",
    promoText:
      "Ги објавуваме и промовираме вашите огласи секој ден на нашите социјални мрежи — но само ако имате активни огласи на ketujemi.com. Празна страница нема што да се промовира — објавувајте производи и понуди, ние ги доставуваме до публиката. Колку повеќе објавувате → повеќе ве промовираме → повеќе клиенти и продажби имате. 🚀",
    coffeeTitle: "💡 Мал, но важен детаљ:",
    coffeeText:
      "Нашата соработка е како кафе — функционира само кога двете страни ќе стават шеќер. 😄 Ние ве промовираме секој ден кај нашите следбеници — но и вие треба да нè следите на нашите социјални мрежи. Накратко: следете нè → ве правиме познати. Не нè следите → губиме и двете страни. 🤝",
    closing: "Пополнете го формуларот и ќе ве контактираме во рок од 24 часа. 📩",
  },
  docTitle: "Отвори продавница — KetuJemi.com",
  heroTitle: "Отвори ја твојата дигитална продавница — бесплатно",
  heroSubtitle:
    "Создајте ја вашата дигитална продавница на KetuJemi.com и стигнете до илјадници купувачи секој ден без провизии и без скриени трошоци.",
  howItWorksTitle: "Како функционира?",
  howItWorksSteps: [
    {
      emoji: "📝",
      stepLabel: "Чекор 1",
      title: "Регистрирај се",
      description: "Создајте бесплатна сметка на KetuJemi.com — само 1 минута",
    },
    {
      emoji: "🏪",
      stepLabel: "Чекор 2",
      title: "Отвори продавница",
      description:
        "Пополнете го формуларот со лого, адреса и социјални мрежи. Ние го одобруваме за 24 часа.",
    },
    {
      emoji: "📸",
      stepLabel: "Чекор 3",
      title: "Објави огласи",
      description: "Прикачете фотографии од производите или услугите. Без лимит, без плаќање — секогаш бесплатно.",
    },
    {
      emoji: "🚀",
      stepLabel: "Чекор 4",
      title: "Сподели и продавај",
      description:
        "Споделете ги огласите на Facebook, Instagram и TikTok со еден клик. Клиентите ве наоѓаат лесно!",
    },
  ],
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
  partnership: {
    title: "🤝 Postanite VIP partner KetuJemi",
    intro:
      "Partnerstvo sa KetuJemi je uzajamna saradnja — vi nam pomažete, mi vas činimo poznatim.",
    youGetTitle: "Šta dobijate:",
    youGetItems: [
      "Vaš logo na početnoj stranici ketujemi.com — viđen od hiljada posjetilaca svaki dan",
      "Vaši oglasi i ponude objavljivani svaki dan na Instagram @jemi.ketu, Facebook KetuJemi.com i TikTok @ketujemi7",
      "Posvećen profil sa adresom, mapom i svim vašim kontaktima",
      "Kontinuirana promocija — ljudi svaki dan saznaju za vaš biznis",
      "Rast vaših pratilaca i klijenata — besplatno",
    ],
    weAskTitle: "Šta tražimo od vas:",
    weAskItems: [
      "Da nas pratite na Instagram @jemi.ketu, Facebook KetuJemi.com i TikTok @ketujemi7",
      "Da nas povremeno spomenete svojim pratiocima",
    ],
    promoTitle: "📢 Kako funkcioniše promocija:",
    promoText:
      "Objavljujemo i promovišemo vaše oglase svaki dan na našim društvenim mrežama — ali samo ako imate aktivne oglase na ketujemi.com. Prazna stranica nema šta da se promoviše — objavite proizvode i ponude, mi ih dostavljamo publici. Što više objavljujete → više vas promovišemo → više klijenata i prodaje imate. 🚀",
    coffeeTitle: "💡 Mali, ali važan detalj:",
    coffeeText:
      "Naša saradnja je kao kafa — funkcioniše samo kada obje strane stave šećer. 😄 Mi vas promovišemo svaki dan našim pratiocima — ali i vi nas morate pratiti na našim mrežama. Ukratko: pratite nas → činimo vas poznatim. Ne pratite nas → gubimo obje strane. 🤝",
    closing: "Popunite formular i kontaktiraćemo vas u roku od 24 sata. 📩",
  },
  docTitle: "Otvori prodavnicu — KetuJemi.com",
  heroTitle: "Otvori svoju digitalnu prodavnicu — besplatno",
  heroSubtitle:
    "Kreiraj svoju digitalnu prodavnicu na KetuJemi.com i dođi do hiljada kupaca svaki dan bez provizija i skrivenih troškova.",
  howItWorksTitle: "Kako funkcioniše?",
  howItWorksSteps: [
    {
      emoji: "📝",
      stepLabel: "Korak 1",
      title: "Registruj se",
      description: "Kreiraj besplatni nalog na KetuJemi.com — samo 1 minut",
    },
    {
      emoji: "🏪",
      stepLabel: "Korak 2",
      title: "Otvori prodavnicu",
      description:
        "Popuni formular prodavnice sa logom, adresom i društvenim mrežama. Odobravamo za 24 sata.",
    },
    {
      emoji: "📸",
      stepLabel: "Korak 3",
      title: "Objavi oglase",
      description: "Učitaj fotografije proizvoda ili usluga. Bez limita, bez plaćanja — uvijek besplatno.",
    },
    {
      emoji: "🚀",
      stepLabel: "Korak 4",
      title: "Podijeli i prodaj",
      description:
        "Podijeli oglase na Facebooku, Instagramu i TikToku jednim klikom. Kupci te lako pronalaze!",
    },
  ],
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
  partnership: {
    title: "🤝 Become a KetuJemi VIP Partner",
    intro:
      "Partnering with KetuJemi is mutual cooperation — you help us, we make you famous.",
    youGetTitle: "What you get:",
    youGetItems: [
      "Your logo on the ketujemi.com homepage — seen by thousands of visitors every day",
      "Your listings and offers published daily on Instagram @jemi.ketu, Facebook KetuJemi.com and TikTok @ketujemi7",
      "A dedicated profile with address, map and all your contact details",
      "Ongoing promotion — people learn about your business every day",
      "Growth in your followers and customers — free",
    ],
    weAskTitle: "What we ask from you:",
    weAskItems: [
      "Follow us on Instagram @jemi.ketu, Facebook KetuJemi.com and TikTok @ketujemi7",
      "Mention us to your followers from time to time",
    ],
    promoTitle: "📢 How promotion works:",
    promoText:
      "We publish and promote your listings every day on our social channels — but only if you have active listings on ketujemi.com. An empty page has nothing to promote — post your products and offers, we deliver them to the audience. The more you post → the more we promote you → the more customers and sales you get. 🚀",
    coffeeTitle: "💡 A small but important detail:",
    coffeeText:
      "Our cooperation is like coffee — it only works when both sides add sugar. 😄 We promote you every day to our followers — but you also need to follow us on our social channels. In short: follow us → we make you known. Don't follow us → we both lose. 🤝",
    closing: "Fill in the form and we will contact you within 24 hours. 📩",
  },
  docTitle: "Open your shop — KetuJemi.com",
  heroTitle: "Open Your Digital Shop — Free",
  heroSubtitle:
    "Create your digital shop on KetuJemi.com and reach thousands of buyers every day with no commissions and no hidden fees.",
  howItWorksTitle: "How it works",
  howItWorksSteps: [
    {
      emoji: "📝",
      stepLabel: "Step 1",
      title: "Sign up",
      description: "Create your free account on KetuJemi.com — just 1 minute",
    },
    {
      emoji: "🏪",
      stepLabel: "Step 2",
      title: "Open your shop",
      description:
        "Fill in the shop form with your logo, address and social links. We approve within 24 hours.",
    },
    {
      emoji: "📸",
      stepLabel: "Step 3",
      title: "Post listings",
      description: "Upload photos of your products or services. No limits, no fees — always free.",
    },
    {
      emoji: "🚀",
      stepLabel: "Step 4",
      title: "Share & sell",
      description:
        "Share listings on Facebook, Instagram and TikTok with one click. Customers find you easily!",
    },
  ],
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

const FR: OpenShopPageCopy = {
  ...KS,
  partnership: {
    title: "🤝 Devenir partenaire VIP KetuJemi",
    intro: "Le partenariat avec KetuJemi est une coopération mutuelle — vous nous aidez, nous vous rendons visible.",
    youGetTitle: "Ce que vous obtenez :",
    youGetItems: [
      "Votre logo sur la page d'accueil ketujemi.com — vu par des milliers de visiteurs chaque jour",
      "Vos annonces et offres publiées chaque jour sur Instagram @jemi.ketu, Facebook KetuJemi.com et TikTok @ketujemi7",
      "Un profil dédié avec adresse, carte et toutes vos coordonnées",
      "Promotion continue — les gens découvrent votre activité chaque jour",
      "Croissance de vos abonnés et clients — gratuitement",
    ],
    weAskTitle: "Ce que nous vous demandons :",
    weAskItems: [
      "Suivez-nous sur Instagram @jemi.ketu, Facebook KetuJemi.com et TikTok @ketujemi7",
      "Mentionnez-nous auprès de vos abonnés de temps en temps",
    ],
    promoTitle: "📢 Comment fonctionne la promotion :",
    promoText: "Nous publions et promouvons vos annonces chaque jour sur nos réseaux — mais seulement si vous avez des annonces actives sur ketujemi.com. Une page vide n'a rien à promouvoir — publiez vos produits et offres, nous les diffusons au public. Plus vous publiez → plus nous vous promouvons → plus de clients et de ventes. 🚀",
    coffeeTitle: "💡 Un petit détail important :",
    coffeeText: "Notre coopération est comme le café — elle ne fonctionne que si les deux côtés ajoutent du sucre. 😄 Nous vous promouvons chaque jour auprès de nos abonnés — mais vous devez aussi nous suivre sur nos réseaux. En bref : suivez-nous → nous vous rendons visible. Ne nous suivez pas → nous perdons tous les deux. 🤝",
    closing: "Remplissez le formulaire et nous vous contacterons sous 24 heures. 📩",
  },
  docTitle: "Ouvrir votre boutique — KetuJemi.com",
  heroTitle: "Ouvrez votre boutique en ligne — Gratuit",
  heroSubtitle: "Créez votre boutique numérique sur KetuJemi.com et touchez des milliers d'acheteurs chaque jour sans commission ni frais cachés.",
  howItWorksTitle: "Comment ça marche",
  howItWorksSteps: [
    {
      emoji: "📝",
      stepLabel: "Étape 1",
      title: "S'inscrire",
      description: "Créez votre compte gratuit sur KetuJemi.com — une minute suffit",
    },
    {
      emoji: "🏪",
      stepLabel: "Étape 2",
      title: "Ouvrir votre boutique",
      description: "Remplissez le formulaire boutique avec logo, adresse et réseaux sociaux. Nous approuvons sous 24 heures.",
    },
    {
      emoji: "📸",
      stepLabel: "Étape 3",
      title: "Publier des annonces",
      description: "Téléversez des photos de vos produits ou services. Sans limite, sans frais — toujours gratuit.",
    },
    {
      emoji: "🚀",
      stepLabel: "Étape 4",
      title: "Partager et vendre",
      description: "Partagez vos annonces sur Facebook, Instagram et TikTok en un clic. Les clients vous trouvent facilement !",
    },
  ],
  whyTitle: "POURQUOI KETUJEMI ?",
  whyCards: [
    {
      emoji: "🆓",
      title: "Entièrement gratuit",
      description: "Pas de carte bancaire, pas de frais cachés, pas de commissions",
    },
    {
      emoji: "⚡",
      title: "Actif sous 24 heures",
      description: "Postulez aujourd'hui, votre boutique est en ligne demain",
    },
    {
      emoji: "📱",
      title: "Depuis votre téléphone",
      description: "Gérez votre boutique partout, à tout moment",
    },
    {
      emoji: "🔒",
      title: "Sécurisé",
      description: "Inscription et connexion requises pour publier",
    },
    {
      emoji: "📸",
      title: "Photos illimitées + vidéo",
      description: "Montrez votre produit sous tous les angles",
    },
    {
      emoji: "🌍",
      title: "Portée mondiale",
      description: "Kosovo, Albanie, Macédoine du Nord, Monténégro et la diaspora",
    },
    {
      emoji: "🔍",
      title: "Grande visibilité",
      description: "Votre boutique apparaît dans Google",
    },
    {
      emoji: "🏪",
      title: "Page dédiée",
      description: "Votre boutique a sa propre adresse sur KetuJemi",
    },
    {
      emoji: "📍",
      title: "Google Maps",
      description: "Les clients vous trouvent facilement",
    },
    {
      emoji: "📊",
      title: "Pas d'algorithme",
      description: "Chaque annonce est affichée également, sans frais supplémentaires",
    },
  ],
  faqTitle: "QUESTIONS FRÉQUENTES",
  faq: [
    {
      q: "Est-ce vraiment gratuit ?",
      a: "Oui — la publication est entièrement gratuite et illimitée pour tous, sans carte bancaire ni frais cachés.",
    },
    {
      q: "Ai-je besoin d'une entreprise enregistrée ?",
      a: "Non. Toute personne peut ouvrir une boutique et publier gratuitement.",
    },
    {
      q: "Y a-t-il des frais ?",
      a: "La publication est gratuite. La seule option payante est Boost TOP — promotion facultative en tête des résultats.",
    },
    {
      q: "Combien de photos par annonce ?",
      a: "Photos illimitées et une vidéo jusqu'à 150 Mo par annonce.",
    },
    {
      q: "Puis-je supprimer une annonce quand je veux ?",
      a: "Oui, à tout moment depuis Profil → Mes annonces.",
    },
    {
      q: "Combien de temps une annonce reste-t-elle active ?",
      a: "3 mois (90 jours) — puis renouvellement gratuit en un clic.",
    },
    {
      q: "Des personnes d'autres villes et marchés peuvent-elles voir ma boutique ?",
      a: "Oui — votre boutique est visible par tous les visiteurs KetuJemi, où qu'ils soient. Un acheteur à Pristina peut trouver votre boutique à Ferizaj, Tirana, Skopje ou dans la diaspora en Allemagne, Suisse, Italie, etc. Vos produits touchent ainsi des milliers d'acheteurs chaque jour — sans frais publicitaires, sans commissions, sans limites géographiques. Plus vous publiez → plus on vous trouve → plus vous vendez.",
    },
  ],
  ctaButton: "🏪 Ouvrir votre boutique gratuitement →",
};

const OPEN_SHOP_PAGES: Record<UiTranslationLocale, OpenShopPageCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function openShopPageForLocale(locale: UiTranslationLocale): OpenShopPageCopy {
  return OPEN_SHOP_PAGES[locale];
}

export function useOpenShopPage(): OpenShopPageCopy {
  const { uiLang } = useMarket();
  return openShopPageForLocale(translationKeyForUiLang(uiLang));
}
