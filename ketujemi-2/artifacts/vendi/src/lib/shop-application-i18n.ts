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
  directoryCategory: string;
  directorySubcategory: string;
  directoryCategoryRequired: string;
  adminNotesLabel: string;
  adminNotesPlaceholder: string;
  section2Title: string;
  country: string;
  city: string;
  region: string;
  address: string;
  addressAutocompleteHint: string;
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
  section4Description: string;
  contactName: string;
  phone: string;
  email: string;
  emailRequired: string;
  emailPlaceholder: string;
  emailWhereHint: string;
  emailPlatformNotAllowed: string;
  submitBtn: string;
  successMsg: string;
  loginRequired: string;
  uploadingLogo: string;
  logoUploadFailed: string;
  submitError: string;
  submitNetworkError: string;
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
  defaultContactName: "",
  defaultContactPhone: "",
  defaultContactEmail: "info@ketujemi.com",
  loginBtn: "Kyçu / Regjistrohu",
  section1Title: "Identiteti i dyqanit",
  shopName: "Emri i dyqanit",
  logo: "Logo",
  description: "Përshkrimi i biznesit",
  category: "Kategoria kryesore",
  directoryCategory: "Kategoria e dyqanit",
  directorySubcategory: "Nënkategoria e dyqanit",
  directoryCategoryRequired: "Zgjidhni kategorinë dhe nënkategorinë e dyqanit.",
  adminNotesLabel: "Shënime të brendshme (admin)",
  adminNotesPlaceholder: "Shënime vetëm për ekipin e moderimit…",
  section2Title: "Lokacioni",
  country: "Shteti",
  city: "Qyteti",
  region: "Rajoni/Lagja",
  address: "Adresa e saktë",
  addressAutocompleteHint: "Filloni të shkruani adresën — zgjidhni nga sugjerimet e Google Maps",
  section3Title: "Rrjetet sociale",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Plotësoni të paktën një rrjet social",
  socialUrlHint: "Ngjisni linkun e plotë të faqes suaj (kopjoni direkt nga Facebook, Instagram, TikTok, WhatsApp ose faqja juaj).",
  socialPhFacebook: "",
  socialPhInstagram: "",
  socialPhTiktok: "",
  socialPhWhatsapp: "",
  socialPhWebsite: "",
  section4Title: "Kontakti juaj (aplikuesi)",
  section4Description:
    "Email dhe telefoni i personit që aplikon — na nevojiten për aprovim dhe për t'ju njoftuar për statusin e kërkesës.",
  contactName: "Emri i kontaktit",
  phone: "Nr. telefoni",
  email: "Email i aplikuesit",
  emailRequired: "Plotësoni email-in tuaj të vlefshëm.",
  emailPlaceholder: "info@ketujemi.com",
  emailWhereHint:
    "Kjo adresë ruhet te kërkesa juaj. Ju kontaktojmë këtu për aprovim (brenda 24 orëve) dhe merrni email kur dyqani aktivizohet ose refuzohet.",
  emailPlatformNotAllowed:
    "Shkruani email-in tuaj personal (Gmail, Outlook, etj.) — jo adresën e platformës KetuJemi.",
  submitBtn: "Dërgo Kërkesën për Dyqan →",
  successMsg: "✅ Kërkesa juaj u dërgua! Do të kontaktoheni brenda 24 orëve.",
  loginRequired: "Për të dërguar kërkesën, duhet të jeni i regjistruar dhe i kyçur në llogarinë tuaj.",
  uploadingLogo: "Duke ngarkuar logon...",
  logoUploadFailed: "Ngarkimi i logos dështoi.",
  submitError: "Gabim.",
  submitNetworkError: "Gabim gjatë dërgimit.",
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
  directoryCategory: "Категорија на продавницата",
  directorySubcategory: "Поткатегорија на продавницата",
  directoryCategoryRequired: "Изберете категорија и поткатегорија на продавницата.",
  adminNotesLabel: "Внатрешни белешки (админ)",
  adminNotesPlaceholder: "Белешки само за тимот за модерација…",
  section2Title: "Локација",
  country: "Држава",
  city: "Град",
  region: "Регион/Населба",
  address: "Точна адреса",
  addressAutocompleteHint: "Почнете да ја пишувате адресата — изберете од предлозите на Google Maps",
  section3Title: "Социјални мрежи",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Пополнете барем една социјална мрежа",
  socialUrlHint:
    "Залепете го целосниот линк (копирајте директно од Facebook, Instagram, TikTok, WhatsApp или вашата веб-страница).",
  socialPhFacebook: "",
  socialPhInstagram: "",
  socialPhTiktok: "",
  socialPhWhatsapp: "",
  socialPhWebsite: "",
  section4Title: "Ваш контакт (апликант)",
  section4Description:
    "Е-пошта и телефон на лицето што аплицира — ни требаат за одобрување и за да ве известиме за статусот.",
  contactName: "Име на контакт",
  phone: "Телефонски број",
  email: "Е-пошта на апликантот",
  emailRequired: "Внесете важечка е-пошта.",
  emailPlaceholder: "vashiot@email.com",
  emailWhereHint:
    "Оваа адреса се зачувува кај вашето барање. Контактираме ве тука за одобрување (во рок од 24 часа) и добивате е-пошта кога продавницата е активирана или одбиена.",
  emailPlatformNotAllowed:
    "Внесете лична е-пошта (Gmail, Outlook, итн.) — не адреса на платформата KetuJemi.",
  submitBtn: "Испрати барање за продавница →",
  successMsg: "✅ Вашето барање е испратено! Ќе бидете контактирани во рок од 24 часа.",
  loginRequired: "За да го испратите барањето, мора да сте регистрирани и најавени.",
  uploadingLogo: "Се прикачува логото...",
  logoUploadFailed: "Прикачувањето на логото не успеа.",
  submitError: "Грешка.",
  submitNetworkError: "Грешка при испраќање.",
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
  directoryCategory: "Kategorija prodavnice",
  directorySubcategory: "Potkategorija prodavnice",
  directoryCategoryRequired: "Odaberite kategoriju i potkategoriju prodavnice.",
  adminNotesLabel: "Interne bilješke (admin)",
  adminNotesPlaceholder: "Bilješke samo za moderatorski tim…",
  section2Title: "Lokacija",
  country: "Država",
  city: "Grad",
  region: "Region/Kvart",
  address: "Tačna adresa",
  addressAutocompleteHint: "Počnite da kucate adresu — izaberite iz Google Maps prijedloga",
  section3Title: "Društvene mreže",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Popunite barem jednu društvenu mrežu",
  socialUrlHint:
    "Zalijepite puni link (kopirajte direktno sa Facebooka, Instagrama, TikToka, WhatsAppa ili vašeg sajta).",
  socialPhFacebook: "",
  socialPhInstagram: "",
  socialPhTiktok: "",
  socialPhWhatsapp: "",
  socialPhWebsite: "",
  section4Title: "Vaš kontakt (podnosilac)",
  section4Description:
    "Email i telefon osobe koja aplicira — potrebni su nam za odobrenje i obavještenje o statusu zahtjeva.",
  contactName: "Ime kontakta",
  phone: "Broj telefona",
  email: "Email podnosioca",
  emailRequired: "Unesite važeći email.",
  emailPlaceholder: "vas@email.com",
  emailWhereHint:
    "Ova adresa se čuva uz vaš zahtjev. Kontaktiramo vas ovdje za odobrenje (u roku od 24 sata) i dobijate email kad je prodavnica aktivirana ili odbijena.",
  emailPlatformNotAllowed:
    "Unesite svoj lični email (Gmail, Outlook, itd.) — ne adresu platforme KetuJemi.",
  submitBtn: "Pošalji zahtjev za prodavnicu →",
  successMsg: "✅ Vaš zahtjev je poslan! Bićete kontaktirani u roku od 24 sata.",
  loginRequired: "Da biste poslali zahtjev, morate biti registrovani i prijavljeni.",
  uploadingLogo: "Otpremanje loga...",
  logoUploadFailed: "Otpremanje loga nije uspjelo.",
  submitError: "Greška.",
  submitNetworkError: "Greška pri slanju.",
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
  directoryCategory: "Shop category",
  directorySubcategory: "Shop subcategory",
  directoryCategoryRequired: "Select the shop category and subcategory.",
  adminNotesLabel: "Internal notes (admin)",
  adminNotesPlaceholder: "Notes for the moderation team only…",
  section2Title: "Location",
  country: "Country",
  city: "City",
  region: "Region/Neighbourhood",
  address: "Full address",
  addressAutocompleteHint: "Start typing your address — pick a suggestion from Google Maps",
  section3Title: "Social media",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Fill in at least one social network",
  socialUrlHint:
    "Paste your full link (copy directly from Facebook, Instagram, TikTok, WhatsApp, or your website).",
  socialPhFacebook: "",
  socialPhInstagram: "",
  socialPhTiktok: "",
  socialPhWhatsapp: "",
  socialPhWebsite: "",
  section4Title: "Your contact (applicant)",
  section4Description:
    "Email and phone of the person applying — we need these to approve your shop and notify you about the request status.",
  contactName: "Contact name",
  phone: "Phone number",
  email: "Applicant email",
  emailRequired: "Enter a valid email address.",
  emailPlaceholder: "you@email.com",
  emailWhereHint:
    "This address is stored with your request. We contact you here for approval (within 24 hours) and you receive email when your shop is activated or rejected.",
  emailPlatformNotAllowed:
    "Enter your personal email (Gmail, Outlook, etc.) — not a KetuJemi platform address.",
  submitBtn: "Submit Shop Request →",
  successMsg: "✅ Your request was sent! We will contact you within 24 hours.",
  loginRequired: "You must be registered and signed in to submit a shop request.",
  uploadingLogo: "Uploading logo...",
  logoUploadFailed: "Logo upload failed.",
  submitError: "Error.",
  submitNetworkError: "Error while submitting.",
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

