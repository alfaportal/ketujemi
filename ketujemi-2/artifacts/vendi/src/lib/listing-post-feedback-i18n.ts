import type { UiTranslationLocale } from "@/lib/ui-languages";

export type ListingPostApiBody = {
  error?: string;
  message?: string;
  moderation_reason?: string;
  reason?: string;
  details?: Array<{ path?: (string | number)[]; message?: string }>;
  show_packages?: boolean;
  used?: number;
  limit?: number;
  wallet_balance_cents?: number;
  balance_cents?: number;
  root_category_name?: string | null;
  quota_resets_at?: string;
};

type ListingPostFeedbackCopy = {
  fieldLabels: Record<string, string>;
  errorDefaults: Record<string, string>;
  badRequestFallback: string;
  rateLimitFallback: string;
};

const FIELD_LABELS_KS: Record<string, string> = {
  parent_category_id: "Kategoria kryesore",
  category_id: "Nënkategoria",
  brand_category_id: "Marka",
  title: "Titulli",
  description: "Përshkrimi",
  price: "Çmimi",
  location: "Qyteti",
  seller_phone: "Telefoni",
  seller_name: "Emri",
  image_url: "Foto",
  condition: "Gjendja",
};

const ERROR_DEFAULTS_KS: Record<string, string> = {
  "Authentication required":
    "Duhet të jeni i kyçur për të postuar. Hyni në llogari dhe provoni përsëri.",
  "Account suspended": "Llogaria juaj është pezulluar. Kontaktoni mbështetjen.",
  "Invalid request body": "Të dhënat e formularit nuk janë të vlefshme.",
  DUPLICATE_LISTING: "Ky njoftim ekziston tashmë. Nuk mund të postoni të njëjtën gjë dy herë.",
  DUPLICATE_LISTING_SELF:
    "Nuk mund të postoni të njëjtin send dy herë brenda 1 muaji. Keni tashmë një shpallje të ngjashme aktive — përdorni Edito ose prisni 1 muaj.",
  BLACKLIST_WORD: "Përmbajtja përmban fjalë të ndaluara. Ndryshoni titullin ose përshkrimin.",
  CLIENT_BLOCKED_WORD: 'Përmbajtja përmban fjalë të ndaluara: "{word}".',
  PHONE_IN_DESCRIPTION:
    "Numri i telefonit nuk lejohet në përshkrim. Vendoseni vetëm në fushën e telefonit.",
  EXTERNAL_LINK_IN_DESCRIPTION: "Linqet e jashtme nuk lejohen në përshkrim.",
  LISTING_POST_COOLDOWN: "Ki pak durim — prisni 30 sekonda për postimin tjetër.",
  LISTING_POST_IP_COOLDOWN: "Shumë postime nga i njëjti rrjet. Prisni pak dhe provoni përsëri.",
  LISTING_MODERATION_REJECTED:
    "Njoftimi nuk u miratua. Kontrolloni titullin, përshkrimin dhe çmimin.",
  FREE_QUOTA_EXCEEDED:
    "Postimet falas këtë muaj për këtë kategori janë shpenzuar. Vazhdoni me €0.30/postim nga portofoli (Profili) ose prisni muajin e ri.",
  LISTING_MONTHLY_CAP:
    "Ke arritur limitin e njoftimeve aktive. Fshini një njoftim të vjetër ose blini paketë shtesë.",
  WALLET_INSUFFICIENT: "Balanca në portofol nuk mjafton. Mbushni portofolin nga profili.",
  BUSINESS_QUOTA_EXCEEDED: "Keni arritur limitin falas të biznesit. Mbushni portofolin (€0.30/shpallje).",
  BUSINESS_MONTHLY_CAP: "Keni arritur limitin mujor të njoftimeve aktive për llogarinë e biznesit.",
  BUSINESS_PENDING_ACTIVATION: "Llogaria e biznesit nuk është aktivizuar ende.",
  BUSINESS_NOT_ACTIVE: "Llogaria e biznesit nuk është aktive.",
  BUSINESS_PRICE_REQUIRED: "Vendosni çmimin e produktit.",
  BUSINESS_NO_CONTACT_PRICE: "Mos vendosni kontakt në vend të çmimit.",
  BUSINESS_GENERIC_AD: "Përshkrimi duket shumë i përgjithshëm — specifikoni produktin.",
  BUSINESS_STOCK_PHOTO: "Fotoja duket si stok — përdorni foto të produktit tuaj.",
  BUSINESS_TITLE_TOO_SHORT: "Titulli i biznesit është shumë i shkurtër.",
  DHURATA_PRICE_ZERO: "Dhurata falas duhet çmim 0 €.",
  DHURATA_PHOTO_REQUIRED: "Dhurata falas kërkon të paktën një foto.",
  DHURATA_PHOTO_LIMIT: "Dhurata falas lejon vetëm numrin e lejuar të fotove.",
  DHURATA_SELLING_LANGUAGE: "Përshkrimi i dhuratës duhet në gjuhën e duhur.",
  DHURATA_PHOTO_MISMATCH: "Fotot nuk përputhen me rregullat e dhuratës falas.",
  KERKOJ_PHOTO_REQUIRED: "Kërkesa kërkon të paktën një foto.",
  KERKOJ_PHOTO_LIMIT: "Kërkesa lejon vetëm numrin e lejuar të fotove.",
  KERKOJ_SELLING_LANGUAGE: "Përshkrimi i kërkesës duhet në gjuhën e duhur.",
  KERKOJ_ONE_ACTIVE: "Keni tashmë një kërkesë aktive në këtë kategori.",
  KERKOJ_PHOTO_MISMATCH: "Fotot nuk përputhen me rregullat e kërkesës.",
  RATE_LIMIT_POST_LISTING:
    "Shumë përpjekje për të postuar. Prisni pak (maks. 5 postime në orë) dhe provoni përsëri.",
  "Too many requests": "Shumë kërkesa në të njëjtën kohë. Prisni 1–2 minuta dhe provoni përsëri.",
};

