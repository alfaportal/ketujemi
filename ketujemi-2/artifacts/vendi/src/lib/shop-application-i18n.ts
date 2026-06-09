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
  applyDocTitle: string;
  formImportant: string;
  defaultContactName: string;
  defaultContactPhone: string;
  defaultContactEmail: string;
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
  socialUrlHint: string;
  socialPhFacebook: string;
  socialPhInstagram: string;
  socialPhTiktok: string;
  socialPhWhatsapp: string;
  socialPhWebsite: string;
  section4Title: string;
  contactName: string;
  phone: string;
  email: string;
  submitBtn: string;
  successMsg: string;
  loginRequired: string;
  uploadingLogo: string;
  aiHelpBtn: string;
  aiBusinessTypePrompt: string;
  aiBusinessTypePlaceholder: string;
  aiGenerateBtn: string;
  aiGenerating: string;
  aiCancelBtn: string;
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
  applyDocTitle: "Apliko për dyqan — KetuJemi.com",
  formImportant:
    "⚠️ E rëndësishme: Dyqani aktivizohet vetëm pasi të shqyrtohet kërkesa juaj brenda 24 orëve. Të dhënat mund të ndryshohen më vonë nga profili juaj.",
  defaultContactName: "REVOLUTION INVEST SH.P.K.",
  defaultContactPhone: "+38343555294",
  defaultContactEmail: "info@ketujemi.com",
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
  address: "Adresa e saktë",
  section3Title: "Rrjetet sociale",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Plotësoni të paktën një rrjet social",
  socialUrlHint:
    "Fillimi i linkut (https://…) është gati — shkruani vetëm emrin e faqes suaj, p.sh. emri_dyqanit",
  socialPhFacebook: "emri_dyqanit",
  socialPhInstagram: "emri_dyqanit",
  socialPhTiktok: "emri_dyqanit",
  socialPhWhatsapp: "38344123456",
  socialPhWebsite: "www.dyqani-ime.com",
  section4Title: "Kontakti",
  contactName: "Emri i kontaktit",
  phone: "Nr. telefoni",
  email: "Email",
  submitBtn: "Dërgo Kërkesën për Dyqan →",
  successMsg: "✅ Kërkesa juaj u dërgua! Do të kontaktoheni brenda 24 orëve.",
  loginRequired: "Për të dërguar kërkesën, duhet të jeni i regjistruar dhe i kyçur në llogarinë tuaj.",
  uploadingLogo: "Duke ngarkuar logon...",
  aiHelpBtn: "✨ Ndihmë nga sistemi jonë",
  aiBusinessTypePrompt:
    "Çfarë lloj biznesi keni? (p.sh. dyqan rrobash, agjenci patundshmërie, servis makine...)",
  aiBusinessTypePlaceholder: "p.sh. dyqan rrobash",
  aiGenerateBtn: "Gjenero",
  aiGenerating: "Duke gjeneruar...",
  aiCancelBtn: "Anulo",
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
  applyDocTitle: "Аплицирај за продавница — KetuJemi.com",
  formImportant:
    "⚠️ Важно: Продавницата се активира откако ќе ја разгледаме вашата барање во рок од 24 часа. Податоците може подоцна да ги промените од профилот.",
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
  address: "Точна адреса",
  section3Title: "Социјални мрежи",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Пополнете барем една социјална мрежа",
  socialUrlHint:
    "Почетокот на линкот (https://…) е веќе тука — внесете само го името на профилот, на пр. ime_prodavnica",
  socialPhFacebook: "ime_prodavnica",
  socialPhInstagram: "ime_prodavnica",
  socialPhTiktok: "ime_prodavnica",
  socialPhWhatsapp: "38970123456",
  socialPhWebsite: "www.prodavnica.com",
  section4Title: "Контакт",
  contactName: "Име на контакт",
  phone: "Телефонски број",
  email: "Email",
  submitBtn: "Испрати барање за продавница →",
  successMsg: "✅ Вашето барање е испратено! Ќе бидете контактирани во рок од 24 часа.",
  loginRequired: "За да го испратите барањето, мора да сте регистрирани и најавени.",
  uploadingLogo: "Се прикачува логото...",
  aiHelpBtn: "✨ Помош од нашиот систем",
  aiBusinessTypePrompt:
    "Каков вид на бизнис имате? (на пр. продавница за облека, агенција за недвижности, сервис за автомобили...)",
  aiBusinessTypePlaceholder: "на пр. продавница за облека",
  aiGenerateBtn: "Генерирај",
  aiGenerating: "Се генерира...",
  aiCancelBtn: "Откажи",
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
  applyDocTitle: "Prijavi se za prodavnicu — KetuJemi.com",
  formImportant:
    "⚠️ Važno: Prodavnica se aktivira tek nakon što pregledamo vaš zahtjev u roku od 24 sata. Podatke možete kasnije promijeniti iz profila.",
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
  address: "Tačna adresa",
  section3Title: "Društvene mreže",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Popunite barem jednu društvenu mrežu",
  socialUrlHint:
    "Početak linka (https://…) je već tu — upišite samo ime profila, npr. ime_prodavnice",
  socialPhFacebook: "ime_prodavnice",
  socialPhInstagram: "ime_prodavnice",
  socialPhTiktok: "ime_prodavnice",
  socialPhWhatsapp: "38267123456",
  socialPhWebsite: "www.prodavnica.com",
  section4Title: "Kontakt",
  contactName: "Ime kontakta",
  phone: "Broj telefona",
  email: "Email",
  submitBtn: "Pošalji zahtjev za prodavnicu →",
  successMsg: "✅ Vaš zahtjev je poslan! Bićete kontaktirani u roku od 24 sata.",
  loginRequired: "Da biste poslali zahtjev, morate biti registrovani i prijavljeni.",
  uploadingLogo: "Otpremanje loga...",
  aiHelpBtn: "✨ Pomoć našeg sistema",
  aiBusinessTypePrompt:
    "Kakav tip poslovanja imate? (npr. prodavnica odjeće, agencija za nekretnine, servis automobila...)",
  aiBusinessTypePlaceholder: "npr. prodavnica odjeće",
  aiGenerateBtn: "Generiši",
  aiGenerating: "Generisanje...",
  aiCancelBtn: "Otkaži",
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
  applyDocTitle: "Apply for a shop — KetuJemi.com",
  formImportant:
    "⚠️ Important: Your shop is activated only after we review your request within 24 hours. You can update the details later from your profile.",
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
  address: "Full address",
  section3Title: "Social media",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Fill in at least one social network",
  socialUrlHint:
    "The link prefix (https://…) is already filled — type only your page name, e.g. your_shop_name",
  socialPhFacebook: "your_shop_name",
  socialPhInstagram: "your_shop_name",
  socialPhTiktok: "your_shop_name",
  socialPhWhatsapp: "38344123456",
  socialPhWebsite: "www.yourshop.com",
  section4Title: "Contact",
  contactName: "Contact name",
  phone: "Phone number",
  email: "Email",
  submitBtn: "Submit Shop Request →",
  successMsg: "✅ Your request was sent! We will contact you within 24 hours.",
  loginRequired: "You must be registered and signed in to submit a shop request.",
  uploadingLogo: "Uploading logo...",
  aiHelpBtn: "✨ Help from our system",
  aiBusinessTypePrompt:
    "What type of business do you have? (e.g. clothing shop, real estate agency, car service...)",
  aiBusinessTypePlaceholder: "e.g. clothing shop",
  aiGenerateBtn: "Generate",
  aiGenerating: "Generating...",
  aiCancelBtn: "Cancel",
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

