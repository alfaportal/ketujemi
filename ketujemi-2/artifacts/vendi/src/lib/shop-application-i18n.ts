import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export const SHOP_COUNTRY_CODES = [
  "XK",
  "AL",
  "MK",
  "MNE",
  "DE",
  "CH",
  "AT",
  "FR",
  "IT",
  "GB",
  "US",
] as const;

export type ShopCountryCode = (typeof SHOP_COUNTRY_CODES)[number];

export type DiasporaCountryCode = Extract<ShopCountryCode, "DE" | "CH" | "AT" | "FR" | "IT" | "GB" | "US">;

export type OpenShopFormCopy = {
  formTitle: string;
  formIntro: string;
  formImportant: string;
  formBenefits: string[];
  formBenefitsTitle: string;
  loginBtn: string;
  section1Title: string;
  shopName: string;
  logo: string;
  description: string;
  category: string;
  section2Title: string;
  country: string;
  city: string;
  region: string;
  address: string;
  section3Title: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  website: string;
  socialRequired: string;
  section4Title: string;
  contactName: string;
  phone: string;
  email: string;
  submitBtn: string;
  successMsg: string;
  loginRequired: string;
  uploadingLogo: string;
  countryLabels: Record<ShopCountryCode, string>;
  diasporaCities: Record<DiasporaCountryCode, string[]>;
};

const DIASPORA_CITIES: Record<DiasporaCountryCode, string[]> = {
  DE: [
    "Berlin",
    "München",
    "Hamburg",
    "Köln",
    "Frankfurt",
    "Stuttgart",
    "Düsseldorf",
    "Dortmund",
    "Leipzig",
    "Bremen",
  ],
  CH: [
    "Zürich",
    "Genève",
    "Basel",
    "Bern",
    "Lausanne",
    "Luzern",
    "St. Gallen",
    "Winterthur",
    "Lugano",
  ],
  AT: [
    "Wien",
    "Graz",
    "Linz",
    "Salzburg",
    "Innsbruck",
    "Klagenfurt",
    "Villach",
    "Wels",
  ],
  FR: [
    "Paris",
    "Lyon",
    "Marseille",
    "Toulouse",
    "Nice",
    "Nantes",
    "Strasbourg",
    "Montpellier",
    "Bordeaux",
  ],
  IT: [
    "Roma",
    "Milano",
    "Torino",
    "Bologna",
    "Firenze",
    "Napoli",
    "Verona",
    "Genova",
    "Palermo",
  ],
  GB: [
    "London",
    "Manchester",
    "Birmingham",
    "Leeds",
    "Glasgow",
    "Liverpool",
    "Bristol",
    "Sheffield",
    "Edinburgh",
  ],
  US: [
    "New York",
    "Chicago",
    "Los Angeles",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "Dallas",
    "San Diego",
    "San Francisco",
  ],
};