const FIELD_LABELS_MK: Record<string, string> = {
  parent_category_id: "Главна категорија",
  category_id: "Подкategoriја",
  brand_category_id: "Марка",
  title: "Наслов",
  description: "Опис",
  price: "Цена",
  location: "Град",
  seller_phone: "Телефон",
  seller_name: "Име",
  image_url: "Фотографија",
  condition: "Состојба",
};

const ERROR_DEFAULTS_MK: Record<string, string> = {
  "Authentication required":
    "Мора да бидете најавени за да објавите. Најавете се и обидете повторно.",
  "Account suspended": "Вашата сметка е суспендирана. Контактирајте ја поддршката.",
  "Invalid request body": "Податоците од формуларот не се валидни.",
  DUPLICATE_LISTING: "Овој оглас веќе постои. Не можете да објавите истото двапати.",
  DUPLICATE_LISTING_SELF:
    "Не можете да објавите истиот производ двапати во рок од 1 месец. Веќе имате сличен активен оглас — уредете го или почекајте 1 месец.",
  BLACKLIST_WORD: "Содржината содржи забранети зборови. Променете го насловот или описот.",
  CLIENT_BLOCKED_WORD: 'Содржината содржи забранета збор: "{word}".',
  PHONE_IN_DESCRIPTION:
    "Телефонскиот број не е дозволен во описот. Внесете го само во полето за телефон.",
  EXTERNAL_LINK_IN_DESCRIPTION: "Надворешни линкови не се дозволени во описот.",
  LISTING_POST_COOLDOWN: "Почекајте — 30 секунди пред следната објава.",
  LISTING_POST_IP_COOLDOWN: "Премногу објави од истата мрежа. Почекајте и обидете повторно.",
  LISTING_MODERATION_REJECTED:
    "Оglasот не беше одобрен. Проверете го насловот, описот и цената.",
  FREE_QUOTA_EXCEEDED:
    "Бесплатните објави за оваа категорија овој месец се искористени. Продолжете со €0.30/оглас од паричникот (Профил) или почекајте нов месец.",
  LISTING_MONTHLY_CAP:
    "Го достигнавте лимитот на активни огласи. Избришете стар оглас или купете дополнителен пакет.",
  WALLET_INSUFFICIENT: "Салдото во паричникот не е доволно. Надополнете го паричникот од профилот.",
  BUSINESS_QUOTA_EXCEEDED:
    "Го достигнавте бесплатниот бизnis лимит. Надополнете го паричникот (€0.30/оглас).",
  BUSINESS_MONTHLY_CAP: "Го достигнавте месечниот лимит на активни огласи за бизnis сметката.",
  BUSINESS_PENDING_ACTIVATION: "Бизnis сметката сè уште не е активирана.",
  BUSINESS_NOT_ACTIVE: "Бизnis сметката не е активна.",
  BUSINESS_PRICE_REQUIRED: "Внесете ја цената на производот.",
  BUSINESS_NO_CONTACT_PRICE: "Не ставувајте контакт наместо цена.",
  BUSINESS_GENERIC_AD: "Описот изгледа премногу општ — наведете конкретен производ.",
  BUSINESS_STOCK_PHOTO: "Фотографијата изгледа како сток — користете фотографија од вашиот производ.",
  BUSINESS_TITLE_TOO_SHORT: "Насловот за бизnis е прекраток.",
  DHURATA_PRICE_ZERO: "Бесплатен подарок мора да има цена 0 €.",
  DHURATA_PHOTO_REQUIRED: "Бесплатен подарок бара најмалку една фотографија.",
  DHURATA_PHOTO_LIMIT: "Бесплатен подарок дозволува само дозволениот број фотографии.",
  DHURATA_SELLING_LANGUAGE: "Описот на подарокот мора да биде на соодветниот јазик.",
  DHURATA_PHOTO_MISMATCH: "Фотографиите не одговараат на правилата за бесплатен подарок.",
  KERKOJ_PHOTO_REQUIRED: "Барањето бара најмалку една фотографија.",
  KERKOJ_PHOTO_LIMIT: "Барањето дозволува само дозволениот број фотографии.",
  KERKOJ_SELLING_LANGUAGE: "Описот на барањето мора да биде на соодветниот јазик.",
  KERKOJ_ONE_ACTIVE: "Веќе имате активно барање во оваа категорија.",
  KERKOJ_PHOTO_MISMATCH: "Фотографиите не одговараат на правилата за барање.",
  RATE_LIMIT_POST_LISTING:
    "Премногу обиди за објавување. Почекајте (макс. 5 објави на час) и обидете повторно.",
  "Too many requests": "Премногу барања истовремено. Почекајте 1–2 минути и обидете повторно.",
};