const FR: OpenShopFormCopy = {
  ...EN,
  applyDocTitle: "Demander une boutique — KetuJemi.com",
  formImportant: "⚠️ Important: Your shop is activated only after we review your request within 24 hours. You can update the details later from your profile.",
  loginBtn: "Connexion / Inscription",
  section1Title: "Identité de la boutique",
  shopName: "Nonm de la boutique",
  logo: "Logo",
  description: "Description de l'activité",
  category: "Catégorie principale",
  section2Title: "Localisation",
  country: "Pays",
  city: "Ville",
  region: "Région/Quartier",
  address: "Adresse complète",
  section3Title: "Réseaux sociaux",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Renseignez au moins un réseau social",
  socialUrlHint: "The link prefix (https://…) is already filled — type only your page name, e.g. your_shop_name",
  socialPhFacebook: "your_shop_name",
  socialPhInstagram: "your_shop_name",
  socialPhTiktok: "your_shop_name",
  socialPhWhatsapp: "38344123456",
  socialPhWebsite: "www.yourshop.com",
  section4Title: "Contact",
  contactName: "Nonm du contact",
  phone: "Numéro de téléphone",
  email: "Email",
  submitBtn: "Envoyer la demande de boutique →",
  successMsg: "✅ Your request was sent! We will contact you within 24 hours.",
  loginRequired: "You must be registered and signed in to submit a shop request.",
  uploadingLogo: "Envoi du logo...",
  aiHelpBtn: "✨ Aide de notre système",
  aiBusinessTypePrompt: "What type of business do you have? (e.g. clothing shop, real estate agency, car service...)",
  aiBusinessTypePlaceholder: "e.g. clothing shop",
  aiGenerateBtn: "Générer",
  aiGenerating: "Génération...",
  aiCancelBtn: "Annuler",
  countryLabels: {
    XK: "Kosovo",
    AL: "Albanie",
    MK: "Macédoine du Nonrd",
    MNE: "Monténégro",
    DE: "Toutemagne",
    CH: "Suisse",
    AT: "Autriche",
    FR: "France",
    IT: "Italie",
    GB: "Royaume-Uni",
    US: "États-Unis",
  },
};

const SHOP_FORM_PAGES: Record<UiTranslationLocale, OpenShopFormCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function shopFormForLocale(locale: UiTranslationLocale): OpenShopFormCopy {
  return SHOP_FORM_PAGES[locale];
}

export function useShopFormCopy(): OpenShopFormCopy {
  const { uiLang } = useMarket();
  return shopFormForLocale(translationKeyForUiLang(uiLang));
}