const KS: OpenShopFormCopy = {
  formTitle: "🏪 Hap Dyqanin Tënd Dixhital — Falas",
  formIntro:
    "Për të krijuar dyqanin tënd në KetuJemi, duhet të plotësosh të gjitha fushat më poshtë. Këto të dhëna shfaqen publikisht dhe i ndihmojnë blerësit të të gjejnë lehtë.",
  formImportant:
    "⚠️ E rëndësishme: Dyqani aktivizohet vetëm pasi të shqyrtohet kërkesa juaj brenda 24 orëve. Të dhënat mund të ndryshohen më vonë nga profili juaj.",
  formBenefits: [
    "Faqe e dedikuar e dyqanit tuaj në KetuJemi",
    "Logo dhe identitet i plotë dixhital",
    "Shpallje të pakufizuara falas",
    "Klientë nga e gjithë rajoni — Kosovë, Shqipëri, Maqedoni dhe Diaspora",
    "Gjendeni lehtë në kërkim — sipas qytetit, rajonit dhe kategorisë",
  ],
  formBenefitsTitle: "Çfarë fitoni:",
  loginBtn: "Kyçu / Regjistrohu",
  section1Title: "Identiteti i dyqanit",
  shopName: "Emri i dyqanit",
  logo: "Logo",
  description: "Përshkrimi i biznesit",
  category: "Kategoria kryesore",
  section2Title: "Lokacioni",
  country: "Shteti",
  city: "Qyteti",
  region: "Rajoni/Lagja",
  address: "Adresa e saktë — rruga dhe numri",
  section3Title: "Rrjetet sociale",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Plotësoni të paktën një rrjet social",
  section4Title: "Kontakti",
  contactName: "Emri i kontaktit",
  phone: "Nr. telefoni",
  email: "Email",
  submitBtn: "Dërgo Kërkesën për Dyqan →",
  successMsg: "✅ Kërkesa juaj u dërgua! Do të kontaktoheni brenda 24 orëve.",
  loginRequired: "Për të dërguar kërkesën, duhet të jeni i regjistruar dhe i kyçur në llogarinë tuaj.",
  uploadingLogo: "Duke ngarkuar logon...",
  countryLabels: {
    XK: "Kosovë",
    AL: "Shqipëri",
    MK: "Maqedoni e Veriut",
    MNE: "Mal i Zi",
    DE: "Gjermani",
    CH: "Zvicër",
    AT: "Austri",
    FR: "Francë",
    IT: "Itali",
    GB: "Mbretëria e Bashkuar",
    US: "SHBA",
  },
  diasporaCities: DIASPORA_CITIES,
};

const MK: OpenShopFormCopy = {
  ...KS,
  formTitle: "🏪 Отвори ја твојата дигитална продавница — бесплатно",
  formIntro:
    "За да ја создадете продавницата на KetuJemi, пополнете ги сите полиња подолу. Овие податоци се јавно видливи и им помагаат на купувачите лесно да ве најдат.",
  formImportant:
    "⚠️ Важно: Продавницата се активира откако ќе ја разгледаме вашата барање во рок од 24 часа. Податоците може подоцна да ги промените од профилот.",
  formBenefits: [
    "Посветена страница на вашата продавница на KetuJemi",
    "Лого и целосен дигитален идентитет",
    "Неограничени бесплатни огласи",
    "Клиенти од целиот регион — Косово, Албанија, Македонија и дијаспора",
    "Лесно пронајдливи во пребарување — по град, регион и категорија",
  ],
  formBenefitsTitle: "Што добивате:",
  loginBtn: "Најави се / Регистрирај се",
  section1Title: "Идентитет на продавницата",
  shopName: "Име на продавницата",
  logo: "Лого",
  description: "Опис на бизнисот",
  category: "Главна категорија",
  section2Title: "Локација",
  country: "Држава",
  city: "Град",
  region: "Регион/Населба",
  address: "Точна адреса — улица и број",
  section3Title: "Социјални мрежи",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Пополнете барем една социјална мрежа",
  section4Title: "Контакт",
  contactName: "Име на контакт",
  phone: "Телефонски број",
  email: "Email",
  submitBtn: "Испрати барање за продавница →",
  successMsg: "✅ Вашето барање е испратено! Ќе бидете контактирани во рок од 24 часа.",
  loginRequired: "За да го испратите барањето, мора да сте регистрирани и најавени.",
  uploadingLogo: "Се прикачува логото...",
  countryLabels: {
    XK: "Косово",
    AL: "Албанија",
    MK: "Северна Македонија",
    MNE: "Црна Гора",
    DE: "Германија",
    CH: "Швајцарија",
    AT: "Австрија",
    FR: "Франција",
    IT: "Италија",
    GB: "Обединето Кралство",
    US: "САД",
  },
};