const FIELD_LABELS_MNE: Record<string, string> = {
  parent_category_id: "Glavna kategorija",
  category_id: "Podkategorija",
  brand_category_id: "Marka",
  title: "Naslov",
  description: "Opis",
  price: "Cijena",
  location: "Grad",
  seller_phone: "Telefon",
  seller_name: "Ime",
  image_url: "Fotografija",
  condition: "Stanje",
};

const ERROR_DEFAULTS_MNE: Record<string, string> = {
  "Authentication required":
    "Morate biti prijavljeni da objavite. Prijavite se i pokušajte ponovo.",
  "Account suspended": "Vaš nalog je suspendovan. Kontaktirajte podršku.",
  "Invalid request body": "Podaci formulara nisu validni.",
  DUPLICATE_LISTING: "Ovaj oglas već postoji. Ne možete objaviti isto dvaput.",
  DUPLICATE_LISTING_SELF:
    "Ne možete objaviti isti proizvod dvaput u roku od 1 mjeseca. Već imate sličan aktivan oglas — uredite ga ili sačekajte 1 mjesec.",
  BLACKLIST_WORD: "Sadržaj sadrži zabranjene riječi. Promijenite naslov ili opis.",
  CLIENT_BLOCKED_WORD: 'Sadržaj sadrži zabranjenu riječ: "{word}".',
  PHONE_IN_DESCRIPTION:
    "Broj telefona nije dozvoljen u opisu. Unesite ga samo u polje za telefon.",
  EXTERNAL_LINK_IN_DESCRIPTION: "Vanjski linkovi nisu dozvoljeni u opisu.",
  LISTING_POST_COOLDOWN: "Sačekajte — 30 sekundi prije sljedeće objave.",
  LISTING_POST_IP_COOLDOWN: "Previše objava sa iste mreže. Sačekajte i pokušajte ponovo.",
  LISTING_MODERATION_REJECTED:
    "Oglas nije odobren. Provjerite naslov, opis i cijenu.",
  FREE_QUOTA_EXCEEDED:
    "Besplatne objave za ovu kategoriju ovog mjeseca su iskorištene. Nastavite sa €0.30/objava iz novčanika (Profil) ili sačekajte novi mjesec.",
  LISTING_MONTHLY_CAP:
    "Dostigli ste limit aktivnih oglasa. Obrišite stari oglas ili kupite dodatni paket.",
  WALLET_INSUFFICIENT: "Stanje u novčaniku nije dovoljno. Dopunite novčanik iz profila.",
  BUSINESS_QUOTA_EXCEEDED:
    "Dostigli ste besplatni poslovni limit. Dopunite novčanik (€0.30/oglas).",
  BUSINESS_MONTHLY_CAP: "Dostigli ste mjesečni limit aktivnih oglasa za poslovni nalog.",
  BUSINESS_PENDING_ACTIVATION: "Poslovni nalog još nije aktiviran.",
  BUSINESS_NOT_ACTIVE: "Poslovni nalog nije aktivan.",
  BUSINESS_PRICE_REQUIRED: "Unesite cijenu proizvoda.",
  BUSINESS_NO_CONTACT_PRICE: "Ne stavljajte kontakt umjesto cijene.",
  BUSINESS_GENERIC_AD: "Opis izgleda previše općenito — navedite konkretan proizvod.",
  BUSINESS_STOCK_PHOTO: "Fotografija izgleda kao stock — koristite fotografiju vašeg proizvoda.",
  BUSINESS_TITLE_TOO_SHORT: "Poslovni naslov je prekratak.",
  DHURATA_PRICE_ZERO: "Besplatan poklon mora imati cijenu 0 €.",
  DHURATA_PHOTO_REQUIRED: "Besplatan poklon zahtijeva najmanje jednu fotografiju.",
  DHURATA_PHOTO_LIMIT: "Besplatan poklon dozvoljava samo dozvoljeni broj fotografija.",
  DHURATA_SELLING_LANGUAGE: "Opis poklona mora biti na odgovarajućem jeziku.",
  DHURATA_PHOTO_MISMATCH: "Fotografije ne odgovaraju pravilima za besplatan poklon.",
  KERKOJ_PHOTO_REQUIRED: "Zahtjev zahtijeva najmanje jednu fotografiju.",
  KERKOJ_PHOTO_LIMIT: "Zahtjev dozvoljava samo dozvoljeni broj fotografija.",
  KERKOJ_SELLING_LANGUAGE: "Opis zahtjeva mora biti na odgovarajućem jeziku.",
  KERKOJ_ONE_ACTIVE: "Već imate aktivan zahtjev u ovoj kategoriji.",
  KERKOJ_PHOTO_MISMATCH: "Fotografije ne odgovaraju pravilima za zahtjev.",
  RATE_LIMIT_POST_LISTING:
    "Previše pokušaja objave. Sačekajte (maks. 5 objava na sat) i pokušajte ponovo.",
  "Too many requests": "Previše zahtjeva u isto vrijeme. Sačekajte 1–2 minute i pokušajte ponovo.",
};

