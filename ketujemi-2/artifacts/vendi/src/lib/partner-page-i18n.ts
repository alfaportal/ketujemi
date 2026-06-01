import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type PartnerBenefit = { icon: string; title: string; desc: string };

export type PartnerPageCopy = {
  docTitle: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  benefitsTitle: string;
  benefits: PartnerBenefit[];
  packagesTitle: string;
  standardTitle: string;
  standardPrice: string;
  periodPerMonth: string;
  standardFeatures: string[];
  vipTitle: string;
  vipPrice: string;
  vipFeatures: string[];
  formTitle: string;
  formSubtitle: string;
  labelBusinessName: string;
  labelContactName: string;
  labelEmail: string;
  labelPhone: string;
  labelPackage: string;
  packagePlaceholder: string;
  packageStandard: string;
  packageVip: string;
  labelLogo: string;
  logoUrlPlaceholder: string;
  uploadLogo: string;
  labelLink: string;
  linkPlaceholder: string;
  termsLabel: string;
  submitButton: string;
  contractTitle: string;
  contractText: string;
  errRequired: string;
  errTerms: string;
  errLogoUnavailable: string;
  errUploadFailed: string;
  errRegisterFailed: string;
  errServer: string;
  errPaymentOpen: string;
  successTitle: string;
  successPending: string;
  successPaid: string;
  successHome: string;
  landingCta: string;
  landingCtaHint: string;
  termsOpenHint: string;
  successNoticeEmail: string;
  successNoticePayment: string;
  successNoticeActivate: string;
};