const IT: OpenShopFormCopy = {
  ...KS,
  applyDocTitle: "Richiedi un negozio — KetuJemi.com",
  formImportant: "⚠️ Important: Your shop is activated only after we review your request within 24 hours. You can update the details later from your profile.",
  loginBtn: "Accedi / Registrati",
  section1Title: "Identità del negozio",
  shopName: "Nome del negozio",
  logo: "Logo",
  description: "Descrizione dell'attività",
  category: "Categoria principale",
  directoryCategory: "Categoria del negozio",
  directorySubcategory: "Sottocategoria del negozio",
  directoryCategoryRequired: "Seleziona la categoria e la sottocategoria del negozio.",
  adminNotesLabel: "Internal notes (admin)",
  adminNotesPlaceholder: "Notes for the moderation team only…",
  section2Title: "Posizione",
  country: "Paese",
  city: "Città",
  region: "Regione/Quartiere",
  address: "Indirizzo completo",
  addressAutocompleteHint: "Inizia a digitare l'indirizzo — scegli un suggerimento da Google Maps",
  section3Title: "Social media",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Compila almeno un social network",
  socialUrlHint: "Incolla il link completo (copia direttamente da Facebook, Instagram, TikTok, WhatsApp o il tuo sito).",
  socialPhFacebook: "",
  socialPhInstagram: "",
  socialPhTiktok: "",
  socialPhWhatsapp: "",
  socialPhWebsite: "",
  section4Title: "Contattaci",
  section4Description: "Per qualsiasi domanda sulla domanda, contattaci direttamente.",
  contactName: "Nome del contatto",
  phone: "Numero di telefono",
  email: "Email",
  submitBtn: "Invia richiesta negozio →",
  successMsg: "✅ Your request was sent! We will contact you within 24 hours.",
  loginRequired: "You must be registered and signed in to submit a shop request.",
  uploadingLogo: "Caricamento logo...",
  logoUploadFailed: "Logo upload failed.",
  submitError: "Error.",
  submitNetworkError: "Error while submitting.",
  aiHelpBtn: "✨ Aiuto dal nostro sistema",
  aiBusinessTypePrompt: "What type of business do you have? (e.g. clothing shop, real estate agency, car service...)",
  aiBusinessTypePlaceholder: "e.g. clothing shop",
  aiGenerateBtn: "Genera",
  aiGenerating: "Generazione...",
  aiCancelBtn: "Annulla",
  countryLabels: {
    XK: "Kosovo",
    AL: "Albania",
    MK: "Macedonia del Nord",
    MNE: "Montenegro",
    DE: "Germania",
    CH: "Svizzera",
    AT: "Austria",
    FR: "Francia",
    IT: "Italia",
    GB: "Regno Unito",
    US: "USA",
  },
};