const FIELD_LABELS_EN: Record<string, string> = {
  parent_category_id: "Main category",
  category_id: "Subcategory",
  brand_category_id: "Brand",
  title: "Title",
  description: "Description",
  price: "Price",
  location: "City",
  seller_phone: "Phone",
  seller_name: "Name",
  image_url: "Photo",
  condition: "Condition",
};

const ERROR_DEFAULTS_EN: Record<string, string> = {
  "Authentication required":
    "You must be signed in to post. Log in and try again.",
  "Account suspended": "Your account is suspended. Contact support.",
  "Invalid request body": "Form data is not valid.",
  DUPLICATE_LISTING: "This listing already exists. You cannot post the same thing twice.",
  DUPLICATE_LISTING_SELF:
    "You cannot post the same item twice within 1 month. You already have a similar active listing — edit it or wait 1 month.",
  BLACKLIST_WORD: "Content contains blocked words. Change the title or description.",
  CLIENT_BLOCKED_WORD: 'Content contains a blocked word: "{word}".',
  PHONE_IN_DESCRIPTION:
    "Phone number is not allowed in the description. Enter it only in the phone field.",
  EXTERNAL_LINK_IN_DESCRIPTION: "External links are not allowed in the description.",
  LISTING_POST_COOLDOWN: "Please wait — 30 seconds before your next post.",
  LISTING_POST_IP_COOLDOWN: "Too many posts from the same network. Wait and try again.",
  LISTING_MODERATION_REJECTED:
    "Listing was not approved. Check the title, description, and price.",
  FREE_QUOTA_EXCEEDED:
    "Free posts for this category this month are used up. Continue with €0.30/post from wallet (Profile) or wait for the new month.",
  LISTING_MONTHLY_CAP:
    "You reached the active listings limit. Delete an old listing or buy an extra package.",
  WALLET_INSUFFICIENT: "Wallet balance is insufficient. Top up from profile.",
  BUSINESS_QUOTA_EXCEEDED: "You reached the free business limit. Top up wallet (€0.30/listing).",
  BUSINESS_MONTHLY_CAP: "You reached the monthly active listings limit for the business account.",
  BUSINESS_PENDING_ACTIVATION: "Business account is not activated yet.",
  BUSINESS_NOT_ACTIVE: "Business account is not active.",
  BUSINESS_PRICE_REQUIRED: "Enter the product price.",
  BUSINESS_NO_CONTACT_PRICE: "Do not use contact instead of a price.",
  BUSINESS_GENERIC_AD: "Description looks too generic — specify the product.",
  BUSINESS_STOCK_PHOTO: "Photo looks like stock — use a photo of your product.",
  BUSINESS_TITLE_TOO_SHORT: "Business title is too short.",
  DHURATA_PRICE_ZERO: "Free gift must have price 0 €.",
  DHURATA_PHOTO_REQUIRED: "Free gift requires at least one photo.",
  DHURATA_PHOTO_LIMIT: "Free gift allows only the permitted number of photos.",
  DHURATA_SELLING_LANGUAGE: "Gift description must be in the correct language.",
  DHURATA_PHOTO_MISMATCH: "Photos do not match free gift rules.",
  KERKOJ_PHOTO_REQUIRED: "Request requires at least one photo.",
  KERKOJ_PHOTO_LIMIT: "Request allows only the permitted number of photos.",
  KERKOJ_SELLING_LANGUAGE: "Request description must be in the correct language.",
  KERKOJ_ONE_ACTIVE: "You already have an active request in this category.",
  KERKOJ_PHOTO_MISMATCH: "Photos do not match request rules.",
  RATE_LIMIT_POST_LISTING:
    "Too many posting attempts. Wait a bit (max. 5 posts per hour) and try again.",
  "Too many requests": "Too many requests at once. Wait 1–2 minutes and try again.",
};