const SQ: PartnerPageCopy = {
  docTitle: "Partner — KetuJemi.com",
  heroBadge: "PROGRAMI PARTNER",
  heroTitle: "Rrit Biznesin Tënd me KetuJemi.com",
  heroSubtitle: "Mbi 50,000 klientë të mundshëm çdo muaj",
  benefitsTitle: "PËRFITIMET TUAJA",
  benefits: [
    {
      icon: "📈",
      title: "Dukshmëri maksimale",
      desc: "shpallje të featured në krye të rezultateve",
    },
    { icon: "👥", title: "50,000+ vizitorë aktivë", desc: "çdo muaj në platformë" },
    { icon: "🎯", title: "Targetim sipas kategorisë", desc: "dhe lokacionit" },
    { icon: "🗂️", title: "Panel i dedikuar biznesi", desc: "menaxho gjithçka nga një vend" },
    {
      icon: "⭐",
      title: 'Badge "Partner i Verifikuar"',
      desc: "besueshmëri e shtuar tek blerësit",
    },
    {
      icon: "📊",
      title: "Statistika të detajuara",
      desc: "shiko sa njerëz shohin njoftimet tua",
    },
    {
      icon: "🚀",
      title: "Prioritet në rezultatet e kërkimit",
      desc: "del para konkurrentëve",
    },
  ],
  packagesTitle: "PAKETAT",
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
  ],
  vipTitle: "VIP PARTNER (E rekomanduar)",
  vipPrice: "€50",
  vipFeatures: [
    "Gjithçka nga Standard +",
    "Deri 100 njoftime aktive njëkohësisht",
    "Pozicion prioritar në kërkim — del i pari",
    "Badge VIP i dukshëm në çdo njoftim",
    "Logo e madhe e biznesit me link në faqen kryesore",
    "Statistika të avancuara — shikime, klikime, kontakte",
    "Suport prioritar me telefon dhe email",
  ],
  formTitle: "FORMULARI I REGJISTRIMIT",
  formSubtitle: "",
  labelBusinessName: "Emri i Biznesit",
  labelContactName: "Emri i Kontaktit",
  labelEmail: "Email",
  labelPhone: "Telefon",
  labelPackage: "Paketa",
  packagePlaceholder: "Zgjidhni paketën",
  packageStandard: "Standard €30/muaj",
  packageVip: "VIP €50/muaj",
  labelLogo: "Logo (URL ose upload — fakultativ)",
  logoUrlPlaceholder: "https://...",
  uploadLogo: "Ngarko",
  labelLink: "Linku juaj (website, Instagram ose Facebook — 1 link)",
  linkPlaceholder: "https://instagram.com/...",
  termsLabel: "Kam lexuar dhe pranoj kushtet e kontratës",
  submitButton: "Regjistrohu si Partner",
  contractTitle: "Kushtet e Plota",
  contractText: `KONTRATË SHËRBIMI — KETUJEMI.COM

1. OBJEKTI I KONTRATËS
Klienti merr akses në platformën KetuJemi.com sipas paketës së zgjedhur (Standard €30/muaj ose VIP €50/muaj). Platforma ofron hapësirë reklamuese dixhitale, dukshmëri ndaj konsumatorëve aktivë dhe mjete profesionale për menaxhimin e shpalljeve.

2. KOHËZGJATJA
Kontrata fillon nga data e pagesës së parë dhe vazhdon pa afat të caktuar. Palët mund ta zgjasin ose ndryshojnë me marrëveshje të ndërsjellë me shkrim.

3. KUSHTET E ANULIMIT
Klienti mund të anulojë abonimin në çdo kohë duke njoftuar me email në info@ketujemi.com minimum 30 ditë para datës së dëshiruar të përfundimit. Pagesat e bëra nuk rimbursohen.

4. PAGESA
Pagesa bëhet çdo muaj automatikisht me kartë bankare përmes Stripe. Pagesa e parë bëhet në ditën e regjistrimit dhe aktivizon menjëherë paketën e zgjedhur. Nëse pagesa dështon, llogaria pezullohet pas 3 ditëve njoftim.

5. NDRYSHIMI I ÇMIMEVE
KetuJemi.com ka të drejtë të ndryshojë çmimet me njoftim minimum 30 ditë paraprak me email. Klienti ka të drejtë të anulojë brenda 30 ditëve nga njoftimi pa penalitet.

6. MOS PAGESA — PROCEDURA

Paralajmërimi 1: Email pas 3 ditësh vonesë
Paralajmërimi 2: Email pas 7 ditësh + pezullim i përkohshëm i llogarisë
Paralajmërimi 3: Email pas 15 ditësh + pezullim i plotë
Paralajmërimi 4: Email pas 30 ditësh + kalimi te organi kompetent sipas legjislacionit në fuqi

7. PËRGJEGJËSIA E KLIENTIT
Klienti është përgjegjës për saktësinë e informacionit të publikuar. KetuJemi.com rezervon të drejtën të heqë çdo përmbajtje që shkel rregullat e platformës pa rimbursim. Klienti garanton se posedon të drejtat e logjove dhe materialeve që ngarkon.

8. LIGJI I ZBATUESHËM
Kjo kontratë rregullohet sipas legjislacionit të Republikës së Kosovës. Çdo mosmarrëveshje që rrjedh nga kjo kontratë zgjidhet nga gjykatat kompetente të Ferizajt, Republika e Kosovës.

9. NËNSHKRIMI ELEKTRONIK
Klikimi i butonit "Regjistrohu si Partner" dhe plotësimi i formularit konsiderohet nënshkrim i vlefshëm elektronik dhe regjistrohet me datë, orë dhe IP adresë. Klienti pranon se ka lexuar dhe kuptuar të gjitha kushtet e kësaj kontrate.`,
  errRequired: "Plotësoni të gjitha fushat e detyrueshme.",
  errTerms: "Duhet të pranoni kushtet e kontratës.",
  errLogoUnavailable: "Ngarkimi i logos nuk është i disponueshëm — vendosni URL.",
  errUploadFailed: "Ngarkimi i logos dështoi.",
  errRegisterFailed: "Regjistrimi dështoi.",
  errServer: "Lidhja me serverin dështoi. Provoni përsëri.",
  errPaymentOpen: "S’u hap pagesa.",
  successTitle: "Faleminderit!",
  successPending:
    "Kërkesa u regjistrua. Kontrolloni emailin për lidhjen e pagesës — pas pagesës aktivizoheni automatikisht.",
  successPaid:
    "Pagesa u konfirmua! Llogaria juaj Partner është aktive. Kontrolloni SMS/email për kodin e aktivizimit dhe hyni në /login.",
  successHome: "Kthehu në faqen kryesore",
  landingCta: "Regjistrohu si Partner",
  landingCtaHint: "Scroll te formulari i regjistrimit më poshtë.",
  termsOpenHint: "Lexoni kushtet e plota",
  successNoticeEmail:
    "Kontrolloni emailin tuaj — aty do të gjeni konfirmimin e regjistrimit dhe udhëzimet e hapësirës.",
  successNoticePayment:
    "Pagesa e paketës bëhet online me Stripe. Pas pagesës, llogaria Partner aktivizohet automatikisht.",
  successNoticeActivate:
    "Pas aktivizimit, hyni në /login me emailin e biznesit për të menaxhuar shpalljet.",
};

