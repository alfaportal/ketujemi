import { DE_STATIC_PAGES } from "@/lib/static-pages-i18n-de";
import { EN_STATIC_PAGES } from "@/lib/static-pages-i18n-en";
import { FR_STATIC_PAGES } from "@/lib/static-pages-i18n-fr";
import { IT_STATIC_PAGES } from "@/lib/static-pages-i18n-it";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type StaticPageLocaleKey = UiTranslationLocale;

type PageSection = {
  title: string;
  paragraphs?: string[];
  bulletsIntro?: string;
  bullets?: string[];
  /** Rendered after bullets (e.g. closing note on a rules section). */
  paragraphsAfter?: string[];
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
  phoneLabel?: string;
  phoneValue?: string;
  addressLabel?: string;
  addressValue?: string;
  formNote?: string;
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
      "KetuJemi — Bli & Shit është platforma e shpalljeve falas në Kosovë, Shqipëri, Maqedoni e Veriut dhe 8 tregje të diasporës shqiptare.",
    sections: [
      {
        title: "Operatori i platformës",
        paragraphs: [
          "KetuJemi.com është një platformë e zhvilluar nga ekipi i REVOLUTION INVEST Sh.p.k. për të ndihmuar tregun lokal dhe diasporën shqiptare — shpejt, thjesht dhe në mënyrë të sigurt.",
          "Operatori ligjor: REVOLUTION INVEST Sh.p.k., Ferizaj, Kosovë (NRB 811314567).",
        ],
      },
      {
        title: "Misioni ynë",
        paragraphs: [
          "Lidhim blerësit dhe shitësit shpejt, thjesht dhe në mënyrë të sigurt — pa komisione të fshehura për postimin bazë.",
          "Platforma shërben si hapësirë ndërmjetëse; marrëveshja e çmimit dhe dorëzimit bëhet drejtpërdrejt mes palëve. KetuJemi.com nuk është palë në asnjë transaksion mes blerësve dhe shitësve.",
        ],
      },
      {
        title: "Ku operojmë",
        bulletsIntro: "Tregjet zyrtare:",
        bullets: [
          "Kosovë, Shqipëri, Maqedoni e Veriut dhe 8 tregje të diasporës shqiptare (Gjermani, Zvicër, Austri, Francë, Itali, Angli, SHBA, Mal i Zi)",
        ],
        paragraphsAfter: [
          "Platforma është e disponueshme edhe për diasporën shqiptare kudo në botë — mund të postoni dhe shikoni njoftime pa kufizim gjeografik.",
        ],
      },
      {
        title: "Çfarë ofrojmë",
        bullets: [
          "Postim i pakufizuar dhe falas për të gjithë përdoruesit — privat dhe biznes",
          "Foto të pakufizuara për njoftim dhe video opsionale deri në 150MB (ruajtje përmes Cloudinary)",
          "Hyrje / regjistrim i detyrueshëm për të krijuar njoftim",
          "Sistem mesazhesh i integruar për komunikim të sigurt mes palëve",
          "Njoftime aktive deri 3 muaj — fshihen automatikisht pas skadimit",
        ],
      },
      {
        title: "Kontakt",
        paragraphs: ["Për pyetje, partneritete ose mbështetje:"],
        bullets: [
          "Email: info@ketujemi.com · support@ketujemi.com",
          "Telefon: +383 43 555 294",
          "Formular kontakti: www.ketujemi.com/kontakt",
          "Orari i punës: E hënë – E premte, 09:00 – 17:00",
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
          "Foto të vërteta të produktit tuaj — jo foto nga interneti ose katalogë",
        ],
      },
      {
        title: "Produktet dhe shërbimet e ndaluara",
        paragraphs: ["Është rreptësisht e ndaluar të postoni njoftime për:"],
        bullets: [
          "Armë dhe municione — armë zjarri, thika luftarake, eksplozivë, fishekë, silenciatorë dhe çdo pajisje që klasifikohet si armë sipas ligjit",
          "Drogë dhe substanca të ndaluara — çdo substancë narkotike, psikotrope ose të ndaluara me ligj, pavarësisht formës ose sasisë",
          "Ilaçe pa recetë — barna që kërkojnë recetë mjekësore, suplemente të paautorizuara, steroidë, substanca dopinguese",
          "Produkte të falsifikuara — mallra me logo ose markë të imituar (rroba, orë, çanta, elektronikë, dokumente), kopje të produkteve origjinale të paraqitura si të vërteta",
          "Kafshë të egra dhe të mbrojtura — shitja ose blerja e kafshëve të egra, shpendëve egër, reptilëve ose çdo lloji të mbrojtur me ligj vendor ose ndërkombëtar",
          "Shërbime seksuale — çdo ofertë e shërbimeve seksuale, eskorte, ose përmbajtje pornografike",
          "Bileta dhe dokumente false — bileta koncertesh, ndeshjes ose transporti të falsifikuara; dokumente identiteti, diploma ose çertifikata të rreme",
          "Organe dhe pjesë trupi njerëzor — çdo lloj tregtimi me organe, gjak, inde ose materiale biologjike njerëzore",
          "Materiale që nxisin urrejtje — përmbajtje raciste, diskriminuese, ekstremiste ose që nxisin dhunë ndaj grupeve ose individëve",
          "Mallra të vjedhura — çdo produkt i siguruar në mënyrë të paligjshme, pavarësisht nëse dihet ose dyshohet origjina",
        ],
      },
      {
        title: "Dublikatët",
        paragraphs: [
          "**Nuk mund të postoni të njëjtin send dy herë brenda 1 muaji.** Sistemi bllokon automatikisht shpallje të ngjashme (titull, përshkrim, foto, kategori) ndaj një shpalljeje aktive ose të postuar në 30 ditët e fundit.",
          "Një produkt = një shpallje. Nëse dëshironi të ndryshoni çmimin ose detajet, **ndryshoni shpalljen ekzistuese** (Edito) — mos krijoni të re.",
          "Mes dy postimeve radhazi duhet të paktën 30 sekonda pritje.",
        ],
      },
      {
        title: "Postimi është falas dhe i pakufizuar",
        paragraphs: [
          "Të gjithë përdoruesit (privat dhe biznes) mund të postojnë **njoftime të pakufizuara, falas** në çdo kategori — pa pagesë për publikim.",
          "Duhet të **hyni në llogari / të regjistroheni** për të krijuar një njoftim.",
        ],
        bullets: [
          "Opsioni i vetëm me pagesë është **Boost TOP** (opsional) — për të promovuar një njoftim në kryefaqe",
          "Çdo njoftim lejon foto të pakufizuara dhe video opsionale deri në 150MB (Cloudinary)",
        ],
      },
      {
        title: "Kohëzgjatja e njoftimit (3 muaj)",
        paragraphs: [
          "Çdo njoftim i ri **aktivizohet** dhe qëndron online **deri 3 muaj (90 ditë)** nga data e postimit. Pas kësaj **hiqet automatikisht** nëse nuk e fshini vetë më parë.",
          "Në faqen e njoftimit shfaqen **data e postimit** dhe **data e skadimit**.",
        ],
      },
      {
        title: "Pronësia e fotografive",
        paragraphs: [
          "Duke postuar fotografi në KëtuJemi.com, konfirmoni se jeni pronar i tyre ose keni leje të plotë për t'i përdorur. KëtuJemi.com nuk mban përgjegjësi për shkelje të të drejtave të autorit nga përdoruesit.",
        ],
      },
      {
        title: "Pasojat e shkeljeve",
        bullets: [
          "Fshirjen e menjëhershme të njoftimit pa paralajmërim",
          "Suspendimin e përkohshëm të llogarisë (3–30 ditë, sipas rëndësisë së shkeljes)",
          "Bllokimin e përhershëm të llogarisë dhe numrit të telefonit për shkelje të rënda ose të përsëritura",
          "Raportimin te autoritetet kompetente për raste që përfshijnë veprimtari të paligjshme",
        ],
      },
      {
        title: "Kontakti mes përdoruesve",
        paragraphs: [
          "Rekomandojmë të komunikoni vetëm përmes sistemit të mesazheve të platformës për mbrojtjen tuaj. KëtuJemi.com nuk mban përgjegjësi për mashtrime që ndodhin jashtë platformës (WhatsApp, Viber, pagesë paraprake, etj.).",
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
    title: "Termat dhe Kushtet",
    tagline:
      "Duke përdorur KetuJemi.com, pranoni termat dhe kushtet e mëposhtme të operatorit ligjor të platformës.",
    sections: [
      {
        title: "Subjekti ligjor dhe platforma",
        paragraphs: [
          "Platforma KetuJemi.com (Bli & Shit) operohet dhe ofrohet nga REVOLUTION INVEST Sh.p.k., me seli në Ferizaj, Republika e Kosovës.",
          "Pagesat për shërbime opsionale të platformës (Boost TOP, reklama dhe të ngjashme) kryhen në emër të këtij subjekti. KetuJemi.com është emri tregtar; marrëdhënia ligjore me përdoruesin lidhet me REVOLUTION INVEST Sh.p.k.",
        ],
        bulletsIntro: "Të dhënat zyrtare të operatorit:",
        bullets: [
          "Emri i plotë i kompanisë: REVOLUTION INVEST Sh.p.k.",
          "NRB (numri i regjistrimit të biznesit): 811314567",
          "Selia: Ferizaj, Republika e Kosovës",
          "Email: revolutionsinvest05@gmail.com",
          "Telefon: +383 43 555 294",
          "Faqja: www.ketujemi.com",
        ],
      },
      {
        title: "Roli i platformës",
        paragraphs: [
          "KetuJemi.com është vetëm hapësirë ndërlidhëse mes blerësve dhe shitësve. REVOLUTION INVEST Sh.p.k. nuk është palë në kontratën e shitjes së mallrave mes përdoruesve.",
          "Përdoruesi mban përgjegjësi të plotë ligjore për vërtetësinë dhe ligjshmërinë e çdo njoftimi që poston.",
        ],
      },
      {
        title: "Përgjegjësi e kufizuar për mallrat dhe shërbimet",
        paragraphs: [
          "KetuJemi.com nuk blen, nuk shet dhe nuk posedon produktet e listuara në njoftime. Çdo transaksion (çmim, pagesa, dorëzim, garanci) mbetet marrëveshje e drejtpërdrejtë mes blerësit dhe shitësit.",
          "Nuk garantojmë cilësinë, gjendjen, ligjshmërinë ose disponueshmërinë e asnjë malli apo shërbimi të reklamuar nga përdoruesit e tjerë.",
          "Nuk mbajmë përgjegjësi për dëme të drejtpërdrejta apo të tërthorta që lindin nga përdorimi i platformës, nga mospërputhjet mes palëve, nga pagesa jashtë platformës, ose nga veprimet e palëve të treta.",
          "Përgjegjësia jonë maksimale, kur ligji e lejon, kufizohet në shumën e paguar për shërbime të platformës (p.sh. paketa, VIP, TOP) në 12 muajt e fundit — dhe jo për vlerën e mallrave të shitura mes përdoruesve.",
        ],
      },
      {
        title: "Politika e rimbursimit dhe shërbimeve me pagesë",
        paragraphs: [
          "Postimi i njoftimeve është falas dhe i pakufizuar për të gjithë përdoruesit.",
          "Opsioni i vetëm me pagesë për njoftime është **Boost TOP** (promovim opsional në kryefaqe).",
          "Pagesat për Boost TOP, reklama ose shërbime të tjera të platformës janë, për rregull, të pakthyeshme, përveç kur ligji zbatues e kërkon ndryshe ose kur ne e konfirmojmë me shkrim një gabim teknik të verifikuar nga ana jonë.",
        ],
        bullets: [
          "Për mosmarrëveshje rreth një blerjeje mes përdoruesish, kontaktoni palën tjetër; ne mund të ndërmjetësojmë vetëm në masën e moderimit të përmbajtjes",
        ],
      },
      {
        title: "Llogaria dhe postimi",
        bullets: [
          "Duhet të jeni të regjistruar dhe të kyçur në llogari për të postuar njoftime",
          "Jeni përgjegjës për ruajtjen e të dhënave të llogarisë suaj",
          "Respektoni rregullat e kategorive dhe udhëzimet e platformës",
          "Llogaria nuk mund të transferohet te një person tjetër",
        ],
      },
      {
        title: "Përmbajtja",
        bullets: [
          "Mos postoni materiale që shkelin të drejtat e autorit ose ligjin",
          "Platforma mund të heqë ose pezullojë njoftime që shkelin rregullat pa paralajmërim paraprak",
          "Duke postuar, i jepni KëtuJemi.com të drejtën e shfaqjes së përmbajtjes suaj në platformë",
        ],
      },
      {
        title: "Pronësia intelektuale e platformës",
        paragraphs: [
          "Logo, dizajni, kodi dhe struktura e KëtuJemi.com janë pronë ekskluzive e REVOLUTION INVEST Sh.p.k. Ndalohet kopjimi, riprodhimi ose përdorimi i tyre pa leje me shkrim.",
        ],
      },
      {
        title: "Ligji i zbatueshëm dhe mosmarrëveshjet",
        paragraphs: [
          "Këto terma dhe kushte rregullohen nga ligji i Republikës së Kosovës. Çdo mosmarrëveshje që rrjedh nga përdorimi i platformës do të zgjidhet nga gjykatat kompetente të Ferizajt, Republika e Kosovës. Versioni në gjuhën shqipe është versioni zyrtar dhe i detyrueshëm në rast konflikti me versione të tjera gjuhësore.",
        ],
      },
      {
        title: "Ndërprerja e shërbimit",
        paragraphs: [
          "REVOLUTION INVEST Sh.p.k. rezervon të drejtën të ndërpresë, modifikojë ose pezullojë platformën ose çdo pjesë të saj në çdo kohë, me ose pa njoftim paraprak, pa pasur përgjegjësi ligjore ndaj përdoruesve.",
        ],
      },
      {
        title: "Force Majeure",
        paragraphs: [
          "Nuk mbajmë përgjegjësi për ndërprerje ose dëme të shkaktuara nga ngjarje jashtë kontrollit tonë të arsyeshëm, duke përfshirë sulme kibernetike, ndërprerje infrastrukturore, fatkeqësi natyrore ose vendime qeveritare.",
        ],
      },
      {
        title: "Informacion kontakti",
        paragraphs: ["Për pyetje ligjore, shërbime platforme, raportime ose mbështetje:"],
        bullets: [
          "REVOLUTION INVEST Sh.p.k., Ferizaj — NRB 811314567",
          "Email kompanie: revolutionsinvest05@gmail.com · Tel: +383 43 555 294",
          "Platforma: info@ketujemi.com · support@ketujemi.com",
          "Formular: www.ketujemi.com/kontakt",
          "Orari i punës: E hënë – E premte, 09:00 – 17:00",
        ],
      },
      {
        title: "Ndryshimet",
        paragraphs: [
          "Termat dhe kushtet mund të përditësohen; versioni aktual publikohet gjithmonë në këtë faqe. Përdorimi i vazhdueshëm pas ndryshimeve konsiderohet pranim.",
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
          "Numri i telefonit (opsional — për kontakt në njoftim ose hyrje me SMS, nëse e zgjidhni)",
          "Adresa IP (siguri dhe parandalim mashtrimi)",
          "Të dhënat e njoftimeve që postoni (tekst, foto, çmim, kategori)",
          "Të dhënat e sesionit dhe cookies teknike (shih seksionin Cookies më poshtë)",
        ],
      },
      {
        title: "Hyrja me rrjete sociale (Google / Facebook)",
        paragraphs: [
          "Nëse zgjidhni të hyni me Google ose Facebook, marrim vetëm emrin tuaj dhe adresën e email-it nga ata shërbime — asgjë tjetër. Nuk kemi qasje në postimet, kontaktet, mesazhet ose çdo të dhënë tjetër të llogarisë suaj sociale. E përdorim vetëm për identifikimin tuaj në platformë.",
        ],
      },
      {
        title: "Pse i përdorim",
        bullets: [
          "Autentifikim dhe mbështetje përdoruesish",
          "Parandalim spam-i dhe abuzimit",
          "Përmirësim i shërbimit (statistika të përgjithshme, pa shitje të dhënash)",
          "Verifikim i numrit të telefonit përmes SMS (Vonage)",
          "Ruajtje e fotografive të njoftimeve (Cloudinary — serverë ndërkombëtarë)",
        ],
      },
      {
        title: "Cookies",
        paragraphs: [
          "Përdorim cookies teknike për të mbajtur sesionin tuaj aktiv (p.sh. të mbeteni të loguar). Nuk përdorim cookies reklamash dhe nuk ndajmë të dhëna me platforma reklamuese. Mund t'i çaktivizoni cookies në shfletuesin tuaj, por kjo mund të ndikojë në funksionimin e platformës.",
        ],
      },
      {
        title: "Ruajtja dhe të drejtat",
        paragraphs: [
          "Të dhënat ruhen të enkriptuara. Nuk i shesim palëve të treta për marketing. Fotografitë dhe të dhënat e njoftimeve mund të ruhen deri 30 ditë pas fshirjes për qëllime backup — pastaj fshihen përfundimisht. Llogaritë joaktive për më shumë se 24 muaj mund të fshihen pas njoftimit me email.",
          "Mund të kërkoni korrigjim ose fshirje duke na kontaktuar në support@ketujemi.com.",
        ],
      },
      {
        title: "Transferimi ndërkombëtar i të dhënave",
        paragraphs: [
          "Disa shërbime që përdorim (Cloudinary për foto, Vonage për SMS) kanë serverë jashtë Kosovës. Të dhënat tuaja mund të transferohen dhe ruhen jashtë vendit, gjithmonë në përputhje me standardet ndërkombëtare të sigurisë.",
        ],
      },
      {
        title: "Mosha minimale",
        paragraphs: [
          "Platforma është për persona mbi 16 vjeç. Nëse jeni nën këtë moshë, nuk lejohet të krijoni llogari.",
        ],
      },
    ],
  },
  cookies: {
    title: "Politika e Cookies",
    tagline: "Si përdorim cookie në KetuJemi.com.",
    sections: [
      {
        title: "Çfarë janë cookies",
        paragraphs: [
          "Cookies janë skedarë të vegjël teksti që ruhen në pajisjen tuaj kur vizitoni një faqe interneti. I përdorim për të siguruar funksionimin e duhur të platformës dhe për të përmirësuar përvojën tuaj.",
        ],
      },
      {
        title: "Llojet e cookies që përdorim",
        bullets: [
          "Të nevojshme — të detyrueshme për funksionimin bazë: kyçja në llogari, siguria e sesionit, mbajtja gjatë navigimit. Këto nuk mund të çaktivizohen.",
          "Funksionale — ruajnë preferencat tuaja si tregu i zgjedhur (Kosovë / Shqipëri / etj.) dhe gjuha. Pa to, do t'ju duhet të zgjidhni çdo herë nga fillimi.",
          "Analitike — Google Analytics 4: mbledhim të dhëna anonime si faqe të vizituara, numër vizitorësh dhe vendndodhja e përafërt (shtet/qytet). Adresat IP anonimizohen — nuk identifikojmë persona individualë.",
        ],
      },
      {
        title: "Çfarë NUK bëjmë me cookies",
        bullets: [
          "Nuk përdorim cookies reklamash ose tracking të palëve të treta",
          "Nuk ndajmë të dhëna nga cookies me kompani reklamuese",
          "Nuk ndërtojmë profil reklamues bazuar në sjelljen tuaj",
        ],
      },
      {
        title: "Kontrolli juaj",
        paragraphs: [
          'Mund t\'i fikni ose fshini cookies në cilësimet e shfletuesit tuaj në çdo kohë. Disa funksione (si qëndrimi i kyçur) mund të mos punojnë pa cookies të nevojshme. Për instruksione sipas shfletuesit: Chrome, Firefox, Safari, Edge — shikoni menunë "Cilësimet → Privatësia".',
        ],
      },
      {
        title: "Ndryshimet",
        paragraphs: [
          "Kjo politikë mund të përditësohet. Versioni aktual publikohet gjithmonë në këtë faqe.",
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
      "Partner: Shpallje të pakufizuara, profil publik i biznesit, badge i verifikuar, suport me email.",
      "VIP Partner: Çdo gjë nga Partner + shfaqje me logo në faqen kryesore, badge VIP në njoftime dhe statistika të shikimeve të logos.",
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
        title: "Regjistrimi",
        bullets: [
          "Llogaria business është e ndarë nga llogaria private.",
          "Për të postuar si biznes: regjistrohuni dhe hyni në llogari — pa pagesë për publikim.",
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
          "I njëjti send dy herë brenda 1 muaji (dublikatë)",
        ],
      },
      {
        title: "Postimi",
        bullets: [
          "Bizneset mund të postojnë njoftime të pakufizuara dhe falas",
          "Kërkohet hyrje / regjistrim për të krijuar njoftim",
          "Opsioni i vetëm me pagesë është Boost TOP (promovim opsional)",
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
          "Përdoruesit privatë dhe bizneset ndjekin të njëjtën politikë: postim falas dhe i pakufizuar. Shihni Kushtet e Përdorimit në footer.",
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
    phoneLabel: "Telefon:",
    phoneValue: "+383 43 555 294",
    addressLabel: "Adresa:",
    addressValue: "REVOLUTION INVEST Sh.p.k., Ferizaj, Republika e Kosovës",
    hoursLabel: "Orari i Punës:",
    hoursValue: "E Hënë – E Premte, 09:00 – 17:00",
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
      { value: "pyetje", label: "Pyetje e përgjithshme" },
      { value: "problem", label: "Problem teknik" },
      { value: "raportim", label: "Raportim njoftimi" },
      { value: "partneritet", label: "Partneritet dhe biznes" },
      { value: "shtypi", label: "Shtypi dhe media" },
      { value: "ligjor", label: "Kërkesë ligjore" },
      { value: "tjeter", label: "Tjetër" },
    ],
    submitBtn: "Dërgo Mesazhin",
    toastRequired: "Plotësoni të gjitha fushat e detyrueshme",
    toastSuccess: "Mesazhi u dërgua. Do t'ju përgjigjemi së shpejti.",
    toastError: "Mesazhi nuk u dërgua. Provoni përsëri ose na shkruani me email.",
    formNote:
      "Mesazhet dërgohen te support@ketujemi.com dhe info@ketujemi.com. Përgjigjem brenda 24 orëve në ditët e punës.",
    faqTitle: "Pyetje të shpeshta (FAQ)",
    faq: [],
  },
  faq: {
    title: "Pyetjet e Shpeshta (FAQ)",
    tagline:
      "Gjeni përgjigje të shpejta për pyetjet më të zakonshme rreth përdorimit të platformës KetuJemi.com.",
    featuredTitle: "Pyetjet kryesore",
    featured: [
      {
        q: "Si të postoj njoftim?",
        a: "Kliko butonin «Posto Njoftim» në krye të faqes, zgjidhni kategorinë e duhur, plotësoni titullin, përshkrimin dhe çmimin, ngarko foto të pakufizuara (dhe opsionalisht një video deri në 150MB) dhe publiko. Njoftimi bëhet aktiv menjëherë pas moderimit automatik.",
      },
      {
        q: "Sa kushton postimi?",
        a: "Postimi është plotësisht falas dhe i pakufizuar për të gjithë përdoruesit. Opsioni i vetëm me pagesë është Boost TOP — promovim opsional i njoftimit në kryefaqe.",
      },
      {
        q: "Si ta fshij njoftimin?",
        a: "Hyni në llogarinë tuaj te Profili → «Njoftimet e mia», zgjidhni njoftimin dhe klikoni «Fshi». Njoftimi hiqet menjëherë dhe definitivisht.",
      },
      {
        q: "Sa kohë qëndron aktiv njoftimi im?",
        a: "Çdo njoftim qëndron aktiv 3 muaj (90 ditë) nga data e postimit. Pas kësaj fshihet automatikisht. Data e skadimit shfaqet në faqen e njoftimit.",
      },
      {
        q: "Pse duhet numri i telefonit?",
        a: "Numri i telefonit shfaqet te njoftimi juaj që blerësit t'ju kontaktojnë. Nuk kërkohet verifikim SMS para postimit — mjafton të jeni të regjistruar dhe të kyçur.",
      },
      {
        q: "A mund të hyj me Google ose Facebook?",
        a: "Po. Mund të regjistroheni dhe të hyni me llogarinë tuaj Google ose Facebook me 1 klikim. Për të postuar, duhet të jeni të kyçur — telefoni plotësohet në formularin e njoftimit.",
      },
      {
        q: "Sa foto mund të ngarkoj për njoftim?",
        a: "Mund të ngarkoni foto të pakufizuara dhe një video deri në 150MB për çdo njoftim. Rekomandojmë foto të vërteta të produktit tuaj — jo foto nga interneti ose katalogë.",
      },
      {
        q: "Njoftimi im u refuzua — pse?",
        a: "Njoftimet refuzohen nëse përmbajnë produkte të ndaluara, foto jo të vërteta, çmim të pasaktë ose informacion mashtrues. Do të njoftoheni me email për arsyen e refuzimit.",
      },
      {
        q: "Si ta raportoj një njoftim të dyshimtë?",
        a: "Klikoni butonin «Raporto» drejtpërdrejt në faqen e njoftimit ose na shkruani në support@ketujemi.com. Veprojmë brenda 24 orëve.",
      },
      {
        q: "Si funksionon Boost TOP?",
        a: "Boost TOP është opsional — paguani për ta shfaqur njoftimin në kryefaqe për disa ditë. Postimi normal mbetet falas dhe i pakufizuar për të gjithë.",
      },
      {
        q: "A mund të ndryshoj njoftimin pasi e kam postuar?",
        a: "Po. Hyni te Profili → «Njoftimet e mia», zgjidhni njoftimin dhe klikoni «Ndrysho». Mund të ndryshoni titullin, përshkrimin, çmimin dhe fotot.",
      },
      {
        q: "Çfarë bëj nëse jam mashtruar?",
        a: "Na kontaktoni menjëherë në support@ketujemi.com me detajet e rastit. Gjithashtu, raportoni rastin te Policia e Kosovës pasi KetuJemi.com nuk është palë në transaksione mes përdoruesve.",
      },
    ],
    sections: [],
  },
  security: {
    title: "Siguria Online",
    tagline:
      "Këshilla dhe udhëzime zyrtare për t'u mbrojtur gjatë blerjeve dhe shitjeve online në KetuJemi.com.",
    sections: [
      {
        title: "Rregullat e artë të sigurisë",
        bullets: [
          "Mos dërgoni para avans pa u takuar me shitësin në vend publik",
          "Kontrolloni produktin dhe dokumentet përpara çdo pagese",
          "Preferoni pagesa në dorë gjatë takimit personal — evitoni transfertat bankare me të panjohur",
          "Komunikoni vetëm përmes sistemit të mesazheve të platformës — mos kaloni te numra personal ose WhatsApp para takimit",
          "Raportoni çdo njoftim të dyshimtë në support@ketujemi.com",
        ],
      },
      {
        title: "Si të identifikoni një mashtrim",
        bulletsIntro: "Kini kujdes nëse shitësi/blerësi:",
        bullets: [
          "Kërkon para avans para takimit ose dorëzimit",
          "Ofron çmim shumë të ulët pa arsye logjike",
          "Refuzon të takohet personalisht ose kërkon vetëm dërgim postar",
          "Kërkon të komunikoni jashtë platformës menjëherë",
          "Dërgon lidhje të dyshimta ose kërkon të dhëna bankare",
          "Pretendon se është jashtë vendit dhe kërkon transfertë ndërkombëtare",
        ],
      },
      {
        title: "Këshilla për shitësit",
        bullets: [
          "Mos jepni adresën e shtëpisë tuaj në njoftim — takohuni në vend publik",
          "Mos pranoni çeqe ose transferta bankare nga blerës të panjohur pa verifikim",
          "Nëse blerësi kërkon të paguajë më shumë se çmimi dhe ju kërkon t'i ktheni diferencën — është mashtrim i sigurt",
          "Fotot e vërteta të produktit mbrojnë edhe ju — blerësi di saktësisht çfarë blen",
        ],
      },
      {
        title: "Këshilla për blerësit",
        bullets: [
          "Shikoni profilin e shitësit — koha e regjistrimit, njoftimet e tjera, vlerësimet",
          "Kërkoni foto shtesë ose video të produktit para vendimit",
          "Takohuni gjatë ditës në vend publik (qendër tregtare, kafene)",
          "Kontrolloni produktin plotësisht para pagesës — kthimi pas pagesës është vullnet i shitësit, jo detyrim i platformës",
          "Mos klikoni lidhje të jashtme që ju dërgon shitësi",
        ],
      },
      {
        title: "Çfarë bëjmë ne për sigurinë tuaj",
        bullets: [
          "Kërkohet regjistrim dhe hyrje për të postuar njoftime",
          "Sistem raportimi 24/7 — veprojmë brenda 24 orëve",
          "Moderim automatik i njoftimeve të dyshimta",
          "Bllokimi i llogarive mashtruese pas raportimit të verifikuar",
        ],
      },
      {
        title: "Nëse jeni mashtruar",
        bullets: [
          "Mos bëni pagesa të tjera",
          "Ruani të gjitha mesazhet dhe provat",
          "Raportoni te support@ketujemi.com me detajet e plota",
          "Raportoni rastin te Policia e Kosovës — 192 ose te stacioni i policisë më i afërt",
          "Nëse keni bërë transfertë bankare, kontaktoni bankën tuaj menjëherë",
        ],
        paragraphsAfter: [
          "KetuJemi.com nuk është palë në transaksione mes përdoruesve dhe nuk mund të garantojë rimbursim, por do të bashkëpunojmë plotësisht me autoritetet kompetente.",
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
        title: "Rreth KetuJemi.com",
        paragraphs: [
          "KetuJemi.com është platforma kryesore shqiptare e shpalljeve online, e zhvilluar dhe operuar nga REVOLUTION INVEST Sh.p.k., me seli në Ferizaj, Kosovë. Platforma operon në Kosovë, Shqipëri, Maqedoni e Veriut dhe 8 tregje të diasporës shqiptare.",
        ],
      },
      {
        title: "Çfarë ofrojmë mediave",
        bullets: [
          "Logo dhe materiale vizuale të KetuJemi.com (me kërkesë me email)",
          "Intervista me ekipin drejtues (me takim paraprak — minimum 48 orë njoftim)",
          "Të dhëna statistikore të përgjithshme për platformën (numër njoftimesh, kategoritë kryesore, tregjet aktive)",
          "Komunikata zyrtare dhe njoftime për shtyp",
        ],
      },
      {
        title: "Kohëzgjatja e përgjigjes",
        paragraphs: [
          "Kërkesat për shtyp përgjigjen brenda 2–3 ditëve të punës. Për urgjencat, shënoni «SHTYPI — URGJENT» në subjektin e email-it.",
        ],
      },
      {
        title: "Informacion kontakti për media",
        bullets: [
          "Email për Media: info@ketujemi.com",
          "Subjekti: «Kërkesë Media — [emri i medias]»",
          "Operatori ligjor: REVOLUTION INVEST Sh.p.k., Ferizaj, NRB 811314567",
        ],
        paragraphsAfter: [
          "Çdo komunikatë zyrtare vjen vetëm nga adresat @ketujemi.com ose @revolutioninvest.com. Kini kujdes nga adresa të tjera që pretendojnë të jenë KetuJemi.",
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
        title: "Оператор на платформата",
        paragraphs: [
          "KetuJemi.com е платформа развиена од тимот на REVOLUTION INVEST Sh.p.k. за да им помогне на локалниот пазар и дијаспората — брзо, едноставно и безбедно.",
          "Правен оператор: REVOLUTION INVEST Sh.p.k., Ferizaj, Косово (NRB 811314567).",
        ],
      },
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
          "Косово, Албанија, Северна Македонија и 8 пазари од дијаспората (Германија, Швајцарија, Австрија, Франција, Италија, Англија, САД, Црна Гора)",
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
          "**Не можете да објавите ист производ двапати во рок од 1 месец.** Системот автоматски ги блокира слични огласи (наслов, опис, фотографија, категорија) спрема активен оглас или оглас објавен во последните 30 дена.",
          "Еден производ = еден оглас. Ако сакате да промените цена или детали, **уредете го постоечкиот оглас** (Уреди) — не креирајте нов.",
          "Потребни се најмалку 30 секунди меѓу две последователни објави.",
        ],
      },
      {
        title: "Објавувањето е бесплатно и неограничено",
        paragraphs: [
          "Сите корисници (приватни и бизнис) можат да објавуваат **неограничено, бесплатно** во секоја категорија — без надомест за објава.",
          "Мора да сте **најавени / регистрирани** за да креирате оглас.",
        ],
        bullets: [
          "Единствената платена опција е **Boost TOP** (опционално) — за промоција на оглас на почетната страница",
          "Неограничени вистински фотографии по оглас и опционално видео до 150MB",
        ],
      },
      {
        title: "Траење на огласот (3 месеци)",
        paragraphs: [
          "Секој оглас е активен **до 3 месеци (90 дена)** од објавувањето, потоа се **отстранува автоматски** ако не го избришете порано.",
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
    title: "Услови и одредби",
    tagline:
      "Со користење на KetuJemi.com ги прифаќате следните услови на правниот оператор на платформата.",
    sections: [
      {
        title: "Правен субјект и платформа",
        paragraphs: [
          "Платформата KetuJemi.com (Bli & Shit) ја управува и ја нуди REVOLUTION INVEST Sh.p.k., со седиште во Ferizaj, Република Косово.",
          "Плаќањата за опционални услуги на платформата (Boost TOP, реклами и слично) се вршат во име на овој субјект. KetuJemi.com е трговско име; правниот однос е со REVOLUTION INVEST Sh.p.k.",
        ],
        bulletsIntro: "Службени податоци за операторот:",
        bullets: [
          "Полно име: REVOLUTION INVEST Sh.p.k.",
          "NRB (број на регистрација на бизнисот): 811314567",
          "Седиште: Ferizaj, Република Косово",
          "Email: revolutioninvest05@gmail.com",
          "Телефон: +383 43 555 294",
          "Веб-страница: www.ketujemi.com",
        ],
      },
      {
        title: "Улога на платформата",
        paragraphs: [
          "KetuJemi.com е само посреднички простор. REVOLUTION INVEST Sh.p.k. не е страна во договорот за продажба на стоки меѓу корисниците.",
          "Корисникот носи целосна правна одговорност за секој објавен оглас.",
        ],
      },
      {
        title: "Ограничена одговорност за стоки и услуги",
        paragraphs: [
          "KetuJemi.com не купува, не продава и не поседува производите во огласите. Секоја трансакција (цена, плаќање, испорака, гаранција) е договор директно меѓу купувачот и продавачот.",
          "Не гарантираме квалитет, состојба, законитост или достапност на производи или услуги објавени од други корисници.",
          "Не сме одговорни за директна или индиректна штета од користење на платформата, несогласувања меѓу страни, плаќања надвор од платформата или дејства на трети лица.",
          "Нашата максимална одговорност, каде законот дозволува, е ограничена на износот платен за услуги на платформата (пакети, VIP, TOP) во последните 12 месеци — не за вредноста на стоки продадени меѓу корисници.",
        ],
      },
      {
        title: "Политика за рефундирање и платени услуги",
        paragraphs: [
          "Објавувањето огласи е бесплатно и неограничено за сите корисници.",
          "Единствената платена опција за огласи е **Boost TOP** (опционална промоција на почетната страница).",
          "Плаќања за Boost TOP, реклами или други услуги на платформата се, по правило, неповратни, освен кога применливиот закон бара поинаку или кога ние писмено потврдиме верификувана техничка грешка од наша страна.",
        ],
        bullets: [
          "За спорови околу купување меѓу корисници, контактирајте ја другата страна; ние посредуваме само преку модерација на содржина.",
        ],
      },
      {
        title: "Сметка и објавување",
        bullets: [
          "Мора да сте регистрирани и најавени за да објавувате огласи",
          "Вие сте одговорни за безбедноста на сметката",
          "Почитувајте правилата на категориите и упатствата на платформата",
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
        title: "Контакт информации",
        paragraphs: ["За правни прашања, услуги на платформата, пријави или поддршка:"],
        bullets: [
          "REVOLUTION INVEST Sh.p.k., Ferizaj — NRB 811314567",
          "Email на компанијата: revolutioninvest05@gmail.com · Тел: +383 43 555 294",
          "Платформа: info@ketujemi.com · support@ketujemi.com",
          "Формулар: www.ketujemi.com/kontakt",
          "Работно време: Понеделник – Петок, 09:00 – 17:00",
        ],
      },
      {
        title: "Промени",
        paragraphs: [
          "Условите можат да се ажурираат; актуелната верзија е на оваа страница. Продолженото користење по промени се смета за прифаќање.",
        ],
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
          "Телефон (опционално — за контакт на оглас или најава со SMS, ако изберете)",
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
      {
        title: "Најава преку Google или Facebook",
        paragraphs: [
          "Ако најавите преку Google или Facebook, добиваме само име и email од нив — ништо друго. Немаме пристап до вашата социјална сметка.",
        ],
      },
      {
        title: "Колачиња (cookies)",
        paragraphs: [
          "Користиме технички колачиња за вашата сесија. Не користиме рекламни колачиња.",
        ],
      },
      {
        title: "Податоци од огласи",
        paragraphs: [
          "Кога ќе избришете оглас, веднаш се отстранува од јавната страница. Текстот и метаподатоците може да останат во безбедна резервна копија до 30 дена, потоа се бришат. Фотографиите се отстрануваат од складиштето кога огласот се брише.",
        ],
      },
      {
        title: "Минимална возраст",
        paragraphs: ["Платформата е за лица постари од 16 години."],
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
          "Аналитички: **Google Analytics 4** — посетени страници, посетители, приближна локација; анонимизирана IP",
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
      "Partner: Неограничени огласи, јавен бизнис профил, верификувана значка, email поддршка.",
      "VIP Partner: Сè од Partner + лого на почетна, VIP badge и статистика.",
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
        title: "Регистрација",
        bullets: [
          "Бизнис сметката е одделена од приватната сметка.",
          "За објавување како бизнис: регистрирајте се и најавете се — без надомест за објава.",
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
        title: "Објавување",
        bullets: [
          "Бизнисите можат да објавуваат неограничено и бесплатно",
          "Потребна е најава / регистрација за креирање оглас",
          "Единствената платена опција е Boost TOP (опционална промоција)",
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
          "Приватните и бизнис корисниците имаат иста политика: бесплатно и неограничено објавување. Погледнете Услови за користење во footer.",
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
            a: "Неограничено — објавувањето е целосно бесплатно за сите корисници. Единствената платена опција е Boost TOP (опционално).",
          },
          {
            q: "Дали можам да објавувам од странство?",
            a: "Да! Дијаспората од Германија, Швајцарија, Австрија, Франција, Италија, Англија и САД може нормално да објавува со својот телефонски број.",
          },
          {
            q: "Колку фотографии можам да прикачам за еден оглас?",
            a: "Неограничен број фотографии и едно видео до 150MB по оглас.",
          },
        ],
      },
      {
        title: "Сметка и безбедност",
        items: [
          {
            q: "Како да креирам сметка?",
            a: "Со телефонски број (SMS), Google или Facebook. За објавување мора да сте најавени — телефонот се внесува во формуларот за оглас.",
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
        title: "Boost TOP",
        items: [
          {
            q: "Што е Boost TOP?",
            a: "Boost TOP е опционална платена промоција — вашиот оглас се прикажува на почетната страница за одреден број дена. Обичното објавување останува бесплатно и неограничено.",
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
        title: "Operater platforme",
        paragraphs: [
          "KetuJemi.com je platforma koju je razvio tim REVOLUTION INVEST Sh.p.k. da pomogne lokalnom tržištu i dijaspori — brzo, jednostavno i sigurno.",
          "Pravni operater: REVOLUTION INVEST Sh.p.k., Ferizaj, Kosovo (NRB 811314567).",
        ],
      },
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
          "Kosovo, Albanija, Sjeverna Makedonija i 8 tržišta dijaspore (Njemačka, Švicarska, Austrija, Francuska, Italija, Engleska, SAD, Crna Gora)",
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
          "**Ne možete objaviti isti proizvod dvaput u roku od 1 mjeseca.** Sistem automatski blokira slične oglase (naslov, opis, fotografija, kategorija) u odnosu na aktivan oglas ili oglas objavljen u posljednjih 30 dana.",
          "Jedan proizvod = jedan oglas. Ako želite promijeniti cijenu ili detalje, **uredite postojeći oglas** (Uredi) — ne kreirajte novi.",
          "Potrebno je najmanje 30 sekundi između dvije uzastopne objave.",
        ],
      },
      {
        title: "Objavljivanje je besplatno i neograničeno",
        paragraphs: [
          "Svi korisnici (privatni i biznis) mogu objavljivati **neograničeno, besplatno** u bilo kojoj kategoriji — bez naknade za objavu.",
          "Morate biti **prijavljeni / registrovani** da biste kreirali oglas.",
        ],
        bullets: [
          "Jedina plaćena opcija je **Boost TOP** (opciono) — za promociju oglasa na početnoj stranici",
          "Neograničen broj stvarnih fotografija po oglasu i opcionalni video do 150MB",
        ],
      },
      {
        title: "Trajanje oglasa (3 mjeseca)",
        paragraphs: [
          "Svaki oglas je aktivan **do 3 mjeseca (90 dana)** od objave, zatim se **automatski uklanja** ako ga sami ne obrišete.",
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
    title: "Uslovi i odredbe",
    tagline:
      "Korišćenjem KetuJemi.com prihvatate sljedeće uslove pravnog operatera platforme.",
    sections: [
      {
        title: "Pravni subjekt i platforma",
        paragraphs: [
          "Platformu KetuJemi.com (Bli & Shit) upravlja i nudi REVOLUTION INVEST Sh.p.k., sa sjedištem u Ferizaju, Republika Kosovo.",
          "Plaćanja za opcione usluge platforme (Boost TOP, reklame i slično) vrše se u ime ovog subjekta. KetuJemi.com je trgovački naziv; pravni odnos je sa REVOLUTION INVEST Sh.p.k.",
        ],
        bulletsIntro: "Službeni podaci operatera:",
        bullets: [
          "Puno ime: REVOLUTION INVEST Sh.p.k.",
          "NRB (broj registracije biznisa): 811314567",
          "Sjedište: Ferizaj, Republika Kosovo",
          "Email: revolutioninvest05@gmail.com",
          "Telefon: +383 43 555 294",
          "Web: www.ketujemi.com",
        ],
      },
      {
        title: "Uloga platforme",
        paragraphs: [
          "KetuJemi.com je samo posrednički prostor. REVOLUTION INVEST Sh.p.k. nije strana u ugovoru o prodaji robe između korisnika.",
          "Korisnik snosi punu pravnu odgovornost za svaki objavljeni oglas.",
        ],
      },
      {
        title: "Ograničena odgovornost za robu i usluge",
        paragraphs: [
          "KetuJemi.com ne kupuje, ne prodaje i ne posjeduje proizvode u oglasima. Svaka transakcija (cijena, plaćanje, isporuka, garancija) je dogovor direktno između kupca i prodavca.",
          "Ne garantujemo kvalitet, stanje, zakonitost ili dostupnost robe ili usluga koje objavljuju drugi korisnici.",
          "Nismo odgovorni za direktnu ili indirektnu štetu od korišćenja platforme, neslaganja između strana, plaćanja van platforme ili radnji trećih lica.",
          "Naša maksimalna odgovornost, gdje zakon dozvoljava, ograničena je na iznos plaćen za usluge platforme (paketi, VIP, TOP) u posljednjih 12 mjeseci — ne za vrijednost robe prodate među korisnicima.",
        ],
      },
      {
        title: "Politika povrata i plaćenih usluga",
        paragraphs: [
          "Objavljivanje oglasa je besplatno i neograničeno za sve korisnike.",
          "Jedina plaćena opcija za oglase je **Boost TOP** (opciona promocija na početnoj stranici).",
          "Plaćanja za Boost TOP, reklame ili druge usluge platforme su, po pravilu, nepovratna, osim kada primjenjivi zakon zahtijeva drugačije ili kada mi pisano potvrdimo verifikovanu tehničku grešku sa naše strane.",
        ],
        bullets: [
          "Za sporove oko kupovine među korisnicima kontaktirajte drugu stranu; mi posredujemo samo kroz moderaciju sadržaja.",
        ],
      },
      {
        title: "Nalog i objavljivanje",
        bullets: [
          "Morate biti registrovani i prijavljeni da biste objavljivali oglase",
          "Vi ste odgovorni za sigurnost naloga",
          "Poštujte pravila kategorija i upute platforme",
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
        title: "Kontakt informacije",
        paragraphs: ["Za pravna pitanja, usluge platforme, prijave ili podršku:"],
        bullets: [
          "REVOLUTION INVEST Sh.p.k., Ferizaj — NRB 811314567",
          "Email kompanije: revolutioninvest05@gmail.com · Tel: +383 43 555 294",
          "Platforma: info@ketujemi.com · support@ketujemi.com",
          "Formular: www.ketujemi.com/kontakt",
          "Radno vrijeme: Ponedjeljak – Petak, 09:00 – 17:00",
        ],
      },
      {
        title: "Izmjene",
        paragraphs: [
          "Uslovi se mogu ažurirati; aktuelna verzija je na ovoj stranici. Nastavak korišćenja nakon izmjena smatra se prihvatanjem.",
        ],
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
      {
        title: "Prijava putem Google ili Facebook",
        paragraphs: [
          "Ako se prijavite putem Google ili Facebook, primamo samo ime i email od njih — ništa drugo. Nemamo pristup vašem društvenom nalogu.",
        ],
      },
      {
        title: "Kolačići",
        paragraphs: [
          "Koristimo tehničke kolačiće za vašu sesiju. Ne koristimo reklamne kolačiće.",
        ],
      },
      {
        title: "Podaci o oglasima",
        paragraphs: [
          "Kada obrišete oglas, odmah se uklanja sa javne stranice. Tekst i metapodaci oglasa mogu ostati u sigurnoj rezervnoj kopiji do 30 dana, zatim se brišu. Fotografije se uklanjaju iz skladišta kada se oglas obriše.",
        ],
      },
      {
        title: "Minimalna starost",
        paragraphs: ["Platforma je namijenjena osobama starijim od 16 godina."],
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
          "Analitički: **Google Analytics 4** — posjećene stranice, posjetioci, približna lokacija; anonimizirana IP",
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
      "Partner: Neograničeni oglasi, javni profil, verifikovani bedž, email podrška.",
      "VIP Partner: Sve iz Partner + logo na početnoj, VIP bedž i statistika.",
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
        title: "Registracija",
        bullets: [
          "Biznis nalog je odvojen od privatnog naloga.",
          "Za objavljivanje kao biznis: registrujte se i prijavite se — bez naknade za objavu.",
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
          "Isti proizvod dvaput u roku od 1 mjeseca (duplikat)",
        ],
      },
      {
        title: "Objavljivanje",
        bullets: [
          "Biznisi mogu objavljivati neograničeno i besplatno",
          "Potrebna je prijava / registracija za kreiranje oglasa",
          "Jedina plaćena opcija je Boost TOP (opciona promocija)",
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
          "Privatni i biznis korisnici imaju istu politiku: besplatno i neograničeno objavljivanje. Pogledajte Uslove korišćenja u footeru.",
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
            a: "Neograničeno — objavljivanje je potpuno besplatno za sve korisnike. Jedina plaćena opcija je Boost TOP (opciono).",
          },
          {
            q: "Mogu li da objavljujem iz inostranstva?",
            a: "Da! Dijaspora iz Njemačke, Švicarske, Austrije, Francuske, Italije, Engleske i SAD može normalno objavljivati sa svojim brojem telefona.",
          },
          {
            q: "Koliko fotografija mogu učitati po oglasu?",
            a: "Neograničen broj fotografija i jedan video do 150MB po oglasu.",
          },
        ],
      },
      {
        title: "Nalog i sigurnost",
        items: [
          {
            q: "Kako da kreiram nalog?",
            a: "Putem broja telefona (SMS), Google ili Facebook. Za objavljivanje morate biti prijavljeni — telefon se unosi u formular oglasa.",
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
        title: "Boost TOP",
        items: [
          {
            q: "Šta je Boost TOP?",
            a: "Boost TOP je opcionalna plaćena promocija — vaš oglas se prikazuje na početnoj stranici određeni broj dana. Obično objavljivanje ostaje besplatno i neograničeno.",
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
            a: "Kosovo, Albanija, Sjeverna Makedonija i 8 tržišta dijaspore (Njemačka, Švicarska, Austrija, Francuska, Italija, Engleska, SAD, Crna Gora).",
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
  en: EN_STATIC_PAGES,
  fr: FR_STATIC_PAGES,
  de: DE_STATIC_PAGES,
  it: IT_STATIC_PAGES,
};

export function staticPagesForLocale(locale: StaticPageLocaleKey): StaticPagesCopy {
  return STATIC_PAGES[locale];
}

/** Static legal/FAQ pages — follows {@link translationKeyForUiLang} like the rest of the app. */
export function useStaticPages(): StaticPagesCopy {
  const { uiLang } = useMarket();
  return staticPagesForLocale(translationKeyForUiLang(uiLang));
}