const DE: OpenShopFormCopy = {
  ...KS,
  applyDocTitle: "Shop beantragen — KetuJemi.com",
  formImportant: "⚠️ Important: Your shop is activated only after we review your request within 24 hours. You can update the details later from your profile.",
  loginBtn: "Anmelden / Registrieren",
  section1Title: "Shop-Identität",
  shopName: "Shop-Name",
  logo: "Logo",
  description: "Geschäftsbeschreibung",
  category: "Hauptkategorie",
  directoryCategory: "Shop-Kategorie",
  directorySubcategory: "Shop-Unterkategorie",
  directoryCategoryRequired: "Wählen Sie Shop-Kategorie und Unterkategorie.",
  adminNotesLabel: "Internal notes (admin)",
  adminNotesPlaceholder: "Notes for the moderation team only…",
  section2Title: "Standort",
  country: "Land",
  city: "Stadt",
  region: "Region/Stadtteil",
  address: "Vollständige Adresse",
  addressAutocompleteHint: "Adresse eingeben — Vorschlag aus Google Maps auswählen",
  section3Title: "Soziale Medien",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Mindestens ein soziales Netzwerk angeben",
  socialUrlHint:
    "Fügen Sie den vollständigen Link ein (kopieren Sie direkt von Facebook, Instagram, TikTok, WhatsApp oder Ihrer Website).",
  socialPhFacebook: "",
  socialPhInstagram: "",
  socialPhTiktok: "",
  socialPhWhatsapp: "",
  socialPhWebsite: "",
  section4Title: "Kontaktieren Sie uns",
  section4Description: "Bei Fragen zu Ihrer Bewerbung kontaktieren Sie uns bitte direkt.",
  contactName: "Kontaktname",
  phone: "Telefonnummer",
  email: "Email",
  submitBtn: "Shop-Anfrage senden →",
  successMsg: "✅ Your request was sent! We will contact you within 24 hours.",
  loginRequired: "You must be registered and signed in to submit a shop request.",
  uploadingLogo: "Logo wird hochgeladen...",
  logoUploadFailed: "Logo upload failed.",
  submitError: "Error.",
  submitNetworkError: "Error while submitting.",
  aiHelpBtn: "✨ Hilfe von unserem System",
  aiBusinessTypePrompt: "What type of business do you have? (e.g. clothing shop, real estate agency, car service...)",
  aiBusinessTypePlaceholder: "e.g. clothing shop",
  aiGenerateBtn: "Generieren",
  aiGenerating: "Wird generiert...",
  aiCancelBtn: "Abbrechen",
  countryLabels: {
    XK: "Kosovo",
    AL: "Albanien",
    MK: "Nordmazedonien",
    MNE: "Montenegro",
    DE: "Deutschland",
    CH: "Schweiz",
    AT: "Österreich",
    FR: "Frankreich",
    IT: "Italien",
    GB: "Vereinigtes Königreich",
    US: "USA",
  },
};