const MK: PartnerPageCopy = {
  docTitle: "Партнер — KetuJemi.com",
  heroBadge: "Партнерска програма",
  heroTitle: "Растете го вашиот бизнис со KetuJemi.com",
  heroSubtitle: "Над 50.000 потенцијални клиенти секој месец",
  benefitsTitle: "Вашите придобивки",
  benefits: [
    { icon: "📈", title: "Максимална видливост", desc: "истакнати огласи на врв" },
    { icon: "👥", title: "50.000+ активни посетители", desc: "секој месец" },
    { icon: "🎯", title: "Таргетирање по категорија", desc: "и локација" },
    { icon: "📱", title: "Посебен бизнис панел", desc: "" },
    { icon: "⭐", title: 'Значка „Верификуван партнер"', desc: "" },
    { icon: "📊", title: "Детална статистика", desc: "" },
    { icon: "🚀", title: "Приоритет во резултатите", desc: "" },
  ],
  packagesTitle: "Пакети",
  standardTitle: "STANDARD ПАРТНЕР",
  standardPrice: "€30",
  periodPerMonth: "/месец",
  standardFeatures: [
    "Персонализирана продавница на KetuJemi.com",
    "До 50 активни огласи",
    "Лого со линк на почетната страница",
    'Значка „Верификуван партнер"',
  ],
  vipTitle: "VIP ПАРТНЕР",
  vipPrice: "€50",
  vipFeatures: [
    "Сè од Standard +",
    "До 100 активни огласи",
    "Приоритетна позиција во пребарување",
    "Видлива VIP значка",
    "Напредна статистика",
    "Поголемо лого на почетната страница",
  ],
  formTitle: "Регистрирајте се како партнер",
  formSubtitle: "Пополнете го формуларот — автоматска активација по плаќање.",
  labelBusinessName: "Име на бизнис",
  labelContactName: "Контакт лице",
  labelEmail: "Email",
  labelPhone: "Телефон",
  labelPackage: "Пакет",
  packagePlaceholder: "Изберете пакет",
  packageStandard: "Standard Partner €30",
  packageVip: "VIP Partner €50",
  labelLogo: "URL на лого или прикачи",
  logoUrlPlaceholder: "https://...",
  uploadLogo: "Прикачи",
  labelLink: "Ваш линк (веб, Instagram или Facebook — 1 линк)",
  linkPlaceholder: "https://instagram.com/...",
  termsLabel: "Ги прочитав и прифаќам условите на договорот",
  submitButton: "Регистрирај се како партнер",
  contractTitle: "Целосни услови",
  contractText: `ДОГОВОР ЗА УСЛУГА — KETUJEMI.COM

1. ПРЕДМЕТ НА ДОГОВОРОТ
Клиентот добива пристап до платформата KetuJemi.com според 
избраниот пакет (Standard €30/месец или VIP €50/месец).

2. ТРАЕЊЕ
Договорот започнува од датумот на потпис и трае 
без определен рок.

3. ОТКАЖУВАЊЕ
Клиентот мора писмено да извести минимум 3 месеци 
пред саканиот датум на прекин.

4. ПЛАЌАЊЕ
- Плаќањето се врши месечно автоматски
- IBAN е задолжителен пред активација

5. ПРОМЕНА НА ЦЕНИ
KetuJemi.com може да ги промени цените со 
најавување минимум 3 месеци однапред.

6. НЕПЛАЌАЊЕ
Потсетници по email на 3, 7, 15 и 30 дена; 
по 30 дена суспензија.

7. ОДГОВОРНОСТ
Клиентот е одговорен за точноста на објавените информации.

8. ПРИМЕНЛИВО ПРАВО
Според законодавството на државата каде бизнисот работи.

9. ЕЛЕКТРОНСКИ ПОТПИС
Кликнувањето „Регистрирај се како партнер" е валиден електронски потпис.`,
  errRequired: "Пополнете ги сите задолжителни полиња.",
  errTerms: "Мора да ги прифатите условите на договорот.",
  errLogoUnavailable: "Прикачувањето на лого не е достапно — внесете URL.",
  errUploadFailed: "Прикачувањето на лого не успеа.",
  errRegisterFailed: "Регистрацијата не успеа.",
  errServer: "Врската со серверот не успеа. Обидете се повторно.",
  errPaymentOpen: "Плаќањето не се отвори.",
  successTitle: "Ви благодариме!",
  successPending:
    "Барањето е регистрирано. Проверете email за линк за плаќање — по плаќање се активирате автоматски.",
  successPaid:
    "Плаќањето е потврдено! Вашата Partner сметка е активна. Проверете SMS/email за код и најавете се на /login.",
  successHome: "Назад на почетна",
  landingCta: "Регистрирај се како партнер",
  landingCtaHint:
    "Прво отворете сметка (email или телефон), потоа изберете пакет и пополнете го партнерскиот формулар.",
  termsOpenHint: "Прочитајте ги целосните услови (се отвораат подолу)",
  successNoticeEmail:
    "Проверете го email — таму ќе го најдете потврдувањето и инструкциите за продавницата.",
  successNoticePayment:
    "Плаќањето е онлајн преку Stripe. По плаќање, Partner сметката се активира автоматски.",
  successNoticeActivate:
    "По активација, најавете се на /login со email на бизнисот за да ги управувате огласите.",
};

