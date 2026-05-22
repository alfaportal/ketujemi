import type { AppExtraMarketCode } from "@/lib/app-extra-i18n";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";

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
  labelIban: string;
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
};

const SQ: PartnerPageCopy = {
  docTitle: "Partner — KetuJemi.com",
  heroBadge: "Programi Partner",
  heroTitle: "Rrit Biznesin Tënd me KetuJemi.com",
  heroSubtitle: "Mbi 50,000 klientë të mundshëm çdo muaj",
  benefitsTitle: "Përfitimet tuaja",
  benefits: [
    { icon: "📈", title: "Dukshmëri maksimale", desc: "shpallje të featured në krye" },
    { icon: "👥", title: "50,000+ vizitorë aktivë", desc: "çdo muaj" },
    { icon: "🎯", title: "Targetim sipas kategorisë", desc: "dhe lokacionit" },
    { icon: "📱", title: "Panel i dedikuar biznesi", desc: "" },
    { icon: "⭐", title: 'Badge "Partner i Verifikuar"', desc: "" },
    { icon: "📊", title: "Statistika të detajuara", desc: "" },
    { icon: "🚀", title: "Prioritet në rezultatet e kërkimit", desc: "" },
  ],
  packagesTitle: "Paketat",
  standardTitle: "PARTNER STANDARD",
  standardPrice: "€30",
  periodPerMonth: "/muaj",
  standardFeatures: [
    "Dyqan i personalizuar në KetuJemi.com",
    "Deri 100 njoftime aktive",
    "Logo e biznesit me link në faqen kryesore",
    'Badge "Partner i Verifikuar"',
  ],
  vipTitle: "VIP PARTNER",
  vipPrice: "€50",
  vipFeatures: [
    "Gjithçka e Standard +",
    "Deri 200 njoftime aktive",
    "Pozicion prioritar në kërkim (del i pari)",
    "Badge VIP i dukshëm",
    "Statistika të avancuara",
    "Logo e madhe e biznesit me link në faqen kryesore",
  ],
  formTitle: "Regjistrohu si Partner",
  formSubtitle: "Plotësoni formularin — aktivizimi automatik pas pagesës.",
  labelBusinessName: "Emri i Biznesit",
  labelContactName: "Emri i Kontaktit",
  labelEmail: "Email",
  labelPhone: "Telefon",
  labelIban: "IBAN",
  labelPackage: "Paketa",
  packagePlaceholder: "Zgjidhni paketën",
  packageStandard: "Partner Standard €30",
  packageVip: "VIP Partner €50",
  labelLogo: "Logo URL ose upload logo",
  logoUrlPlaceholder: "https://...",
  uploadLogo: "Ngarko",
  labelLink: "Linku juaj (website, Instagram ose Facebook — 1 link)",
  linkPlaceholder: "https://instagram.com/...",
  termsLabel: "Kam lexuar dhe pranoj kushtet e kontratës",
  submitButton: "Regjistrohu si Partner",
  contractTitle: "Kushtet e Plota",
  contractText: `KONTRATË SHËRBIMI — KETUJEMI.COM

1. OBJEKTI I KONTRATËS
Klienti merr akses në platformën KetuJemi.com sipas 
paketës së zgjedhur (Standard €30/muaj ose VIP €50/muaj).
Platforma ofron hapësirë reklamuese dixhitale, 
dukshmëri ndaj konsumatorëve aktivë dhe mjete 
profesionale për menaxhimin e shpalljeve.

2. KOHËZGJATJA
Kontrata fillon nga data e nënshkrimit dhe vazhdon 
pa afat të caktuar. Palët mund ta zgjasin ose 
ndryshojnë me marrëveshje të ndërsjellë me shkrim.

3. KUSHTET E ANULIMIT
Klienti është i detyruar të njoftojë me shkrim 
minimum 3 muaj para datës së dëshiruar të përfundimit.
Gjatë kësaj periudhe pagesa vazhdon normalisht.

4. PAGESA
- Pagesa bëhet çdo muaj automatikisht
- IBAN-i është i detyrueshëm para aktivizimit
- Pagesa e parë bëhet në ditën e nënshkrimit

5. NDRYSHIMI I ÇMIMEVE
KetuJemi.com ka të drejtë të ndryshojë çmimet me 
njoftim minimum 3 muaj paraprak me email.
Klienti ka të drejtë të anulojë brenda 30 ditëve 
nga njoftimi pa penalitet.

6. MOS PAGESA — PROCEDURA
Paralajmërimi 1: Email pas 3 ditësh vonesë
Paralajmërimi 2: Email pas 7 ditësh
Paralajmërimi 3: Email pas 15 ditësh + pezullim i përkohshëm
Paralajmërimi 4: Email pas 30 ditësh + kalimi te 
organi kompetent sipas legjislacionit në fuqi

7. PËRGJEGJËSIA E KLIENTIT
Klienti është përgjegjës për saktësinë e informacionit 
të publikuar. KetuJemi.com rezervon të drejtën të heqë 
çdo përmbajtje që shkel rregullat e platformës.

8. LIGJI I ZBATUESHËM
Kontrata rregullohet sipas legjislacionit të vendit 
ku biznesi është i regjistruar dhe vepron.

9. NËNSHKRIMI ELEKTRONIK
Klikimi i butonit "Regjistrohu si Partner" konsiderohet 
nënshkrim i vlefshëm elektronik dhe regjistrohet 
me datë, orë dhe IP adresë.`,
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
    "До 100 активни огласи",
    "Лого со линк на почетната страница",
    'Значка „Верификуван партнер"',
  ],
  vipTitle: "VIP ПАРТНЕР",
  vipPrice: "€50",
  vipFeatures: [
    "Сè од Standard +",
    "До 200 активни огласи",
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
  labelIban: "IBAN",
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
    "Do 100 aktivnih oglasa",
    "Logo sa linkom na početnoj stranici",
    'Bedž „Verifikovani partner"',
  ],
  vipTitle: "VIP PARTNER",
  vipPrice: "€50",
  vipFeatures: [
    "Sve iz Standard +",
    "Do 200 aktivnih oglasa",
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
  labelIban: "IBAN",
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
};

const BY_LOCALE: Record<PartnerPageLocaleKey, PartnerPageCopy> = {
  ks: SQ,
  mk: MK,
  mne: MNE,
};

type PartnerPageLocaleKey = Extract<AppExtraMarketCode, "ks" | "mk" | "mne">;

export function partnerPageForLocale(locale: PartnerPageLocaleKey): PartnerPageCopy {
  return BY_LOCALE[locale];
}

export function usePartnerPage(): PartnerPageCopy {
  const { uiLang } = useMarket();
  return partnerPageForLocale(translationKeyForUiLang(uiLang));
}
