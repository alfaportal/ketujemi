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
  uploadLogo: string;
  logoHint: string;
  labelDescription: string;
  descriptionPlaceholder: string;
  submitButton: string;
  errRequired: string;
  errLogoInvalid: string;
  errLogoTooLarge: string;
  errSubmitFailed: string;
  errServer: string;
  successTitle: string;
  successMessage: string;
  successHome: string;
  landingCta: string;
  landingCtaHint: string;
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
  formTitle: "FORMULARI I APLIKIMIT",
  formSubtitle: "Plotësoni të dhënat — ekipi ynë do t'ju kontaktojë pas shqyrtimit.",
  labelBusinessName: "Emri i Biznesit",
  labelContactName: "Emri i Kontaktit",
  labelEmail: "Email",
  labelPhone: "Telefon",
  labelPackage: "Paketa",
  packagePlaceholder: "Zgjidhni paketën",
  packageStandard: "Partner",
  packageVip: "VIP Partner",
  labelLogo: "Logo e biznesit",
  uploadLogo: "Ngarko logo",
  logoHint: "JPEG, PNG, WebP — max 5 MB (fakultativ)",
  labelDescription: "Përshkrim i shkurtër i biznesit",
  descriptionPlaceholder: "P.sh. çfarë shisni, ku operoni, pse dëshironi të bëheni partner...",
  submitButton: "Dërgo aplikimin",
  errRequired: "Plotësoni të gjitha fushat e detyrueshme.",
  errLogoInvalid: "Zgjidhni një skedar imazhi të vlefshëm.",
  errLogoTooLarge: "Logo duhet të jetë më pak se 5 MB.",
  errSubmitFailed: "Dërgimi i aplikimit dështoi.",
  errServer: "Lidhja me serverin dështoi. Provoni përsëri.",
  successTitle: "Faleminderit!",
  successMessage: "Kërkesa juaj u dërgua me sukses! Do t'ju kontaktojmë së shpejti.",
  successHome: "Kthehu në faqen kryesore",
  landingCta: "Apliko si Partner",
  landingCtaHint: "Plotësoni formularin më poshtë — pa pagesë online.",
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
  formTitle: "Формулар за апликација",
  formSubtitle: "Пополнете ги податоците — ќе ве контактираме по преглед.",
  labelBusinessName: "Име на бизнис",
  labelContactName: "Контакт лице",
  labelEmail: "Email",
  labelPhone: "Телефон",
  labelPackage: "Пакет",
  packagePlaceholder: "Изберете пакет",
  packageStandard: "Partner",
  packageVip: "VIP Partner",
  labelLogo: "Лого на бизнисот",
  uploadLogo: "Прикачи лого",
  logoHint: "JPEG, PNG, WebP — макс. 5 MB (опционално)",
  labelDescription: "Краток опис на бизнисот",
  descriptionPlaceholder: "На пр. што продавате, каде работите...",
  submitButton: "Испрати апликација",
  errRequired: "Пополнете ги сите задолжителни полиња.",
  errLogoInvalid: "Изберете валидна слика.",
  errLogoTooLarge: "Логото мора да биде помало од 5 MB.",
  errSubmitFailed: "Испраќањето на апликацијата не успеа.",
  errServer: "Врската со серверот не успеа. Обидете се повторно.",
  successTitle: "Ви благодариме!",
  successMessage: "Вашето барање е успешно испратено! Ќе ве контактираме наскоро.",
  successHome: "Назад на почетна",
  landingCta: "Аплицирај како партнер",
  landingCtaHint: "Пополнете го формуларот подолу — без онлајн плаќање.",
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
  formTitle: "Formular za prijavu",
  formSubtitle: "Popunite podatke — kontaktiraćemo vas nakon pregleda.",
  labelBusinessName: "Naziv biznisa",
  labelContactName: "Kontakt osoba",
  labelEmail: "Email",
  labelPhone: "Telefon",
  labelPackage: "Paket",
  packagePlaceholder: "Izaberite paket",
  packageStandard: "Partner",
  packageVip: "VIP Partner",
  labelLogo: "Logo biznisa",
  uploadLogo: "Upload loga",
  logoHint: "JPEG, PNG, WebP — max 5 MB (opciono)",
  labelDescription: "Kratak opis biznisa",
  descriptionPlaceholder: "Npr. šta prodajete, gdje poslujete...",
  submitButton: "Pošalji prijavu",
  errRequired: "Popunite sva obavezna polja.",
  errLogoInvalid: "Izaberite važeću sliku.",
  errLogoTooLarge: "Logo mora biti manji od 5 MB.",
  errSubmitFailed: "Slanje prijave nije uspjelo.",
  errServer: "Veza sa serverom nije uspjela. Pokušajte ponovo.",
  successTitle: "Hvala!",
  successMessage: "Vaš zahtjev je uspješno poslan! Kontaktiraćemo vas uskoro.",
  successHome: "Nazad na početnu",
  landingCta: "Prijavi se kao partner",
  landingCtaHint: "Popunite formular ispod — bez online plaćanja.",
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
  formTitle: "Application form",
  formSubtitle: "Fill in your details — our team will contact you after review.",
  labelBusinessName: "Business name",
  labelContactName: "Contact person",
  labelEmail: "Email",
  labelPhone: "Phone",
  labelPackage: "Package",
  packagePlaceholder: "Choose package",
  packageStandard: "Partner",
  packageVip: "VIP Partner",
  labelLogo: "Business logo",
  uploadLogo: "Upload logo",
  logoHint: "JPEG, PNG, WebP — max 5 MB (optional)",
  labelDescription: "Short business description",
  descriptionPlaceholder: "E.g. what you sell, where you operate, why you want to partner...",
  submitButton: "Submit application",
  errRequired: "Please fill in all required fields.",
  errLogoInvalid: "Please choose a valid image file.",
  errLogoTooLarge: "Logo must be smaller than 5 MB.",
  errSubmitFailed: "Application submission failed.",
  errServer: "Could not reach the server. Please try again.",
  successTitle: "Thank you!",
  successMessage: "Your request was sent successfully! We will contact you soon.",
  successHome: "Back to home",
  landingCta: "Apply as partner",
  landingCtaHint: "Complete the form below — no online payment.",
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