const MNE: PartnerPageCopy = {
  docTitle: "Partner — KetuJemi.com",
  heroBadge: "Partnerski program",
  heroTitle: "Rastite svoj biznis sa KetuJemi.com",
  heroSubtitle: "Preko 50.000 potencijalnih klijenata mjesečno",
  benefitsTitle: "Vaše pogodnosti",
  benefits: [
    { icon: "📈", title: "Maksimalna vidljivost", desc: "istaknuti oglasi na vrhu" },
    { icon: "👥", title: "50.000+ aktivnih posjetilaca", desc: "svaki mjesec" },
    { icon: "🎯", title: "Targetiranje po kategoriji", desc: "i lokaciji" },
    { icon: "📱", title: "Posvećeni biznis panel", desc: "" },
    { icon: "⭐", title: 'Bedž „Verifikovani partner"', desc: "" },
    { icon: "📊", title: "Detaljna statistika", desc: "" },
    { icon: "🚀", title: "Prioritet u rezultatima pretrage", desc: "" },
  ],
  packagesTitle: "Paketi",
  standardTitle: "STANDARD PARTNER",
  standardPrice: "€30",
  periodPerMonth: "/mjesec",
  standardFeatures: [
    "Personalizovana prodavnica na KetuJemi.com",
    "Do 50 aktivnih oglasa",
    "Logo sa linkom na početnoj stranici",
    'Bedž „Verifikovani partner"',
  ],
  vipTitle: "VIP PARTNER",
  vipPrice: "€50",
  vipFeatures: [
    "Sve iz Standard +",
    "Do 100 aktivnih oglasa",
    "Prioritetna pozicija u pretrazi",
    "Vidljiv VIP bedž",
    "Napredna statistika",
    "Veće logo na početnoj stranici",
  ],
  formTitle: "Registrujte se kao partner",
  formSubtitle: "Popunite formular — automatska aktivacija nakon plaćanja.",
  labelBusinessName: "Naziv biznisa",
  labelContactName: "Kontakt osoba",
  labelEmail: "Email",
  labelPhone: "Telefon",
  labelPackage: "Paket",
  packagePlaceholder: "Izaberite paket",
  packageStandard: "Partner Standard €30",
  packageVip: "VIP Partner €50",
  labelLogo: "URL loga ili upload",
  logoUrlPlaceholder: "https://...",
  uploadLogo: "Upload",
  labelLink: "Vaš link (web, Instagram ili Facebook — 1 link)",
  linkPlaceholder: "https://instagram.com/...",
  termsLabel: "Pročitao/la sam i prihvatam uslove ugovora",
  submitButton: "Registruj se kao partner",
  contractTitle: "Potpuni uslovi",
  contractText: `UGOVOR O USLUGAMA — KETUJEMI.COM

1. PREDMET UGOVORA
Klijent dobija pristup platformi KetuJemi.com prema 
izabranom paketu (Standard €30/mjesečno ili VIP €50/mjesečno).

2. TRAJANJE
Ugovor počinje od datuma potpisa i traje bez određenog roka.

3. OTKAZ
Klijent mora pisanim putem obavijestiti minimum 3 mjeseca 
prije željenog datuma prestanka.

4. PLAĆANJE
- Plaćanje se vrši mjesečno automatski
- IBAN je obavezan prije aktivacije

5. PROMJENA CIJENA
KetuJemi.com može promijeniti cijene uz obavještenje 
najmanje 3 mjeseca unaprijed.

6. NEPLAĆANJE
Podsjetnici emailom na 3, 7, 15 i 30 dana; 
nakon 30 dana suspenzija.

7. ODGOVORNOST
Klijent je odgovoran za tačnost objavljenih informacija.

8. PRIMJENJIVO PRAVO
Prema zakonodavstvu države u kojoj biznis posluje.

9. ELEKTRONSKI POTPIS
Klik na „Registruj se kao partner" smatra se važećim elektronskim potpisom.`,
  errRequired: "Popunite sva obavezna polja.",
  errTerms: "Morate prihvatiti uslove ugovora.",
  errLogoUnavailable: "Upload loga nije dostupan — unesite URL.",
  errUploadFailed: "Upload loga nije uspio.",
  errRegisterFailed: "Registracija nije uspjela.",
  errServer: "Veza sa serverom nije uspjela. Pokušajte ponovo.",
  errPaymentOpen: "Plaćanje se nije otvorilo.",
  successTitle: "Hvala!",
  successPending:
    "Zahtjev je poslan. Provjerite email za link plaćanja — nakon plaćanja se aktivirate automatski.",
  successPaid:
    "Plaćanje potvrđeno! Vaš Partner nalog je aktivan. Provjerite SMS/email za kod i prijavite se na /login.",
  successHome: "Nazad na početnu",
  landingCta: "Registruj se kao partner",
  landingCtaHint:
    "Prvo otvorite nalog (email ili telefon), zatim izaberite paket i popunite partnerski formular.",
  termsOpenHint: "Pročitajte potpune uslove (otvaraju se ispod)",
  successNoticeEmail:
    "Provjerite email — tamo su potvrda registracije i upute za vašu prodavnicu.",
  successNoticePayment:
    "Plaćanje paketa je online putem Stripe-a. Nakon plaćanja, Partner nalog se aktivira automatski.",
  successNoticeActivate:
    "Nakon aktivacije, prijavite se na /login sa poslovnim emailom za upravljanje oglasima.",
};

