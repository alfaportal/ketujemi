import type { AppExtraMarketCode } from "@/lib/app-extra-i18n";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";

export type StaticPageLocaleKey = Extract<AppExtraMarketCode, "ks" | "mk" | "mne">;

type PageSection = {
  title: string;
  paragraphs?: string[];
  bulletsIntro?: string;
  bullets?: string[];
};

export type TermsPrivacyCopy = {
  title: string;
  sections: PageSection[];
  /** Privacy page only — label before support@ketujemi.com link */
  privacyEmailLabel?: string;
};

export type ContactSubject = { value: string; label: string };

export type ContactCopy = {
  title: string;
  contactSectionTitle: string;
  emailLabel: string;
  supportEmailLabel: string;
  facebookLabel: string;
  instagramLabel: string;
  formTitle: string;
  nameLabel: string;
  emailFieldLabel: string;
  subjectLabel: string;
  messageLabel: string;
  subjectPlaceholder: string;
  subjects: ContactSubject[];
  submitBtn: string;
  toastRequired: string;
  toastSuccess: string;
  toastError: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export type FaqItemCopy = {
  q: string;
  a?: string;
  aEmail?: { before: string; between: string; after: string };
};

export type FaqCopy = {
  title: string;
  sections: { title: string; items: FaqItemCopy[] }[];
};

export type StaticPagesCopy = {
  terms: TermsPrivacyCopy;
  privacy: TermsPrivacyCopy;
  contact: ContactCopy;
  faq: FaqCopy;
};

const KS: StaticPagesCopy = {
  terms: {
    title: "Kushtet e Përdorimit",
    sections: [
      {
        title: "Hyrje",
        paragraphs: [
          "KetuJemi.com është platformë shpalljesh për Kosovë, Shqipëri, Maqedoni dhe Mal të Zi. Diaspora nga Gjermani, Zvicër, Austri, Francë, Itali, Angli dhe SHBA. Duke përdorur platformën, pranoni këto kushte.",
        ],
      },
      {
        title: "Kush mund të përdorë platformën",
        bullets: [
          "Çdo person mbi 18 vjeç",
          "Biznese të regjistruara",
          "Diaspora shqiptare jashtë vendit",
        ],
      },
      {
        title: "Rregullat e Postimit",
        bullets: [
          "Shpalljet duhet të jenë të vërteta dhe të sakta",
          "Foto reale të produktit/shërbimit",
          "Çmim i saktë në Euro (€)",
          "Kontakt i vlefshëm",
        ],
      },
      {
        title: "Shpalljet e Ndaluara",
        bullets: [
          "Armë dhe municione",
          "Droga dhe substanca të ndaluara",
          "Produkte të falsifikuara",
          "Përmbajtje pornografike",
          "Kafshë të egra / të mbrojtura",
          "Shërbime ilegale",
        ],
      },
      {
        title: "Limitet e Shpalljeve Falas",
        bullets: [
          "Përdorues: 10 shpallje falas për kategori + verifikim",
          "VIP: E pakufizuar (30€ muaj)",
        ],
      },
      {
        title: "Përgjegjësia",
        paragraphs: [
          "KetuJemi.com nuk është palë në transaksione mes blerësit dhe shitësit. Platforma nuk mban përgjegjësi për mashtrime apo mosmarrëveshje mes palëve.",
        ],
      },
      {
        title: "Sanksionet",
        bullets: [
          "Paralajmërim i parë: fshirje shpalljeje",
          "Shkelje e dytë: pezullim 30 ditë",
          "Shkelje e tretë: bllokimi i përhershëm i llogarisë",
        ],
      },
    ],
  },
  privacy: {
    title: "Politika e Privatësisë",
    sections: [
      {
        title: "Të dhënat që mbledhim",
        bullets: [
          "Emri dhe mbiemri",
          "Numri i telefonit",
          "Adresa email",
          "Qyteti/Lokacioni",
          "Fotot e ngarkuara",
        ],
      },
      {
        title: "Si i përdorim të dhënat",
        bullets: [
          "Për verifikimin e llogarisë (SMS)",
          "Për komunikim mes blerësit dhe shitësit",
          "Për përmirësimin e platformës",
          "Për njoftime të rëndësishme",
        ],
      },
      {
        title: "Mbrojtja e të dhënave",
        bullets: [
          "Nuk i shesim të dhënat tuaja palëve të treta",
          "Të dhënat ruhen në serverë të sigurt",
          "Enkriptim SSL për të gjitha komunikimet",
        ],
      },
      {
        title: "Cookies",
        bulletsIntro: "Platforma përdor cookies për:",
        bullets: [
          "Ruajtjen e sesionit të hyrjes",
          "Preferencat e përdoruesit",
          "Statistikat anonime",
        ],
      },
      {
        title: "E drejta juaj",
        bullets: [
          "Mund të kërkoni fshirjen e llogarisë",
          "Mund të ndryshoni të dhënat personale",
          "Mund të çaktivizoni cookies nga browser-i",
        ],
      },
      {
        title: "Kontakt për Privatësi",
      },
    ],
    privacyEmailLabel: "Email:",
  },
  contact: {
    title: "Na Kontaktoni",
    contactSectionTitle: "Kontakti",
    emailLabel: "Info:",
    supportEmailLabel: "Support:",
    facebookLabel: "Facebook:",
    instagramLabel: "Instagram:",
    formTitle: "Formulari i kontaktit",
    nameLabel: "Emri juaj",
    emailFieldLabel: "Email",
    subjectLabel: "Subjekti",
    messageLabel: "Mesazhi",
    subjectPlaceholder: "Zgjidhni subjektin",
    subjects: [
      { value: "pyetje", label: "Pyetje" },
      { value: "problem", label: "Problem teknik" },
      { value: "raportim", label: "Raportim" },
      { value: "partneritet", label: "Partneritet" },
      { value: "tjeter", label: "Tjetër" },
    ],
    submitBtn: "Dërgo Mesazhin",
    toastRequired: "Plotësoni të gjitha fushat e detyrueshme",
    toastSuccess: "Mesazhi u dërgua. Do t'ju përgjigjemi së shpejti.",
    toastError: "Mesazhi nuk u dërgua. Provoni përsëri ose na shkruani me email.",
    faqTitle: "Pyetje të shpeshta (FAQ)",
    faq: [
      {
        q: "Si të postoj një shpallje?",
        a: 'Klikoni "Posto Shpallje", zgjidhni kategorinë, plotësoni të dhënat dhe ngarkoni fotot.',
      },
      {
        q: "Sa kushton postimi?",
        a: "10 shpallje falas për kategori për përdoruesit privatë.",
      },
      {
        q: "Si të verifikoj llogarinë?",
        a: "Me numrin e telefonit - do të merrni SMS me kod konfirmimi.",
      },
      {
        q: "Çfarë bëj nëse dikush po mashtron?",
        a: 'Klikoni "Raporto" në shpallje ose na kontaktoni direkt.',
      },
      {
        q: "A mund të postoj nga jashtë vendit?",
        a: "Po! Diaspora nga Gjermani, Zvicër, Austri, Francë, Itali, Angli dhe SHBA mund të postojë normalisht.",
      },
    ],
  },
  faq: {
    title: "Pyetjet e Shpeshta (FAQ)",
    sections: [
      {
        title: "Postimi i Shpalljeve",
        items: [
          {
            q: "Si të postoj një shpallje?",
            a: 'Klikoni "+ Posto Shpallje", zgjidhni kategorinë, plotësoni të dhënat dhe ngarkoni fotot. Shpallja publikohet menjëherë.',
          },
          {
            q: "Sa shpallje falas mund të postoj?",
            a: "Përdoruesit kanë 10 shpallje falas për çdo kategori + verifikim.",
          },
          {
            q: "A mund të postoj nga jashtë vendit?",
            a: "Po! Diaspora nga Gjermani, Zvicër, Austri, Francë, Itali, Angli dhe SHBA mund të postojë normalisht me numrin e tyre të telefonit.",
          },
          {
            q: "Sa foto mund të ngarkoi për një shpallje?",
            a: "Deri në 10 foto për shpallje.",
          },
        ],
      },
      {
        title: "Llogaria & Siguria",
        items: [
          {
            q: "Si të krijoj llogari?",
            a: "Me numër telefoni (SMS) ose Google. Numri i telefonit kërkohet gjithmonë para postimit të parë.",
          },
          {
            q: "Si të verifikoj llogarinë?",
            a: "Do të merrni SMS me kod 6-shifror. Futeni kodin dhe llogaria aktivizohet menjëherë.",
          },
          {
            q: "Çfarë bëj nëse harroj fjalëkalimin?",
            a: 'Klikoni "Harrova fjalëkalimin" dhe do të merrni SMS ose email për rivendosje.',
          },
        ],
      },
      {
        title: "Blerja & Shitja",
        items: [
          {
            q: "A është KetuJemi falas?",
            a: "Po! Postimi bazë është plotësisht falas!",
          },
          {
            q: "Si të kontaktoj shitësin?",
            a: 'Klikoni "Kontakto Shitësin" në shpallje dhe dërgoni mesazh direkt.',
          },
          {
            q: "Çfarë bëj nëse dikush po mashtron?",
            aEmail: {
              before: 'Klikoni "Raporto" në shpallje ose na kontaktoni në ',
              between: " dhe ",
              after: ". Veprojmë brenda 24 orëve.",
            },
          },
          {
            q: "A garanton KetuJemi produktet?",
            a: "KetuJemi është platformë ndërmjetëse. Ju rekomandojmë të takoheni personalisht dhe të kontrolloni produktin para blerjes.",
          },
        ],
      },
      {
        title: "Paketat VIP",
        items: [
          {
            q: "Çfarë është paketa VIP?",
            a: 'Paketa VIP ofron shpallje të pakufizuara, pozicion të lartë në kërkim dhe badge "VIP" për 30€ muaj.',
          },
          {
            q: "Kur aktivizohet paketa VIP?",
            a: "Paketa VIP aktivizohet për disa përdorues!",
          },
        ],
      },
      {
        title: "Teknik",
        items: [
          {
            q: "A funksionon KetuJemi në telefon?",
            a: "Po! KetuJemi është optimizuar për telefon. Mund ta përdorni nga çdo pajisje.",
          },
          {
            q: "Në cilat vende funksionon KetuJemi?",
            a: "Kosovë, Shqipëri, Maqedoni e Veriut dhe Mal i Zi. Plus diaspora në 7 vende të Europës dhe SHBA.",
          },
        ],
      },
    ],
  },
};

const MK: StaticPagesCopy = {
  terms: {
    title: "Услови за користење",
    sections: [
      {
        title: "Вовед",
        paragraphs: [
          "KetuJemi.com е платформа за огласи за Косово, Албанија, Македонија и Црна Гора. Дијаспората од Германија, Швајцарија, Австрија, Франција, Италија, Англија и САД. Со користење на платформата, ги прифаќате овие услови.",
        ],
      },
      {
        title: "Ко може да ја користи платформата",
        bullets: [
          "Секое лице над 18 години",
          "Регистрирани бизниси",
          "Албанска дијаспора надвор од земјата",
        ],
      },
      {
        title: "Правила за објавување",
        bullets: [
          "Огласите мора да бидат вистинити и точни",
          "Реални фотографии на производот/услугата",
          "Точна цена во евра (€)",
          "Важечки контакт",
        ],
      },
      {
        title: "Забранети огласи",
        bullets: [
          "Оружје и муниција",
          "Дрога и забранети супстанци",
          "Фалсификувани производи",
          "Порнографска содржина",
          "Диви / заштитени животни",
          "Нелегални услуги",
        ],
      },
      {
        title: "Лимити на бесплатни огласи",
        bullets: [
          "Корисници: 10 бесплатни огласи по категорија + верификација",
          "VIP: Неограничено (30€ месечно)",
        ],
      },
      {
        title: "Одговорност",
        paragraphs: [
          "KetuJemi.com не е страна во трансакциите помеѓу купувачот и продавачот. Платформата не носи одговорност за измами или несогласувања помеѓу страните.",
        ],
      },
      {
        title: "Санкции",
        bullets: [
          "Прво предупредување: бришење на оглас",
          "Второ прекршување: суспензија 30 дена",
          "Трето прекршување: трајно блокирање на сметката",
        ],
      },
    ],
  },
  privacy: {
    title: "Политика на приватност",
    sections: [
      {
        title: "Податоци што ги собираме",
        bullets: [
          "Име и презиме",
          "Телефонски број",
          "Email адреса",
          "Град/Локација",
          "Прикачени фотографии",
        ],
      },
      {
        title: "Како ги користиме податоците",
        bullets: [
          "За верификација на сметката (SMS)",
          "За комуникација помеѓу купувачот и продавачот",
          "За подобрување на платформата",
          "За важни известувања",
        ],
      },
      {
        title: "Заштита на податоците",
        bullets: [
          "Не ги продаваме вашите податоци на трети страни",
          "Податоците се чуваат на безбедни сервери",
          "SSL енкрипција за сета комуникација",
        ],
      },
      {
        title: "Cookies",
        bulletsIntro: "Платформата користи cookies за:",
        bullets: [
          "Зачувување на сесијата за најава",
          "Кориснички преференци",
          "Анонимна статистика",
        ],
      },
      {
        title: "Вашите права",
        bullets: [
          "Можете да побарате бришење на сметката",
          "Можете да ги промените личните податоци",
          "Можете да оневозможите cookies од прелистувачот",
        ],
      },
      {
        title: "Контакт за приватност",
      },
    ],
    privacyEmailLabel: "Email:",
  },
  contact: {
    title: "Контактирајте нè",
    contactSectionTitle: "Контакт",
    emailLabel: "Info:",
    supportEmailLabel: "Support:",
    facebookLabel: "Facebook:",
    instagramLabel: "Instagram:",
    formTitle: "Контакт формулар",
    nameLabel: "Вашето име",
    emailFieldLabel: "Email",
    subjectLabel: "Тема",
    messageLabel: "Порака",
    subjectPlaceholder: "Изберете тема",
    subjects: [
      { value: "pyetje", label: "Прашање" },
      { value: "problem", label: "Технички проблем" },
      { value: "raportim", label: "Пријава" },
      { value: "partneritet", label: "Партнерство" },
      { value: "tjeter", label: "Друго" },
    ],
    submitBtn: "Испрати порака",
    toastRequired: "Пополнете ги сите задолжителни полиња",
    toastSuccess: "Пораката е испратена. Ќе ви одговориме наскоро.",
    toastError: "Пораката не е испратена. Обидете се повторно или пишете ни на email.",
    faqTitle: "Често поставувани прашања (FAQ)",
    faq: [
      {
        q: "Како да објавам оглас?",
        a: 'Кликнете "Објави оглас", изберете категорија, пополнете ги податоците и прикачете фотографии.',
      },
      {
        q: "Колку чини објавувањето?",
        a: "10 бесплатни огласи по категорија за приватни корисници.",
      },
      {
        q: "Како да ја верификувам сметката?",
        a: "Со телефонски број — ќе добиете SMS со код за потврда.",
      },
      {
        q: "Што да направам ако некој измамува?",
        a: 'Кликнете "Пријави" на огласот или контактирајте нè директно.',
      },
      {
        q: "Дали можам да објавувам од странство?",
        a: "Да! Дијаспората од Германија, Швајцарија, Австрија, Франција, Италија, Англија и САД може нормално да објавува.",
      },
    ],
  },
  faq: {
    title: "Често поставувани прашања (FAQ)",
    sections: [
      {
        title: "Објавување огласи",
        items: [
          {
            q: "Како да објавам оглас?",
            a: 'Кликнете "+ Објави оглас", изберете категорија, пополнете ги податоците и прикачете фотографии. Огласот се објавува веднаш.',
          },
          {
            q: "Колку бесплатни огласи можам да објавам?",
            a: "Корисниците имаат 10 бесплатни огласи по категорија + верификација.",
          },
          {
            q: "Дали можам да објавувам од странство?",
            a: "Да! Дијаспората од Германија, Швајцарија, Австрија, Франција, Италија, Англија и САД може нормално да објавува со својот телефонски број.",
          },
          {
            q: "Колку фотографии можам да прикачам за еден оглас?",
            a: "До 10 фотографии по оглас.",
          },
        ],
      },
      {
        title: "Сметка и безбедност",
        items: [
          {
            q: "Како да креирам сметка?",
            a: "Со телефонски број (SMS) или Google. Телефонскиот број е задолжителен пред првото објавување.",
          },
          {
            q: "Како да ја верификувам сметката?",
            a: "Ќе добиете SMS со 6-цифрен код. Внесете го кодот и сметката се активира веднаш.",
          },
          {
            q: "Што да направам ако ја заборавам лозинката?",
            a: 'Кликнете "Ја заборавив лозинката" и ќе добиете SMS или email за ресетирање.',
          },
        ],
      },
      {
        title: "Купување и продавање",
        items: [
          {
            q: "Дали KetuJemi е бесплатен?",
            a: "Да! Основното објавување е целосно бесплатно!",
          },
          {
            q: "Како да го контактирам продавачот?",
            a: 'Кликнете "Контактирај продавач" на огласот и испратете директна порака.',
          },
          {
            q: "Што да направам ако некој измамува?",
            aEmail: {
              before: 'Кликнете "Пријави" на огласот или контактирајте нè на ',
              between: " и ",
              after: ". Дејствуваме во рок од 24 часа.",
            },
          },
          {
            q: "Дали KetuJemi гарантира производите?",
            a: "KetuJemi е посредничка платформа. Ви препорачуваме лично средба и проверка на производот пред купување.",
          },
        ],
      },
      {
        title: "VIP пакети",
        items: [
          {
            q: "Што е VIP пакетот?",
            a: 'VIP пакетот нуди неограничени огласи, висока позиција во пребарување и badge "VIP" за 30€ месечно.',
          },
          {
            q: "Кога се активира VIP пакетот?",
            a: "VIP пакетот се активира за некои корисници!",
          },
        ],
      },
      {
        title: "Техничко",
        items: [
          {
            q: "Дали KetuJemi работи на телефон?",
            a: "Да! KetuJemi е оптимизиран за телефон. Можете да го користите од секој уред.",
          },
          {
            q: "На кои места функционира KetuJemi?",
            a: "Косово, Албанија, Северна Македонија и Црна Гора. Плус дијаспора во 7 европски земји и САД.",
          },
        ],
      },
    ],
  },
};

const MNE: StaticPagesCopy = {
  terms: {
    title: "Uslovi korišćenja",
    sections: [
      {
        title: "Uvod",
        paragraphs: [
          "KetuJemi.com je platforma za oglase za Kosovo, Albaniju, Makedoniju i Crnu Goru. Dijaspora iz Njemačke, Švicarske, Austrije, Francuske, Italije, Engleske i SAD. Korišćenjem platforme prihvatate ove uslove.",
        ],
      },
      {
        title: "Ko može koristiti platformu",
        bullets: [
          "Svaka osoba starija od 18 godina",
          "Registrovani biznisi",
          "Albanska dijaspora van zemlje",
        ],
      },
      {
        title: "Pravila objavljivanja",
        bullets: [
          "Oglasi moraju biti istiniti i tačni",
          "Stvarne fotografije proizvoda/usluge",
          "Tačna cijena u eurima (€)",
          "Važeći kontakt",
        ],
      },
      {
        title: "Zabranjeni oglasi",
        bullets: [
          "Oružje i municija",
          "Droga i zabranjene supstance",
          "Falsifikovani proizvodi",
          "Pornografski sadržaj",
          "Divlje / zaštićene životinje",
          "Ilegalne usluge",
        ],
      },
      {
        title: "Limiti besplatnih oglasa",
        bullets: [
          "Korisnici: 10 besplatnih oglasa po kategoriji + verifikacija",
          "VIP: Neograničeno (30€ mjesečno)",
        ],
      },
      {
        title: "Odgovornost",
        paragraphs: [
          "KetuJemi.com nije strana u transakcijama između kupca i prodavca. Platforma ne snosi odgovornost za prevare ili nesporazume između strana.",
        ],
      },
      {
        title: "Sankcije",
        bullets: [
          "Prvo upozorenje: brisanje oglasa",
          "Drugo kršenje: suspenzija 30 dana",
          "Treće kršenje: trajno blokiranje naloga",
        ],
      },
    ],
  },
  privacy: {
    title: "Politika privatnosti",
    sections: [
      {
        title: "Podaci koje prikupljamo",
        bullets: [
          "Ime i prezime",
          "Broj telefona",
          "Email adresa",
          "Grad/Lokacija",
          "Učitane fotografije",
        ],
      },
      {
        title: "Kako koristimo podatke",
        bullets: [
          "Za verifikaciju naloga (SMS)",
          "Za komunikaciju između kupca i prodavca",
          "Za poboljšanje platforme",
          "Za važna obavještenja",
        ],
      },
      {
        title: "Zaštita podataka",
        bullets: [
          "Ne prodajemo vaše podatke trećim stranama",
          "Podaci se čuvaju na sigurnim serverima",
          "SSL enkripcija za svu komunikaciju",
        ],
      },
      {
        title: "Cookies",
        bulletsIntro: "Platforma koristi cookies za:",
        bullets: [
          "Čuvanje sesije prijave",
          "Korisničke preference",
          "Anonimnu statistiku",
        ],
      },
      {
        title: "Vaša prava",
        bullets: [
          "Možete zatražiti brisanje naloga",
          "Možete promijeniti lične podatke",
          "Možete onemogućiti cookies u pregledaču",
        ],
      },
      {
        title: "Kontakt za privatnost",
      },
    ],
    privacyEmailLabel: "Email:",
  },
  contact: {
    title: "Kontaktirajte nas",
    contactSectionTitle: "Kontakt",
    emailLabel: "Info:",
    supportEmailLabel: "Support:",
    facebookLabel: "Facebook:",
    instagramLabel: "Instagram:",
    formTitle: "Kontakt formular",
    nameLabel: "Vaše ime",
    emailFieldLabel: "Email",
    subjectLabel: "Predmet",
    messageLabel: "Poruka",
    subjectPlaceholder: "Izaberite predmet",
    subjects: [
      { value: "pyetje", label: "Pitanje" },
      { value: "problem", label: "Tehnički problem" },
      { value: "raportim", label: "Prijava" },
      { value: "partneritet", label: "Partnerstvo" },
      { value: "tjeter", label: "Ostalo" },
    ],
    submitBtn: "Pošalji poruku",
    toastRequired: "Popunite sva obavezna polja",
    toastSuccess: "Poruka je poslata. Odgovorićemo vam uskoro.",
    toastError: "Poruka nije poslata. Pokušajte ponovo ili nam pišite na email.",
    faqTitle: "Često postavljana pitanja (FAQ)",
    faq: [
      {
        q: "Kako da objavim oglas?",
        a: 'Kliknite "Objavi oglas", izaberite kategoriju, popunite podatke i učitajte fotografije.',
      },
      {
        q: "Koliko košta objavljivanje?",
        a: "10 besplatnih oglasa po kategoriji za privatne korisnike.",
      },
      {
        q: "Kako da verifikujem nalog?",
        a: "Putem broja telefona — dobićete SMS sa kodom za potvrdu.",
      },
      {
        q: "Šta da uradim ako neko vara?",
        a: 'Kliknite "Prijavi" na oglasu ili nas kontaktirajte direktno.',
      },
      {
        q: "Mogu li da objavljujem iz inostranstva?",
        a: "Da! Dijaspora iz Njemačke, Švicarske, Austrije, Francuske, Italije, Engleske i SAD može normalno da objavljuje.",
      },
    ],
  },
  faq: {
    title: "Često postavljana pitanja (FAQ)",
    sections: [
      {
        title: "Objavljivanje oglasa",
        items: [
          {
            q: "Kako da objavim oglas?",
            a: 'Kliknite "+ Objavi oglas", izaberite kategoriju, popunite podatke i učitajte fotografije. Oglas se objavljuje odmah.',
          },
          {
            q: "Koliko besplatnih oglasa mogu objaviti?",
            a: "Korisnici imaju 10 besplatnih oglasa po kategoriji + verifikacija.",
          },
          {
            q: "Mogu li da objavljujem iz inostranstva?",
            a: "Da! Dijaspora iz Njemačke, Švicarske, Austrije, Francuske, Italije, Engleske i SAD može normalno objavljivati sa svojim brojem telefona.",
          },
          {
            q: "Koliko fotografija mogu učitati po oglasu?",
            a: "Do 10 fotografija po oglasu.",
          },
        ],
      },
      {
        title: "Nalog i sigurnost",
        items: [
          {
            q: "Kako da kreiram nalog?",
            a: "Putem broja telefona (SMS) ili Google. Broj telefona je obavezan prije prvog objavljivanja.",
          },
          {
            q: "Kako da verifikujem nalog?",
            a: "Dobićete SMS sa 6-cifrenim kodom. Unesite kod i nalog se aktivira odmah.",
          },
          {
            q: "Šta ako zaboravim lozinku?",
            a: 'Kliknite "Zaboravio/la sam lozinku" i dobićete SMS ili email za resetovanje.',
          },
        ],
      },
      {
        title: "Kupovina i prodaja",
        items: [
          {
            q: "Da li je KetuJemi besplatan?",
            a: "Da! Osnovno objavljivanje je potpuno besplatno!",
          },
          {
            q: "Kako da kontaktiram prodavca?",
            a: 'Kliknite "Kontaktiraj prodavca" na oglasu i pošaljite direktnu poruku.',
          },
          {
            q: "Šta da uradim ako neko vara?",
            aEmail: {
              before: 'Kliknite "Prijavi" na oglasu ili nas kontaktirajte na ',
              between: " i ",
              after: ". Djelujemo u roku od 24 sata.",
            },
          },
          {
            q: "Da li KetuJemi garantuje proizvode?",
            a: "KetuJemi je posrednička platforma. Preporučujemo lični susret i provjeru proizvoda prije kupovine.",
          },
        ],
      },
      {
        title: "VIP paketi",
        items: [
          {
            q: "Šta je VIP paket?",
            a: 'VIP paket nudi neograničene oglase, visoku poziciju u pretrazi i badge "VIP" za 30€ mjesečno.',
          },
          {
            q: "Kada se aktivira VIP paket?",
            a: "VIP paket se aktivira za neke korisnike!",
          },
        ],
      },
      {
        title: "Tehničko",
        items: [
          {
            q: "Da li KetuJemi radi na telefonu?",
            a: "Da! KetuJemi je optimizovan za telefon. Možete ga koristiti sa bilo kojeg uređaja.",
          },
          {
            q: "Na kojim mjestima radi KetuJemi?",
            a: "Kosovo, Albanija, Sjeverna Makedonija i Crna Gora. Plus dijaspora u 7 evropskih zemalja i SAD.",
          },
        ],
      },
    ],
  },
};

export const STATIC_PAGES: Record<StaticPageLocaleKey, StaticPagesCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
};

export function staticPagesForLocale(locale: StaticPageLocaleKey): StaticPagesCopy {
  return STATIC_PAGES[locale];
}

/** Static legal/FAQ pages — follows {@link translationKeyForUiLang} like the rest of the app. */
export function useStaticPages(): StaticPagesCopy {
  const { uiLang } = useMarket();
  return staticPagesForLocale(translationKeyForUiLang(uiLang));
}
