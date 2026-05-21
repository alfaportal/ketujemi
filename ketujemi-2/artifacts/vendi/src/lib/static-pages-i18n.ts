import type { AppExtraMarketCode } from "@/lib/app-extra-i18n";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";

export type StaticPageLocaleKey = Extract<AppExtraMarketCode, "ks" | "mk" | "mne">;

type PageSection = {
  title: string;
  paragraphs?: string[];
  bulletsIntro?: string;
  bullets?: string[];
  table?: { label: string; value: string }[];
};

export type TermsPrivacyCopy = {
  title: string;
  subtitle?: string;
  tagline?: string;
  sanctionsTableHeaders?: { violation: string; consequence: string };
  sections: PageSection[];
  /** Privacy page only — label before support@ketujemi.com link */
  privacyEmailLabel?: string;
};

export type ContactSubject = { value: string; label: string };

export type ContactCopy = {
  title: string;
  tagline: string;
  contactSectionTitle: string;
  officialEmailLabel: string;
  technicalSupportLabel: string;
  hoursLabel: string;
  hoursValue: string;
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
  tagline: string;
  featuredTitle: string;
  featured: FaqItemCopy[];
  sections: { title: string; items: FaqItemCopy[] }[];
};

export type InfoPageCopy = {
  title: string;
  tagline: string;
  sections: PageSection[];
};

export type PressPageCopy = InfoPageCopy & {
  mediaEmailLabel: string;
};

export type SimplePageCopy = {
  title: string;
  tagline: string;
};

export type BusinessLandingCopy = {
  title: string;
  tagline: string;
  bullets?: string[];
  ctaLabel?: string;
  contactLabel?: string;
  contactEmail?: string;
};

export type StaticPagesCopy = {
  about: InfoPageCopy;
  rules: InfoPageCopy;
  terms: InfoPageCopy;
  privacy: InfoPageCopy;
  cookies: InfoPageCopy;
  openShop: BusinessLandingCopy;
  vipPackages: BusinessLandingCopy;
  advertise: BusinessLandingCopy;
  partnership: BusinessLandingCopy;
  businessRules: TermsPrivacyCopy;
  contact: ContactCopy;
  faq: FaqCopy;
  security: InfoPageCopy;
  press: PressPageCopy;
};