const FIELD_LABELS_FR: Record<string, string> = {
  parent_category_id: "Catégorie principale",
  category_id: "Sous-catégorie",
  brand_category_id: "Marque",
  title: "Titre",
  description: "Description",
  price: "Prix",
  location: "Ville",
  seller_phone: "Téléphone",
  seller_name: "Nom",
  image_url: "Photo",
  condition: "État",
};

const ERROR_DEFAULTS_FR: Record<string, string> = {
  "Authentication required":
    "Vous devez être connecté pour publier. Connectez-vous et réessayez.",
  "Account suspended": "Votre compte est suspendu. Contactez le support.",
  "Invalid request body": "Les données du formulaire ne sont pas valides.",
  DUPLICATE_LISTING: "Cette annonce existe déjà. Vous ne pouvez pas publier la même chose deux fois.",
  DUPLICATE_LISTING_SELF:
    "Vous ne pouvez pas publier le même article deux fois en 1 mois. Vous avez déjà une annonce similaire active — modifiez-la ou attendez 1 mois.",
  BLACKLIST_WORD: "Le contenu contient des mots interdits. Modifiez le titre ou la description.",
  CLIENT_BLOCKED_WORD: 'Le contenu contient un mot interdit : « {word} ».',
  PHONE_IN_DESCRIPTION:
    "Le numéro de téléphone n'est pas autorisé dans la description. Saisissez-le uniquement dans le champ téléphone.",
  EXTERNAL_LINK_IN_DESCRIPTION: "Les liens externes ne sont pas autorisés dans la description.",
  LISTING_POST_COOLDOWN: "Patientez — 30 secondes avant la prochaine publication.",
  LISTING_POST_IP_COOLDOWN: "Trop de publications depuis le même réseau. Attendez et réessayez.",
  LISTING_MODERATION_REJECTED:
    "L'annonce n'a pas été approuvée. Vérifiez le titre, la description et le prix.",
  FREE_QUOTA_EXCEEDED:
    "Publications gratuites pour cette catégorie ce mois-ci épuisées. Continuez avec 0,30 €/annonce depuis le portefeuille (Profil) ou attendez le mois suivant.",
  LISTING_MONTHLY_CAP:
    "Vous avez atteint la limite d'annonces actives. Supprimez une ancienne annonce ou achetez un pack supplémentaire.",
  WALLET_INSUFFICIENT: "Solde du portefeuille insuffisant. Rechargez depuis le profil.",
  BUSINESS_QUOTA_EXCEEDED:
    "Vous avez atteint la limite gratuite professionnelle. Rechargez le portefeuille (0,30 €/annonce).",
  BUSINESS_MONTHLY_CAP:
    "Vous avez atteint la limite mensuelle d'annonces actives pour le compte professionnel.",
  BUSINESS_PENDING_ACTIVATION: "Le compte professionnel n'est pas encore activé.",
  BUSINESS_NOT_ACTIVE: "Le compte professionnel n'est pas actif.",
  BUSINESS_PRICE_REQUIRED: "Indiquez le prix du produit.",
  BUSINESS_NO_CONTACT_PRICE: "N'indiquez pas « contact » à la place du prix.",
  BUSINESS_GENERIC_AD: "La description semble trop générique — précisez le produit.",
  BUSINESS_STOCK_PHOTO: "La photo semble être une image stock — utilisez une photo de votre produit.",
  BUSINESS_TITLE_TOO_SHORT: "Le titre professionnel est trop court.",
  DHURATA_PRICE_ZERO: "Le cadeau gratuit doit avoir un prix de 0 €.",
  DHURATA_PHOTO_REQUIRED: "Le cadeau gratuit exige au moins une photo.",
  DHURATA_PHOTO_LIMIT: "Le cadeau gratuit n'autorise que le nombre de photos permis.",
  DHURATA_SELLING_LANGUAGE: "La description du cadeau doit être dans la langue appropriée.",
  DHURATA_PHOTO_MISMATCH: "Les photos ne respectent pas les règles du cadeau gratuit.",
  KERKOJ_PHOTO_REQUIRED: "La demande exige au moins une photo.",
  KERKOJ_PHOTO_LIMIT: "La demande n'autorise que le nombre de photos permis.",
  KERKOJ_SELLING_LANGUAGE: "La description de la demande doit être dans la langue appropriée.",
  KERKOJ_ONE_ACTIVE: "Vous avez déjà une demande active dans cette catégorie.",
  KERKOJ_PHOTO_MISMATCH: "Les photos ne respectent pas les règles de la demande.",
  RATE_LIMIT_POST_LISTING:
    "Trop de tentatives de publication. Attendez (max. 5 publications par heure) et réessayez.",
  "Too many requests": "Trop de requêtes en même temps. Attendez 1–2 minutes et réessayez.",
};