const EN: PartnerPageCopy = {
  docTitle: "Partner — KetuJemi.com",
  heroBadge: "Partner program",
  heroTitle: "Grow your business with KetuJemi.com",
  heroSubtitle: "50,000+ potential customers every month",
  benefitsTitle: "Your benefits",
  benefits: [
    { icon: "📈", title: "Maximum visibility", desc: "featured listings at the top" },
    { icon: "👥", title: "50,000+ active visitors", desc: "every month" },
    { icon: "🎯", title: "Category targeting", desc: "and location" },
    { icon: "📱", title: "Dedicated business panel", desc: "" },
    { icon: "⭐", title: '"Verified Partner" badge', desc: "" },
    { icon: "📊", title: "Detailed statistics", desc: "" },
    { icon: "🚀", title: "Priority in search results", desc: "" },
  ],
  packagesTitle: "Packages",
  standardTitle: "STANDARD PARTNER",
  standardPrice: "€30",
  periodPerMonth: "/month",
  standardFeatures: [
    "Custom shop on KetuJemi.com",
    "Up to 50 active listings",
    "Business logo with link on the homepage",
    '"Verified Partner" badge',
  ],
  vipTitle: "VIP PARTNER",
  vipPrice: "€50",
  vipFeatures: [
    "Everything in Standard +",
    "Up to 100 active listings",
    "Priority placement in search",
    "Visible VIP badge",
    "Advanced statistics",
    "Large business logo on the homepage",
  ],
  formTitle: "Register as a partner",
  formSubtitle: "Complete the form — automatic activation after payment.",
  labelBusinessName: "Business name",
  labelContactName: "Contact person",
  labelEmail: "Email",
  labelPhone: "Phone",
  labelPackage: "Package",
  packagePlaceholder: "Choose package",
  packageStandard: "Standard Partner €30",
  packageVip: "VIP Partner €50",
  labelLogo: "Logo URL or upload",
  logoUrlPlaceholder: "https://...",
  uploadLogo: "Upload",
  labelLink: "Your link (website, Instagram or Facebook — 1 link)",
  linkPlaceholder: "https://instagram.com/...",
  termsLabel: "I have read and accept the contract terms",
  submitButton: "Register as partner",
  contractTitle: "Full terms",
  contractText: `SERVICE AGREEMENT — KETUJEMI.COM

1. SUBJECT
The client receives access to KetuJemi.com according to the selected package (Standard €30/month or VIP €50/month).

2. TERM
The agreement starts on the signing date and continues without a fixed end date.

3. CANCELLATION
The client must give written notice at least 3 months before the desired termination date.

4. PAYMENT
- Payment is charged monthly by automatic billing
- IBAN is required before activation

5. PRICE CHANGES
KetuJemi.com may change prices with at least 3 months' notice.

6. NON-PAYMENT
Email reminders on days 3, 7, 15 and 30; suspension after 30 days.

7. LIABILITY
The client is responsible for the accuracy of published information.

8. GOVERNING LAW
According to the law of the country where the business operates.

9. ELECTRONIC SIGNATURE
Clicking "Register as partner" constitutes a valid electronic signature.`,
  errRequired: "Please fill in all required fields.",
  errTerms: "You must accept the contract terms.",
  errLogoUnavailable: "Logo upload is unavailable — enter a URL.",
  errUploadFailed: "Logo upload failed.",
  errRegisterFailed: "Registration failed.",
  errServer: "Could not reach the server. Please try again.",
  errPaymentOpen: "Payment window did not open.",
  successTitle: "Thank you!",
  successPending:
    "Your request was submitted. Check your email for the payment link — you will be activated automatically after payment.",
  successPaid:
    "Payment confirmed! Your Partner account is active. Check SMS/email for your code and sign in at /login.",
  successHome: "Back to home",
  landingCta: "Register as partner",
  landingCtaHint:
    "First create an account (email or phone), then choose a package and complete the partner form.",
  termsOpenHint: "Read the full terms (opens below)",
  successNoticeEmail:
    "Check your email for confirmation and instructions for your shop.",
  successNoticePayment:
    "Package payment is online via Stripe. After payment, the Partner account activates automatically.",
  successNoticeActivate:
    "After activation, sign in at /login with your business email to manage listings.",
};

const BY_LOCALE: Record<PartnerPageLocaleKey, PartnerPageCopy> = {
  ks: SQ,
  mk: MK,
  mne: MNE,
  en: EN,
};

type PartnerPageLocaleKey = UiTranslationLocale;

export function partnerPageForLocale(locale: PartnerPageLocaleKey): PartnerPageCopy {
  return BY_LOCALE[locale];
}

export function usePartnerPage(): PartnerPageCopy {
  const { uiLang } = useMarket();
  return partnerPageForLocale(translationKeyForUiLang(uiLang));
}