const MNE: OpenShopFormCopy = {
  ...KS,
  formTitle: "🏪 Otvori svoju digitalnu prodavnicu — besplatno",
  formIntro:
    "Da biste kreirali prodavnicu na KetuJemi, popunite sva polja ispod. Ovi podaci su javno vidljivi i pomažu kupcima da vas lako pronađu.",
  formImportant:
    "⚠️ Važno: Prodavnica se aktivira tek nakon što pregledamo vaš zahtjev u roku od 24 sata. Podatke možete kasnije promijeniti iz profila.",
  formBenefits: [
    "Posvećena stranica vaše prodavnice na KetuJemi",
    "Logo i kompletan digitalni identitet",
    "Neograničeni besplatni oglasi",
    "Kupci iz cijelog regiona — Kosovo, Albanija, Makedonija i dijaspora",
    "Lako pronađeni u pretrazi — po gradu, regionu i kategoriji",
  ],
  formBenefitsTitle: "Šta dobijate:",
  loginBtn: "Prijavi se / Registruj se",
  section1Title: "Identitet prodavnice",
  shopName: "Naziv prodavnice",
  logo: "Logo",
  description: "Opis poslovanja",
  category: "Glavna kategorija",
  section2Title: "Lokacija",
  country: "Država",
  city: "Grad",
  region: "Region/Kvart",
  address: "Tačna adresa — ulica i broj",
  section3Title: "Društvene mreže",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Popunite barem jednu društvenu mrežu",
  section4Title: "Kontakt",
  contactName: "Ime kontakta",
  phone: "Broj telefona",
  email: "Email",
  submitBtn: "Pošalji zahtjev za prodavnicu →",
  successMsg: "✅ Vaš zahtjev je poslan! Bićete kontaktirani u roku od 24 sata.",
  loginRequired: "Da biste poslali zahtjev, morate biti registrovani i prijavljeni.",
  uploadingLogo: "Otpremanje loga...",
  countryLabels: {
    XK: "Kosovo",
    AL: "Albanija",
    MK: "Sjeverna Makedonija",
    MNE: "Crna Gora",
    DE: "Njemačka",
    CH: "Švicarska",
    AT: "Austrija",
    FR: "Francuska",
    IT: "Italija",
    GB: "Ujedinjeno Kraljevstvo",
    US: "SAD",
  },
};

const EN: OpenShopFormCopy = {
  ...KS,
  formTitle: "🏪 Open Your Digital Shop — Free",
  formIntro:
    "To create your shop on KetuJemi, fill in all the fields below. This information is shown publicly and helps buyers find you easily.",
  formImportant:
    "⚠️ Important: Your shop is activated only after we review your request within 24 hours. You can update the details later from your profile.",
  formBenefits: [
    "A dedicated shop page on KetuJemi",
    "Logo and full digital identity",
    "Unlimited free listings",
    "Customers across the region — Kosovo, Albania, North Macedonia and the diaspora",
    "Easy to find in search — by city, region and category",
  ],
  formBenefitsTitle: "What you get:",
  loginBtn: "Sign in / Register",
  section1Title: "Shop identity",
  shopName: "Shop name",
  logo: "Logo",
  description: "Business description",
  category: "Main category",
  section2Title: "Location",
  country: "Country",
  city: "City",
  region: "Region/Neighbourhood",
  address: "Full address — street and number",
  section3Title: "Social media",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Fill in at least one social network",
  section4Title: "Contact",
  contactName: "Contact name",
  phone: "Phone number",
  email: "Email",
  submitBtn: "Submit Shop Request →",
  successMsg: "✅ Your request was sent! We will contact you within 24 hours.",
  loginRequired: "You must be registered and signed in to submit a shop request.",
  uploadingLogo: "Uploading logo...",
  countryLabels: {
    XK: "Kosovo",
    AL: "Albania",
    MK: "North Macedonia",
    MNE: "Montenegro",
    DE: "Germany",
    CH: "Switzerland",
    AT: "Austria",
    FR: "France",
    IT: "Italy",
    GB: "United Kingdom",
    US: "USA",
  },
};

const SHOP_FORM_PAGES: Record<UiTranslationLocale, OpenShopFormCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
};

export function shopFormForLocale(locale: UiTranslationLocale): OpenShopFormCopy {
  return SHOP_FORM_PAGES[locale];
}

export function useShopFormCopy(): OpenShopFormCopy {
  const { uiLang } = useMarket();
  return shopFormForLocale(translationKeyForUiLang(uiLang));
}