const KS: StaticPagesCopy = {
  about: {
    title: "Rreth KetuJemi — Bli & Shit",
    tagline:
      "KetuJemi — Bli & Shit është platforma e shpalljeve falas në 11 tregje: Kosovë, Shqipëri, Maqedoni, Mal i Zi dhe diaspora shqiptare.",
    sections: [
      {
        title: "Misioni ynë",
        paragraphs: [
          "Lidhim blerësit dhe shitësit shpejt, thjesht dhe në mënyrë të sigurt — pa komisione të fshehura për postimin bazë.",
          "Platforma shërben si hapësirë ndërmjetëse; marrëveshja e çmimit dhe dorëzimit bëhet drejtpërdrejt mes palëve.",
        ],
      },
      {
        title: "Ku operojmë",
        bulletsIntro: "Tregjet zyrtare dhe diaspora:",
        bullets: [
          "Kosovë, Shqipëri, Maqedoni e Veriut, Mal i Zi",
          "Diaspora: Gjermani, Zvicër, Austri, Francë, Itali, Angli, SHBA",
        ],
      },
      {
        title: "Kontakt",
        paragraphs: [
          "Për pyetje, partneritete ose mbështetje: info@ketujemi.com dhe support@ketujemi.com, ose përdorni formularin te «Na kontaktoni».",
        ],
      },
    ],
  },
  rules: {
    title: "Rregullat e Platformës",
    tagline: "Rregulla të qarta për postime të pastra dhe të besueshme për të gjithë përdoruesit.",
    sections: [
      {
        title: "Çfarë lejohet",
        bullets: [
          "Njoftime të vërteta, në kategorinë e duhur, me foto dhe përshkrim të qartë",
          "Çmim real ose shënim i qartë nëse është falas / me marrëveshje",
          "Një produkt ose shërbim për njoftim (jo reklamë e përgjithshme)",
        ],
      },
      {
        title: "Dublikatët",
        paragraphs: [
          "Nëse postoni përsëri të njëjtin njoftim (titull dhe përshkrim identik), versioni i vjetër fshihet automatikisht dhe mbetet vetëm i riu.",
          "Mes dy postimeve radhazi duhet të paktën 30 sekonda pritje.",
        ],
      },
      {
        title: "Çfarë ndalohet",
        bullets: [
          "Spam, mashtrim, përmbajtje ofenduese ose e paligjshme",
          "Foto stock / internet pa lidhje me produktin real",
          "Numra telefoni ose email të shumëfishtë për të anashkaluar rregullat",
        ],
      },
      {
        title: "Raportimi",
        paragraphs: [
          "Njoftim i dyshimtë? Përdorni «Raporto» në njoftim ose na shkruani në support@ketujemi.com — veprojmë brenda 24 orëve.",
        ],
      },
    ],
  },
  terms: {
    title: "Kushtet e Përdorimit",
    tagline: "Duke përdorur KetuJemi.com, pranoni kushtet e mëposhtme.",
    sections: [
      {
        title: "Roli i platformës",
        paragraphs: [
          "KetuJemi.com është vetëm hapësirë ndërlidhëse mes blerësve dhe shitësve. Ne nuk jemi palë në kontratën e shitjes.",
          "Përdoruesi mban përgjegjësi të plotë ligjore për vërtetësinë dhe ligjshmërinë e çdo njoftimi që poston.",
        ],
      },
      {
        title: "Llogaria dhe postimi",
        bullets: [
          "Verifikimi me telefon (SMS) kërkohet para postimit të parë",
          "Jeni përgjegjës për ruajtjen e të dhënave të llogarisë",
          "Respektoni limitet e postimeve dhe rregullat e kategorive",
        ],
      },
      {
        title: "Përmbajtja",
        bullets: [
          "Mos postoni materiale që shkelin të drejtat e autorit ose ligjin",
          "Platforma mund të heqë ose pezullojë njoftime që shkelin rregullat",
        ],
      },
      {
        title: "Ndryshimet",
        paragraphs: [
          "Kushtet mund të përditësohen; versioni aktual publikohet gjithmonë në këtë faqe.",
        ],
      },
    ],
  },
  privacy: {
    title: "Politika e Privatësisë",
    tagline: "Si i trajtojmë të dhënat tuaja — thjesht dhe transparent.",
    sections: [
      {
        title: "Çfarë mbledhim",
        bullets: [
          "Emri dhe email-i (për llogari dhe komunikim)",
          "Numri i telefonit (verifikim SMS)",
          "Adresa IP (siguri dhe parandalim mashtrimesh)",
        ],
      },
      {
        title: "Pse i përdorim",
        bullets: [
          "Autentifikim dhe mbështetje përdoruesish",
          "Parandalim spam-i dhe abuzimit",
          "Përmirësim i shërbimit (statistika të përgjithshme, pa shitje të dhënash)",
        ],
      },
      {
        title: "Ruajtja dhe të drejtat",
        paragraphs: [
          "Të dhënat ruhen të enkriptuara. Nuk i shesim palëve të treta për marketing.",
          "Mund të kërkoni korrigjim ose fshirje duke na kontaktuar në support@ketujemi.com.",
        ],
      },
    ],
  },
  cookies: {
    title: "Politika e Cookies",
    tagline: "Si përdorim cookie në KetuJemi.com.",
    sections: [
      {
        title: "Llojet e cookie",
        bullets: [
          "Të nevojshme: kyçja në llogari dhe siguria e sesionit",
          "Funksionale: preferenca (p.sh. tregu / gjuhë)",
          "Analitike: trafik i përgjithshëm për përmirësim të faqes",
        ],
      },
      {
        title: "Kontrolli juaj",
        paragraphs: [
          "Mund t'i fikni ose fshini cookie në cilësimet e shfletuesit. Disa funksione (si qëndrimi i kyçur) mund të mos punojnë pa to.",
        ],
      },
    ],
  },
  openShop: {
    title: "Hap Shitoren Tënde",
    tagline:
      "Krijo profilin e biznesit tënd në KetuJemi.com. Regjistro kompaninë, shto logon dhe fillo të shesësh produktet e tua te mijëra klientë në 11 tregje ndërkombëtare.",
    ctaLabel: "Fillo Tani",
  },
  vipPackages: {
    title: "Paketat e Biznesit & VIP",
    tagline: "Zgjidhni paketën që i përshtatet biznesit tuaj:",
    bullets: [
      "Dyqan Standard (€30/muaj): Shpallje të pakufizuara, profil publik i biznesit, suport 24/7.",
      "VIP Partner (€50/muaj): Çdo gjë nga Standard + shfaqje me logo në faqen kryesore (random), badge VIP në njoftime dhe statistika të shikimeve të logos.",
    ],
    ctaLabel: "Zgjidh Paketën Tënde",
  },
  advertise: {
    title: "Reklamoni në KetuJemi.com",
    tagline:
      "Ofrojmë hapësira ekskluzive për Banner (Leaderboard), njoftime të sponsorizuara në krye të kategorive dhe paketa të personalizuara për biznese të mëdha.",
    contactLabel: "Kontakt:",
    contactEmail: "info@ketujemi.com",
  },
  partnership: {
    title: "Bashkëpunim & Partneritet",
    tagline:
      "KetuJemi.com mirëpret mundësitë e bashkëpunimit dhe partneriteteve strategjike për të rritur tregun tonë në 11 shtete.",
    contactLabel: "Kontakt:",
    contactEmail: "support@ketujemi.com",
  },
  businessRules: {
    title: "Rregullorja e Bizneseve",
    subtitle: "KetuJemi.com",
    tagline: "Njoftime për biznese të regjistruara",
    sanctionsTableHeaders: { violation: "Shkelja", consequence: "Veprim" },
    sections: [
      {
        title: "Regjistrimi & verifikimi",
        bullets: [
          "Llogaria business është e ndarë nga llogaria private.",
          "Për të kaluar në biznes: email i verifikuar + telefon SMS i verifikuar.",
        ],
      },
      {
        title: "Çfarë mund të postojnë bizneset",
        bulletsIntro: "Lejohet vetëm njoftim specifik për produkt ose shërbim:",
        bullets: [
          "Produkt ose shërbim i qartë (jo reklamë e përgjithshme)",
          "Çmim real në Euro (€), më i madh se 0",
          "Foto aktuale të produktit (jo stock / internet)",
          "Përshkrim me detaje të mjaftueshme",
        ],
      },
      {
        title: "Çfarë ndalohet automatikisht",
        bullets: [
          "Reklama të përgjithshme (“na kontaktoni”, “faqe zyrtare”, etj.)",
          "Çmim 0, “me marrëveshje” ose “na kontaktoni”",
          "Foto nga faqe stock (pexels, unsplash, etj.)",
          "Titull shumë i shkurtër ose jo specifik",
          "I njëjti titull dy herë (dublikatë)",
        ],
      },
      {
        title: "Limitet e postimeve",
        bullets: [
          "Biznes Standard: 10 njoftime falas për çdo kategori + verifikim",
          "Pas 10 njoftimeve në të njëjtën kategori: €1 për çdo njoftim shtesë",
          "VIP Biznes ☆: njoftime të pakufizuara për €20/muaj",
          "Kuota kontrollohet automatikisht në llogarinë tuaj",
        ],
      },
      {
        title: "Komunikimi me blerësit",
        bullets: [
          "Blerësit duhet të marrin përgjigje përmes platformës.",
          "3 ankesa për mospërgjigje → paralajmërim me email",
          "5 ankesa për mospërgjigje → pezullim 30 ditë",
        ],
      },
      {
        title: "Pasojat e shkeljeve",
        table: [
          { label: "1", value: "Email paralajmërues" },
          { label: "2", value: "Heqje postimi" },
          { label: "3", value: "Pezullim 30 ditë" },
          { label: "4+", value: "Bllokim i përhershëm" },
        ],
      },
      {
        title: "Llogaritë private",
        paragraphs: [
          "Përdoruesit privatë kanë rregulla të ndryshme (10 njoftime falas për kategori, etj.). Shihni Kushtet e Përdorimit në footer.",
        ],
      },
    ],
  },
  contact: {
    title: "Na Kontaktoni",
    tagline:
      "Jemi këtu për t'ju ndihmuar për çdo pyetje, sugjerim apo mbështetje teknike. Ekipi ynë do t'ju përgjigjet brenda 24 orëve.",
    contactSectionTitle: "Kontakti",
    officialEmailLabel: "Email Zyrtar:",
    technicalSupportLabel: "Suport Teknik:",
    hoursLabel: "Orari i Punës:",
    hoursValue: "E Hënë - E Premte, 09:00 - 17:00",
    emailLabel: "Email Zyrtar:",
    supportEmailLabel: "Suport Teknik:",
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
        q: "Si mund të postoj një njoftim?",
        a: "Kliko butonin «Posto Njoftim», plotëso të dhënat dhe ngarko fotot.",
      },
      {
        q: "Sa kushton postimi i njoftimeve?",
        a: "Postimi për përdoruesit e thjeshtë është plotësisht falas.",
      },
      {
        q: "Si mund ta fshij ose modifikoj njoftimin tim?",
        a: "Hyni në llogarinë tuaj te seksioni «Njoftimet e mia» për t'i menaxhuar ato.",
      },
    ],
  },
  faq: {
    title: "Pyetjet e Shpeshta (FAQ)",
    tagline:
      "Gjeni përgjigje të shpejta për pyetjet më të zakonshme rreth përdorimit të platformës KetuJemi.com.",
    featuredTitle: "Pyetjet kryesore",
    featured: [
      {
        q: "Si të postoj njoftim?",
        a: "Kliko butonin «Posto Njoftim», plotëso të dhënat dhe ngarko fotot.",
      },
      {
        q: "Sa kushton?",
        a: "Plotësisht falas për përdoruesit e thjeshtë.",
      },
      {
        q: "Si ta fshij njoftimin?",
        a: "Hyni në llogarinë tuaj te Profili / «Njoftimet e mia» për ta menaxhuar ose fshirë.",
      },
    ],
    sections: [
      {
        title: "Postimi i Njoftimeve",
        items: [
          {
            q: "Si të postoj një njoftim?",
            a: 'Klikoni «Posto Njoftim», zgjidhni kategorinë, plotësoni të dhënat dhe ngarkoni fotot. Njoftimi publikohet menjëherë.',
          },
          {
            q: "Sa njoftime falas mund të postoj?",
            a: "Përdoruesit kanë 10 njoftime falas për çdo kategori + verifikim.",
          },
          {
            q: "A mund të postoj nga jashtë vendit?",
            a: "Po! Diaspora nga Gjermani, Zvicër, Austri, Francë, Itali, Angli dhe SHBA mund të postojë normalisht me numrin e tyre të telefonit.",
          },
          {
            q: "Sa foto mund të ngarkoi për një njoftim?",
            a: "Deri në 10 foto për njoftim.",
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
            a: 'Klikoni «Kontakto Shitësin» në njoftim dhe dërgoni mesazh direkt.',
          },
          {
            q: "Çfarë bëj nëse dikush po mashtron?",
            aEmail: {
              before: 'Klikoni «Raporto» në njoftim ose na kontaktoni në ',
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
            a: 'Paketa VIP ofron njoftime të pakufizuara, pozicion të lartë në kërkim dhe badge «VIP» për 30€ muaj.',
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
  security: {
    title: "Siguria Online",
    tagline:
      "Këshilla dhe udhëzime zyrtare për t'u mbrojtur gjatë blerjeve dhe shitjeve online në KetuJemi.com.",
    sections: [
      {
        title: "Rregullat e Sigurisë",
        bullets: [
          "Mos dërgoni para avans pa u takuar me shitësin në vend publik.",
          "Kontrolloni produktin dhe dokumentet përpara pagesës.",
          "Raportoni njoftimet e dyshimta në support@ketujemi.com.",
        ],
      },
    ],
  },
  press: {
    title: "Për Shtypin dhe Mediat",
    tagline:
      "Informacione zyrtare për mediat, gazetarët dhe partneritetet e marketingut.",
    mediaEmailLabel: "Email për Media:",
    sections: [
      {
        title: "Çfarë ofrojmë medias",
        bullets: [
          "Logo dhe materiale vizuale të KetuJemi.com (me kërkesë)",
          "Intervista me ekipin drejtues (me takim paraprak)",
          "Të dhëna statistikore të përgjithshme për platformën",
        ],
      },
      {
        title: "Kohëzgjatja e përgjigjes",
        paragraphs: [
          "Kërkesat për shtyp përgjigjen brenda 2–3 ditëve pune. Për urgjenca, shënoni «Shtypi» në formularin e kontaktit.",
        ],
      },
    ],
  },
};

const MK: StaticPagesCopy = {
  about: {
    title: "За KetuJemi.com",
    tagline: "KetuJemi.com е една од најголемите платформи за бесплатни огласи на 11 меѓународни пазари.",
    sections: [
      {
        title: "Нашата мисија",
        paragraphs: [
          "Брзо, чисто и безбедно поврзување на купувачи и продавачи — без скриени провизии за основно објавување.",
          "Платформата е посредник; договорот за цена и предавање е директно меѓу страните.",
        ],
      },
      {
        title: "Каде работиме",
        bullets: [
          "Косово, Албанија, Северна Македонија, Црна Гора",
          "Дијаспора: Германија, Швајцарија, Австрија, Франција, Италија, Англија, САД",
        ],
      },
      {
        title: "Контакт",
        paragraphs: [
          "Прашања и поддршка: info@ketujemi.com и support@ketujemi.com, или формуларот «Контактирајте нè».",
        ],
      },
    ],
  },
  rules: {
    title: "Правила на платформата",
    tagline: "Јасни правила за чисти и доверливи огласи за сите корисници.",
    sections: [
      {
        title: "Што е дозволено",
        bullets: [
          "Вистинити огласи во соодветна категорија, со јасни фотографии и опис",
          "Реална цена или јасна напомена ако е бесплатно / по договор",
          "Еден производ или услуга по оглас",
        ],
      },
      {
        title: "Дупликати",
        paragraphs: [
          "Ако повторно објавите ист оглас (ист наслов и опис), стариот се брише автоматски и останува само новиот.",
          "Потребни се најмалку 30 секунди меѓу две последователни објави.",
        ],
      },
      {
        title: "Што е забрането",
        bullets: [
          "Спам, измама, навредлива или незаконска содржина",
          "Stock фотографии без врска со вистинскиот производ",
          "Повеќе телефони или е-пошти за заобиколување на правилата",
        ],
      },
      {
        title: "Пријавување",
        paragraphs: [
          "Сомнителен оглас? Кликнете «Пријави» или пишете на support@ketujemi.com — реагираме во рок од 24 часа.",
        ],
      },
    ],
  },
  terms: {
    title: "Услови за користење",
    tagline: "Со користење на KetuJemi.com ги прифаќате следните услови.",
    sections: [
      {
        title: "Улога на платформата",
        paragraphs: [
          "KetuJemi.com е само посреднички простор. Ние не сме страна во договорот за продажба.",
          "Корисникот носи целосна правна одговорност за секој објавен оглас.",
        ],
      },
      {
        title: "Сметка и објавување",
        bullets: [
          "SMS верификација на телефон пред првата објава",
          "Вие сте одговорни за безбедноста на сметката",
          "Почитувајте лимити и правила на категориите",
        ],
      },
      {
        title: "Содржина",
        bullets: [
          "Не објавувајте материјал што го крши авторското право или законот",
          "Платформата може да ги отстрани огласи што ги кршат правилата",
        ],
      },
      {
        title: "Промени",
        paragraphs: ["Условите можат да се ажурираат; актуелната верзија е секогаш на оваа страница."],
      },
    ],
  },
  privacy: {
    title: "Политика за приватност",
    tagline: "Како ги третираме вашите податоци — едноставно и транспарентно.",
    sections: [
      {
        title: "Што собираме",
        bullets: [
          "Име и email (сметка и комуникација)",
          "Телефон (SMS верификација)",
          "IP адреса (безбедност и спречување измами)",
        ],
      },
      {
        title: "Зошто ги користиме",
        bullets: [
          "Најава и поддршка на корисници",
          "Спречување спам и злоупотреба",
          "Подобрување на услугата (без продажба на податоци)",
        ],
      },
      {
        title: "Чување и права",
        paragraphs: [
          "Податоците се шифрирани. Не ги продаваме на трети страни за маркетинг.",
          "Можете да побарате корекција или бришење на support@ketujemi.com.",
        ],
      },
    ],
  },
  cookies: {
    title: "Политика за колачиња (Cookies)",
    tagline: "Како користиме cookies на KetuJemi.com.",
    sections: [
      {
        title: "Видови cookies",
        bullets: [
          "Неопходни: најава и безбедност на сесија",
          "Функционални: преференци (пазар / јазик)",
          "Аналитички: општ сообраќај за подобрување на страницата",
        ],
      },
      {
        title: "Ваша контрола",
        paragraphs: [
          "Можете да ги исклучите во прелистувачот. Некои функции (како останување најавени) може да не работат без нив.",
        ],
      },
    ],
  },
  openShop: {
    title: "Отвори ја твојата продавница",
    tagline:
      "Креирај бизнис профил на KetuJemi.com. Регистрирај ја компанијата, додај лого и продавај на 11 пазари.",
    ctaLabel: "Започни сега",
  },
  vipPackages: {
    title: "Бизнис и VIP пакети",
    tagline: "Изберете пакет:",
    bullets: [
      "Стандарден дуќан (€30/месец): Неограничени огласи, јавен бизнис профил, поддршка 24/7.",
      "VIP Partner (€50/месец): Сè од Standard + лого на почетна, VIP badge и статистика.",
    ],
    ctaLabel: "Избери пакет",
  },
  advertise: {
    title: "Рекламирај на KetuJemi.com",
    tagline: "Banner, спонзорирани огласи и прилагодени пакети за големи бизниси.",
    contactLabel: "Контакт:",
    contactEmail: "info@ketujemi.com",
  },
  partnership: {
    title: "Партнерство",
    tagline: "Стратешко партнерство за раст на 11 пазари.",
    contactLabel: "Контакт:",
    contactEmail: "support@ketujemi.com",
  },
  businessRules: {
    title: "Правила за бизниси",
    subtitle: "KetuJemi.com",
    tagline: "Огласи за регистрирани бизниси",
    sanctionsTableHeaders: { violation: "Прекршување", consequence: "Мерка" },
    sections: [
      {
        title: "Регистрација и верификација",
        bullets: [
          "Бизнис сметката е одделена од приватната сметка.",
          "За преминување на бизнис: верифициран email + SMS телефон.",
        ],
      },
      {
        title: "Што можат да објавуваат бизнисите",
        bulletsIntro: "Дозволен е само специфичен оглас за производ или услуга:",
        bullets: [
          "Јасен производ или услуга (не општа реклама)",
          "Реална цена во евра (€), поголема од 0",
          "Актуелни фотографии (не stock / интернет)",
          "Доволно детален опис",
        ],
      },
      {
        title: "Што се блокира автоматски",
        bullets: [
          "Општи реклами („контактирајте не“, „официјална страница“, итн.)",
          "Цена 0, „по договор“ или „контактирајте не“",
          "Stock фотографии (pexels, unsplash, итн.)",
          "Премногу краток или неспецифичен наслов",
          "Ист наслов двапати (дупликат)",
        ],
      },
      {
        title: "Лимити на објавување",
        bullets: [
          "Стандарден бизнис: 10 бесплатни огласи по категорија + верификација",
          "По 10 огласи во истата категорија: €1 за секој дополнителен оглас",
          "VIP Бизнис ☆: неограничени огласи за €20/месечно",
          "Квотата се проверува автоматски на вашата сметка",
        ],
      },
      {
        title: "Комуникација со купувачите",
        bullets: [
          "Купувачите мора да добијат одговор преку платформата.",
          "3 жалби за неодговор → предупредување по email",
          "5 жалби за неодговор → суспензија 30 дена",
        ],
      },
      {
        title: "Последици од прекршувања",
        table: [
          { label: "1", value: "Email предупредување" },
          { label: "2", value: "Бришење на оглас" },
          { label: "3", value: "Суспензија 30 дена" },
          { label: "4+", value: "Трајно блокирање" },
        ],
      },
      {
        title: "Приватни сметки",
        paragraphs: [
          "Приватните корисници имаат различни правила (10 бесплатни огласи по категорија, итн.). Погледнете Услови за користење во footer.",
        ],
      },
    ],
  },
  contact: {
    title: "Контактирајте нè",
    tagline:
      "Тука сме за секое прашање, предлог или техничка поддршка. Ќе ви одговориме во рок од 24 часа.",
    contactSectionTitle: "Контакт",
    officialEmailLabel: "Официјален email:",
    technicalSupportLabel: "Техничка поддршка:",
    hoursLabel: "Работно време:",
    hoursValue: "Понеделник - Петок, 09:00 - 17:00",
    emailLabel: "Официјален email:",
    supportEmailLabel: "Техничка поддршка:",
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
    toastSuccess: "Пораката е испратена. Ќе ви одговориме во рок од 24 часа.",
    toastError: "Пораката не е испратена. Обидете се повторно или пишете ни на email.",
    faqTitle: "Често поставувани прашања (FAQ)",
    faq: [
      {
        q: "Како да објавам оглас?",
        a: "Кликнете «Објави оглас», пополнете ги податоците и прикачете фотографии.",
      },
      {
        q: "Колку чини објавувањето?",
        a: "Објавувањето за обични корисници е целосно бесплатно.",
      },
      {
        q: "Како да го избришам или изменам огласот?",
        a: "Најавете се и управувајте со огласите во секцијата «Мои огласи».",
      },
    ],
  },
  faq: {
    title: "Често поставувани прашања (FAQ)",
    tagline:
      "Најдете брзи одговори на најчестите прашања за користење на платформата KetuJemi.com.",
    featuredTitle: "Главни прашања",
    featured: [
      {
        q: "Како да објавам оглас?",
        a: 'Кликнете «Објави оглас», пополнете ги податоците и прикачете фотографии.',
      },
      {
        q: "Колку чини објавувањето?",
        a: "Објавувањето за обични корисници е целосно бесплатно.",
      },
      {
        q: "Како да го избришам или изменам огласот?",
        a: "Најавете се и управувајте со огласите во секцијата «Мои огласи».",
      },
    ],
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
  security: {
    title: "Онлајн безбедност",
    tagline:
      "Совети и официјални упатства за заштита и безбедно искуство при купување и продавање на KetuJemi.com.",
    sections: [
      {
        title: "Правила за безбедност",
        bullets: [
          "Не испраќајте аванс: Секогаш се сретнете со продавачот на јавно место и проверете го производот пред плаќање.",
          "Проверете го производот: Пред купување на возила или електроника, проверете ја физичката состојба и правната документација.",
          "Пријавете злоупотреби: Ако забележите сомнителен оглас, кликнете «Пријави» или пишете на support@ketujemi.com.",
        ],
      },
    ],
  },
  press: {
    title: "За медиуми и печат",
    tagline:
      "Официјални информации за медиуми, новинари и маркетинг партнерства.",
    mediaEmailLabel: "Email за медиуми:",
    sections: [
      {
        title: "Што нудиме на медиумите",
        bullets: [
          "Лого и визуелни материјали (по барање)",
          "Интервјуа со тимот (со претходна најава)",
          "Општа статистика за платформата",
        ],
      },
      {
        title: "Време на одговор",
        paragraphs: [
          "Барања за медиуми се одговараат за 2–3 работни дена. За итни случаи, наведете «Медиуми» во контакт формуларот.",
        ],
      },
    ],
  },
};

const MNE: StaticPagesCopy = {
  about: {
    title: "O KetuJemi.com",
    tagline: "KetuJemi.com je jedna od najvećih platformi za besplatne oglase na 11 međunarodnih tržišta.",
    sections: [
      {
        title: "Naša misija",
        paragraphs: [
          "Brzo, čisto i sigurno povezivanje kupaca i prodavaca — bez skrivenih provizija za osnovno objavljivanje.",
          "Platforma je posrednik; dogovor o cijeni i predaji je direktno između strana.",
        ],
      },
      {
        title: "Gdje radimo",
        bullets: [
          "Kosovo, Albanija, Sjeverna Makedonija, Crna Gora",
          "Dijaspora: Njemačka, Švicarska, Austrija, Francuska, Italija, Engleska, SAD",
        ],
      },
      {
        title: "Kontakt",
        paragraphs: [
          "Pitanja i podrška: info@ketujemi.com i support@ketujemi.com, ili formular «Kontaktirajte nas».",
        ],
      },
    ],
  },
  rules: {
    title: "Pravila platforme",
    tagline: "Jasna pravila za čiste i pouzdane oglase za sve korisnike.",
    sections: [
      {
        title: "Šta je dozvoljeno",
        bullets: [
          "Istiniti oglasi u odgovarajućoj kategoriji, sa jasnim fotografijama i opisom",
          "Stvarna cijena ili jasna napomena ako je besplatno / po dogovoru",
          "Jedan proizvod ili usluga po oglasu",
        ],
      },
      {
        title: "Duplikati",
        paragraphs: [
          "Ako ponovo objavite isti oglas (isti naslov i opis), stari se automatski briše i ostaje samo novi.",
          "Potrebno je najmanje 30 sekundi između dvije uzastopne objave.",
        ],
      },
      {
        title: "Šta je zabranjeno",
        bullets: [
          "Spam, prevara, uvredljiv ili nezakonit sadržaj",
          "Stock fotografije bez veze sa stvarnim proizvodom",
          "Više telefona ili emailova za zaobilaženje pravila",
        ],
      },
      {
        title: "Prijavljivanje",
        paragraphs: [
          "Sumnjiv oglas? Kliknite «Prijavi» ili pišite na support@ketujemi.com — reagujemo u roku od 24 sata.",
        ],
      },
    ],
  },
  terms: {
    title: "Uslovi korišćenja",
    tagline: "Korišćenjem KetuJemi.com prihvatate sljedeće uslove.",
    sections: [
      {
        title: "Uloga platforme",
        paragraphs: [
          "KetuJemi.com je samo posrednički prostor. Mi nismo strana u ugovoru o prodaji.",
          "Korisnik snosi punu pravnu odgovornost za svaki objavljeni oglas.",
        ],
      },
      {
        title: "Nalog i objavljivanje",
        bullets: [
          "SMS verifikacija telefona prije prve objave",
          "Vi ste odgovorni za sigurnost naloga",
          "Poštujte limite i pravila kategorija",
        ],
      },
      {
        title: "Sadržaj",
        bullets: [
          "Ne objavljujte materijal koji krši autorska prava ili zakon",
          "Platforma može ukloniti oglase koji krše pravila",
        ],
      },
      {
        title: "Izmjene",
        paragraphs: ["Uslovi se mogu ažurirati; aktuelna verzija je uvijek na ovoj stranici."],
      },
    ],
  },
  privacy: {
    title: "Politika privatnosti",
    tagline: "Kako tretiramo vaše podatke — jednostavno i transparentno.",
    sections: [
      {
        title: "Šta prikupljamo",
        bullets: [
          "Ime i email (nalog i komunikacija)",
          "Telefon (SMS verifikacija)",
          "IP adresa (sigurnost i sprečavanje prevara)",
        ],
      },
      {
        title: "Zašto ih koristimo",
        bullets: [
          "Prijava i podrška korisnicima",
          "Sprečavanje spama i zloupotrebe",
          "Poboljšanje usluge (bez prodaje podataka)",
        ],
      },
      {
        title: "Čuvanje i prava",
        paragraphs: [
          "Podaci su šifrovani. Ne prodajemo ih trećim stranama za marketing.",
          "Možete zatražiti ispravku ili brisanje na support@ketujemi.com.",
        ],
      },
    ],
  },
  cookies: {
    title: "Politika kolačića (Cookies)",
    tagline: "Kako koristimo kolačiće na KetuJemi.com.",
    sections: [
      {
        title: "Vrste kolačića",
        bullets: [
          "Neophodni: prijava i sigurnost sesije",
          "Funkcionalni: preference (tržište / jezik)",
          "Analitički: opšti saobraćaj za poboljšanje stranice",
        ],
      },
      {
        title: "Vaša kontrola",
        paragraphs: [
          "Možete ih isključiti u pregledaču. Neke funkcije (npr. ostajanje prijavljeni) možda neće raditi bez njih.",
        ],
      },
    ],
  },
  openShop: {
    title: "Otvori svoju prodavnicu",
    tagline:
      "Kreiraj biznis profil na KetuJemi.com. Registruj firmu, dodaj logo i prodaji na 11 tržišta.",
    ctaLabel: "Počni odmah",
  },
  vipPackages: {
    title: "Biznis i VIP paketi",
    tagline: "Izaberite paket:",
    bullets: [
      "Standard prodavnica (€30/mjesec): Neograničeni oglasi, javni profil, podrška 24/7.",
      "VIP Partner (€50/mjesec): Sve iz Standard + logo na početnoj, VIP bedž i statistika.",
    ],
    ctaLabel: "Izaberi paket",
  },
  advertise: {
    title: "Reklamiraj na KetuJemi.com",
    tagline: "Banner, sponzorisani oglasi i prilagođeni paketi za velike biznise.",
    contactLabel: "Kontakt:",
    contactEmail: "info@ketujemi.com",
  },
  partnership: {
    title: "Partnerstvo",
    tagline: "Strateško partnerstvo za rast na 11 tržišta.",
    contactLabel: "Kontakt:",
    contactEmail: "support@ketujemi.com",
  },
  businessRules: {
    title: "Pravila za biznise",
    subtitle: "KetuJemi.com",
    tagline: "Oglasi za registrovane biznise",
    sanctionsTableHeaders: { violation: "Kršenje", consequence: "Mjera" },
    sections: [
      {
        title: "Registracija i verifikacija",
        bullets: [
          "Biznis nalog je odvojen od privatnog naloga.",
          "Za prelazak na biznis: verifikovan email + SMS telefon.",
        ],
      },
      {
        title: "Šta biznisi mogu objavljivati",
        bulletsIntro: "Dozvoljen je samo specifičan oglas za proizvod ili uslugu:",
        bullets: [
          "Jasan proizvod ili usluga (ne opšta reklama)",
          "Stvarna cijena u eurima (€), veća od 0",
          "Aktuelne fotografije (ne stock / internet)",
          "Dovoljno detaljan opis",
        ],
      },
      {
        title: "Šta se automatski blokira",
        bullets: [
          "Opšte reklame („kontaktirajte nas“, „zvanična stranica“, itd.)",
          "Cijena 0, „po dogovoru“ ili „kontaktirajte nas“",
          "Stock fotografije (pexels, unsplash, itd.)",
          "Prekratak ili nespecifičan naslov",
          "Isti naslov dva puta (duplikat)",
        ],
      },
      {
        title: "Limiti objavljivanja",
        bullets: [
          "Standardni biznis: 10 besplatnih oglasa po kategoriji + verifikacija",
          "Nakon 10 oglasa u istoj kategoriji: €1 po svakom dodatnom oglasu",
          "VIP Biznis ☆: neograničeni oglasi za €20/mjesec",
          "Kvota se provjerava automatski na vašem nalogu",
        ],
      },
      {
        title: "Komunikacija sa kupcima",
        bullets: [
          "Kupci moraju dobiti odgovor preko platforme.",
          "3 žalbe za neodgovor → upozorenje emailom",
          "5 žalbi za neodgovor → suspenzija 30 dana",
        ],
      },
      {
        title: "Posljedice kršenja",
        table: [
          { label: "1", value: "Email upozorenje" },
          { label: "2", value: "Brisanje oglasa" },
          { label: "3", value: "Suspenzija 30 dana" },
          { label: "4+", value: "Trajno blokiranje" },
        ],
      },
      {
        title: "Privatni nalozi",
        paragraphs: [
          "Privatni korisnici imaju drugačija pravila (10 besplatnih oglasa po kategoriji, itd.). Pogledajte Uslove korišćenja u footeru.",
        ],
      },
    ],
  },
  contact: {
    title: "Kontaktirajte nas",
    tagline:
      "Tu smo za svako pitanje, prijedlog ili tehničku podršku. Odgovorićemo vam u roku od 24 sata.",
    contactSectionTitle: "Kontakt",
    officialEmailLabel: "Zvanični email:",
    technicalSupportLabel: "Tehnička podrška:",
    hoursLabel: "Radno vrijeme:",
    hoursValue: "Ponedjeljak - Petak, 09:00 - 17:00",
    emailLabel: "Zvanični email:",
    supportEmailLabel: "Tehnička podrška:",
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
    toastSuccess: "Poruka je poslata. Odgovorićemo vam u roku od 24 sata.",
    toastError: "Poruka nije poslata. Pokušajte ponovo ili nam pišite na email.",
    faqTitle: "Često postavljana pitanja (FAQ)",
    faq: [
      {
        q: "Kako da objavim oglas?",
        a: "Kliknite «Objavi oglas», popunite podatke i učitajte fotografije.",
      },
      {
        q: "Koliko košta objavljivanje?",
        a: "Objavljivanje za obične korisnike je potpuno besplatno.",
      },
      {
        q: "Kako da obrišem ili izmijenim oglas?",
        a: "Prijavite se i upravljajte oglasima u odjeljku «Moji oglasi».",
      },
    ],
  },
  faq: {
    title: "Često postavljana pitanja (FAQ)",
    tagline:
      "Pronađite brze odgovore na najčešća pitanja o korišćenju platforme KetuJemi.com.",
    featuredTitle: "Glavna pitanja",
    featured: [
      {
        q: "Kako da objavim oglas?",
        a: 'Kliknite «Objavi oglas», popunite podatke i učitajte fotografije.',
      },
      {
        q: "Koliko košta objavljivanje?",
        a: "Objavljivanje za obične korisnike je potpuno besplatno.",
      },
      {
        q: "Kako da obrišem ili izmijenim oglas?",
        a: "Prijavite se i upravljajte oglasima u odjeljku «Moji oglasi».",
      },
    ],
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
  security: {
    title: "Online sigurnost",
    tagline:
      "Savjeti i zvanične smjernice za zaštitu i sigurno iskustvo pri kupovini i prodaji na KetuJemi.com.",
    sections: [
      {
        title: "Pravila sigurnosti",
        bullets: [
          "Ne šaljite avans: Uvijek se sretnite sa prodavcem na javnom mjestu i provjerite proizvod prije plaćanja.",
          "Provjerite proizvod: Prije kupovine vozila ili elektronike, provjerite fizičko stanje i pravnu dokumentaciju.",
          "Prijavite zloupotrebe: Ako primijetite sumnjiv oglas, kliknite «Prijavi» ili pišite na support@ketujemi.com.",
        ],
      },
    ],
  },
  press: {
    title: "Za štampu i medije",
    tagline:
      "Zvanične informacije za medije, novinare i marketinška partnerstva.",
    mediaEmailLabel: "Email za medije:",
    sections: [
      {
        title: "Šta nudimo medijima",
        bullets: [
          "Logo i vizuelni materijali (na zahtjev)",
          "Intervjui sa timom (uz prethodnu najavu)",
          "Opšta statistika platforme",
        ],
      },
      {
        title: "Vrijeme odgovora",
        paragraphs: [
          "Zahtjevi za štampu se odgovaraju za 2–3 radna dana. Za hitne slučajeve, navedite «Mediji» u kontakt formularu.",
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