const FR: OpenShopFormCopy = {
  ...KS,
  applyDocTitle: "Demander une boutique — KetuJemi.com",
  formImportant: "⚠️ Important: Your shop is activated only after we review your request within 24 hours. You can update the details later from your profile.",
  loginBtn: "Connexion / Inscription",
  section1Title: "Identité de la boutique",
  shopName: "Nom de la boutique",
  logo: "Logo",
  description: "Description de l'activité",
  category: "Catégorie principale",
  directoryCategory: "Catégorie de la boutique",
  directorySubcategory: "Sous-catégorie de la boutique",
  directoryCategoryRequired: "Choisissez la catégorie et la sous-catégorie de la boutique.",
  adminNotesLabel: "Notes internes (admin)",
  adminNotesPlaceholder: "Notes réservées à l'équipe de modération…",
  section2Title: "Localisation",
  country: "Pays",
  city: "Ville",
  region: "Région/Quartier",
  address: "Adresse complète",
  addressAutocompleteHint: "Commencez à saisir l'adresse — choisissez une suggestion Google Maps",
  section3Title: "Réseaux sociaux",
  facebook: "Facebook URL",
  instagram: "Instagram URL",
  tiktok: "TikTok URL",
  whatsapp: "WhatsApp",
  website: "Website URL",
  socialRequired: "Renseignez au moins un réseau social",
  socialUrlHint:
    "Collez le lien complet (copiez directement depuis Facebook, Instagram, TikTok, WhatsApp ou votre site).",
  socialPhFacebook: "",
  socialPhInstagram: "",
  socialPhTiktok: "",
  socialPhWhatsapp: "",
  socialPhWebsite: "",
  section4Title: "Contactez-nous",
  section4Description: "Pour toute question concernant votre candidature, contactez-nous directement.",
  contactName: "Nom du contact",
  phone: "Numéro de téléphone",
  email: "Email",
  submitBtn: "Envoyer la demande de boutique →",
  successMsg: "✅ Your request was sent! We will contact you within 24 hours.",
  loginRequired: "You must be registered and signed in to submit a shop request.",
  uploadingLogo: "Envoi du logo...",
  logoUploadFailed: "Échec du téléversement du logo.",
  submitError: "Erreur.",
  submitNetworkError: "Erreur lors de l'envoi.",
  aiHelpBtn: "✨ Aide de notre système",
  aiBusinessTypePrompt: "What type of business do you have? (e.g. clothing shop, real estate agency, car service...)",
  aiBusinessTypePlaceholder: "e.g. clothing shop",
  aiGenerateBtn: "Générer",
  aiGenerating: "Génération...",
  aiCancelBtn: "Annuler",
  countryLabels: {
    XK: "Kosovo",
    AL: "Albanie",
    MK: "Macédoine du Nord",
    MNE: "Monténégro",
    DE: "Allemagne",
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
  it: IT,
  de: DE,
};

export function shopFormForLocale(locale: UiTranslationLocale): OpenShopFormCopy {
  return SHOP_FORM_PAGES[locale];
}

export function useShopFormCopy(): OpenShopFormCopy {
  const { uiLang } = useMarket();
  return shopFormForLocale(translationKeyForUiLang(uiLang));
}