const KS: ListingPostFeedbackCopy = {
  fieldLabels: FIELD_LABELS_KS,
  errorDefaults: ERROR_DEFAULTS_KS,
  badRequestFallback: "Plotësoni saktë të gjitha fushat e detyrueshme dhe provoni përsëri.",
  rateLimitFallback: "Shumë përpjekje. Prisni pak dhe provoni përsëri.",
};

const MK: ListingPostFeedbackCopy = {
  fieldLabels: FIELD_LABELS_MK,
  errorDefaults: ERROR_DEFAULTS_MK,
  badRequestFallback: "Пополнете ги точно сите задолжителни полиња и обидете повторно.",
  rateLimitFallback: "Премногу обиди. Почекајте и обидете повторно.",
};

const MNE: ListingPostFeedbackCopy = {
  fieldLabels: FIELD_LABELS_MNE,
  errorDefaults: ERROR_DEFAULTS_MNE,
  badRequestFallback: "Tačno popunite sva obavezna polja i pokušajte ponovo.",
  rateLimitFallback: "Previše pokušaja. Sačekajte i pokušajte ponovo.",
};

const EN: ListingPostFeedbackCopy = {
  fieldLabels: FIELD_LABELS_EN,
  errorDefaults: ERROR_DEFAULTS_EN,
  badRequestFallback: "Fill in all required fields correctly and try again.",
  rateLimitFallback: "Too many attempts. Wait a bit and try again.",
};

const IT: ListingPostFeedbackCopy = {
  fieldLabels: FIELD_LABELS_EN,
  errorDefaults: ERROR_DEFAULTS_EN,
  badRequestFallback: "Fill in all required fields correctly and try again.",
  rateLimitFallback: "Too many attempts. Wait a bit and try again.",
};

const DE: ListingPostFeedbackCopy = {
  fieldLabels: FIELD_LABELS_EN,
  errorDefaults: ERROR_DEFAULTS_EN,
  badRequestFallback: "Fill in all required fields correctly and try again.",
  rateLimitFallback: "Too many attempts. Wait a bit and try again.",
};

const FR: ListingPostFeedbackCopy = {
  fieldLabels: FIELD_LABELS_FR,
  errorDefaults: ERROR_DEFAULTS_FR,
  badRequestFallback: "Remplissez correctement tous les champs obligatoires et réessayez.",
  rateLimitFallback: "Trop de tentatives. Attendez un peu et réessayez.",
};

const PAGES: Record<UiTranslationLocale, ListingPostFeedbackCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
};

const PACKAGE_ERRORS = new Set([
  "FREE_QUOTA_EXCEEDED",
  "LISTING_MONTHLY_CAP",
  "WALLET_INSUFFICIENT",
  "BUSINESS_QUOTA_EXCEEDED",
  "BUSINESS_MONTHLY_CAP",
]);

function copyForLocale(locale: UiTranslationLocale): ListingPostFeedbackCopy {
  return PAGES[locale];
}

function defaultForErrorCode(
  code: string | undefined,
  errorDefaults: Record<string, string>,
): string | null {
  if (!code) return null;
  return errorDefaults[code] ?? errorDefaults[code.replace(/ /g, "_")] ?? null;
}

function formatApiValidationDetails(
  details: ListingPostApiBody["details"],
  fieldLabels: Record<string, string>,
): string | null {
  if (!details?.length) return null;
  const parts = details
    .map((issue) => {
      const path = issue.path?.filter((p) => typeof p === "string").join(".") ?? "";
      const label = path ? (fieldLabels[path.split(".")[0] ?? ""] ?? path) : "";
      const msg = issue.message?.trim();
      if (label && msg) return `${label}: ${msg}`;
      return msg ?? label;
    })
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function clientValidationMessage(
  code: string,
  locale: UiTranslationLocale,
  opts?: { blockedWord?: string },
): string | null {
  const { errorDefaults } = copyForLocale(locale);
  if (code === "CLIENT_BLOCKED_WORD") {
    if (opts?.blockedWord && errorDefaults.CLIENT_BLOCKED_WORD) {
      return errorDefaults.CLIENT_BLOCKED_WORD.replace("{word}", opts.blockedWord);
    }
    return errorDefaults.BLACKLIST_WORD ?? null;
  }
  if (code === "PHONE_IN_DESCRIPTION") {
    return errorDefaults.PHONE_IN_DESCRIPTION ?? null;
  }
  if (code === "EXTERNAL_LINK") {
    return errorDefaults.EXTERNAL_LINK_IN_DESCRIPTION ?? null;
  }
  return defaultForErrorCode(code, errorDefaults);
}

export function fieldLabel(path: string, locale: UiTranslationLocale): string {
  const key = path.split(".")[0] ?? path;
  return copyForLocale(locale).fieldLabels[key] ?? path;
}

export function resolveListingPostApiError(
  body: ListingPostApiBody,
  status: number,
  fallback: string,
  locale: UiTranslationLocale,
): { message: string; openPackages: boolean } {
  const { fieldLabels, errorDefaults, badRequestFallback, rateLimitFallback } = copyForLocale(locale);
  const code = body.error?.trim();
  const fromDetails = formatApiValidationDetails(body.details, fieldLabels);
  const explicit =
    body.message?.trim() ||
    body.moderation_reason?.trim() ||
    body.reason?.trim() ||
    fromDetails ||
    defaultForErrorCode(code, errorDefaults);

  if (explicit) {
    return {
      message: explicit,
      openPackages: !!(code && PACKAGE_ERRORS.has(code)),
    };
  }

  if (status === 401) {
    return {
      message: errorDefaults["Authentication required"]!,
      openPackages: false,
    };
  }
  if (status === 403 && code === "Account suspended") {
    return { message: errorDefaults["Account suspended"]!, openPackages: false };
  }
  if (status === 400) {
    return {
      message: fromDetails ?? badRequestFallback,
      openPackages: false,
    };
  }
  if (status === 429) {
    return {
      message: defaultForErrorCode(code, errorDefaults) ?? rateLimitFallback,
      openPackages: false,
    };
  }

  return { message: fallback, openPackages: !!(code && PACKAGE_ERRORS.has(code)) };
}
