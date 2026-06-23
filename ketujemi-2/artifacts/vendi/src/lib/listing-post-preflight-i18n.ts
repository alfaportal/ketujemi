import type { UiTranslationLocale } from "@/lib/ui-languages";

export type ListingPostPreflightInput = {
  parentCategoryId: number;
  categoryId: number;
  brandCategoryId: number;
  hasBrands: boolean;
  subcategoryCount: number;
  title: string;
  description: string;
  price: number;
  priceAgreement: boolean;
  location: string;
  sellerName: string;
  sellerPhone: string;
  imageCount: number;
  hasVideo?: boolean;
  isKerkoj: boolean;
  isDhurata: boolean;
  isUploading: boolean;
};

type ListingPostPreflightCopy = {
  selectMainCategory: string;
  titleForSubcategory: string;
  chooseSubcategory: string;
  chooseBrand: string;
  titleMinLength: string;
  descriptionMinLength: string;
  chooseCity: string;
  sellerNameRequired: string;
  phoneMinDigits: string;
  waitForUpload: string;
  addPhoto: string;
  freeQuotaRemaining: (used: number, limit: number, remaining: number) => string;
  freeQuotaExhaustedCanWallet: (used: number, limit: number) => string;
  freeQuotaExhaustedTopUp: (used: number, limit: number) => string;
};

const KS: ListingPostPreflightCopy = {
  selectMainCategory: "Zgjidhni kategorinë kryesore.",
  titleForSubcategory: "Shkruani titullin (min. 5 karaktere) për të caktuar nënkategorinë.",
  chooseSubcategory: "Zgjidhni nënkategorinë nga lista.",
  chooseBrand: "Zgjidhni markën / modelin e produktit.",
  titleMinLength: "Titulli duhet të ketë të paktën 5 karaktere.",
  descriptionMinLength: "Përshkrimi duhet të ketë të paktën 15 karaktere.",
  chooseCity: "Zgjidhni qytetin (vendndodhja).",
  sellerNameRequired: "Shkruani emrin e shitësit.",
  phoneMinDigits: "Telefoni duhet të ketë të paktën 5 shifra.",
  waitForUpload: "Prisni derisa të përfundojë ngarkimi i fotove.",
  addPhoto: "Shtoni të paktën një foto ose video.",
  freeQuotaRemaining: (used, limit, remaining) =>
    `Postime falas këtë muaj për këtë kategori: ${used}/${limit} (mbeten ${remaining}).`,
  freeQuotaExhaustedCanWallet: (used, limit) =>
    `Postimet falas (${used}/${limit}) për këtë muaj janë shpenzuar. Mund të postoni ende — €0.30/shpallje nga portofoli.`,
  freeQuotaExhaustedTopUp: (used, limit) =>
    `Postimet falas (${used}/${limit}) për këtë muaj janë shpenzuar. Postimi i radhës: €0.30 — mbushni portofolin nga Profili.`,
};

const MK: ListingPostPreflightCopy = {
  selectMainCategory: "Изберете ја главната категорија.",
  titleForSubcategory: "Напишете наслов (мин. 5 знаци) за да ја одредите подкategoriјата.",
  chooseSubcategory: "Изберете подкategoriја од листата.",
  chooseBrand: "Изберете марка / модел на производот.",
  titleMinLength: "Насловот мора да има најмалку 5 знаци.",
  descriptionMinLength: "Описот мора да има најмалку 15 знаци.",
  chooseCity: "Изберете град (локација).",
  sellerNameRequired: "Внесете име на продавачот.",
  phoneMinDigits: "Телефонот мора да има најмалку 5 цифри.",
  waitForUpload: "Почекајте да заврши прикачувањето на фотографиите.",
  addPhoto: "Додајте најмалку една фотографија или видео.",
  freeQuotaRemaining: (used, limit, remaining) =>
    `Бесплатни објави овој месец за оваа категорија: ${used}/${limit} (остануваат ${remaining}).`,
  freeQuotaExhaustedCanWallet: (used, limit) =>
    `Бесплатните објави (${used}/${limit}) за овој месец се искористени. Сè уште можете да објавувате — €0.30/оглас од паричникот.`,
  freeQuotaExhaustedTopUp: (used, limit) =>
    `Бесплатните објави (${used}/${limit}) за овој месец се искористени. Следната објава: €0.30 — надополнете го паричникот од Профилот.`,
};

const MNE: ListingPostPreflightCopy = {
  selectMainCategory: "Izaberite glavnu kategoriju.",
  titleForSubcategory: "Napišite naslov (min. 5 znakova) da odredite podkategoriju.",
  chooseSubcategory: "Izaberite podkategoriju sa liste.",
  chooseBrand: "Izaberite marku / model proizvoda.",
  titleMinLength: "Naslov mora imati najmanje 5 znakova.",
  descriptionMinLength: "Opis mora imati najmanje 15 znakova.",
  chooseCity: "Izaberite grad (lokacija).",
  sellerNameRequired: "Unesite ime prodavca.",
  phoneMinDigits: "Telefon mora imati najmanje 5 cifara.",
  waitForUpload: "Sačekajte da se završi upload fotografija.",
  addPhoto: "Dodajte najmanje jednu fotografiju ili video.",
  freeQuotaRemaining: (used, limit, remaining) =>
    `Besplatne objave ovog mjeseca za ovu kategoriju: ${used}/${limit} (preostaje ${remaining}).`,
  freeQuotaExhaustedCanWallet: (used, limit) =>
    `Besplatne objave (${used}/${limit}) za ovaj mjesec su iskorištene. Još možete objavljivati — €0.30/oglas iz novčanika.`,
  freeQuotaExhaustedTopUp: (used, limit) =>
    `Besplatne objave (${used}/${limit}) za ovaj mjesec su iskorištene. Sljedeća objava: €0.30 — dopunite novčanik iz Profila.`,
};

const EN: ListingPostPreflightCopy = {
  selectMainCategory: "Choose the main category.",
  titleForSubcategory: "Enter the title (min. 5 characters) to determine the subcategory.",
  chooseSubcategory: "Choose the subcategory from the list.",
  chooseBrand: "Choose the product brand / model.",
  titleMinLength: "Title must be at least 5 characters.",
  descriptionMinLength: "Description must be at least 15 characters.",
  chooseCity: "Choose the city (location).",
  sellerNameRequired: "Enter the seller's name.",
  phoneMinDigits: "Phone must have at least 5 digits.",
  waitForUpload: "Wait until photo upload finishes.",
  addPhoto: "Add at least one photo or video.",
  freeQuotaRemaining: (used, limit, remaining) =>
    `Free posts this month for this category: ${used}/${limit} (${remaining} remaining).`,
  freeQuotaExhaustedCanWallet: (used, limit) =>
    `Free posts (${used}/${limit}) for this month are used up. You can still post — €0.30/listing from wallet.`,
  freeQuotaExhaustedTopUp: (used, limit) =>
    `Free posts (${used}/${limit}) for this month are used up. Next post: €0.30 — top up wallet from Profile.`,
};

const IT: ListingPostPreflightCopy = {
  selectMainCategory: "Choose the main category.",
  titleForSubcategory: "Enter the title (min. 5 characters) to determine the subcategory.",
  chooseSubcategory: "Choose the subcategory from the list.",
  chooseBrand: "Choose the product brand / model.",
  titleMinLength: "Title must be at least 5 characters.",
  descriptionMinLength: "Descrizione must be at least 15 characters.",
  chooseCity: "Choose the city (location).",
  sellerNameRequired: "Enter the seller's name.",
  phoneMinDigits: "Phone must have at least 5 digits.",
  waitForUpload: "Wait until photo upload finishes.",
  addPhoto: "Add at least one photo or video.",
  freeQuotaRemaining: (used, limit, remaining) =>
    `Free posts this month for this category: ${used}/${limit} (${remaining} remaining).`,
  freeQuotaExhaustedCanWallet: (used, limit) =>
    `Free posts (${used}/${limit}) for this month are used up. You can still post — €0.30/listing from wallet.`,
  freeQuotaExhaustedTopUp: (used, limit) =>
    `Free posts (${used}/${limit}) for this month are used up. Next post: €0.30 — top up wallet from Profile.`,
};

const DE: ListingPostPreflightCopy = {
  selectMainCategory: "Choose the main category.",
  titleForSubcategory: "Enter the title (min. 5 characters) to determine the subcategory.",
  chooseSubcategory: "Choose the subcategory from the list.",
  chooseBrand: "Choose the product brand / model.",
  titleMinLength: "Title must be at least 5 characters.",
  descriptionMinLength: "Beschreibung must be at least 15 characters.",
  chooseCity: "Choose the city (location).",
  sellerNameRequired: "Enter the seller's name.",
  phoneMinDigits: "Phone must have at least 5 digits.",
  waitForUpload: "Wait until photo upload finishes.",
  addPhoto: "Add at least one photo or video.",
  freeQuotaRemaining: (used, limit, remaining) =>
    `Free posts this month for this category: ${used}/${limit} (${remaining} remaining).`,
  freeQuotaExhaustedCanWallet: (used, limit) =>
    `Free posts (${used}/${limit}) for this month are used up. You can still post — €0.30/listing from wallet.`,
  freeQuotaExhaustedTopUp: (used, limit) =>
    `Free posts (${used}/${limit}) for this month are used up. Next post: €0.30 — top up wallet from Profile.`,
};

const FR: ListingPostPreflightCopy = {
  selectMainCategory: "Choisissez la catégorie principale.",
  titleForSubcategory: "Saisissez le titre (min. 5 caractères) pour déterminer la sous-catégorie.",
  chooseSubcategory: "Choisissez la sous-catégorie dans la liste.",
  chooseBrand: "Choisissez la marque / le modèle du produit.",
  titleMinLength: "Le titre doit contenir au moins 5 caractères.",
  descriptionMinLength: "La description doit contenir au moins 15 caractères.",
  chooseCity: "Choisissez la ville (localisation).",
  sellerNameRequired: "Saisissez le nom du vendeur.",
  phoneMinDigits: "Le téléphone doit contenir au moins 5 chiffres.",
  waitForUpload: "Attendez la fin du téléversement des photos.",
  addPhoto: "Ajoutez au moins une photo ou une vidéo.",
  freeQuotaRemaining: (used, limit, remaining) =>
    `Publications gratuites ce mois pour cette catégorie : ${used}/${limit} (il en reste ${remaining}).`,
  freeQuotaExhaustedCanWallet: (used, limit) =>
    `Publications gratuites (${used}/${limit}) pour ce mois épuisées. Vous pouvez encore publier — 0,30 €/annonce depuis le portefeuille.`,
  freeQuotaExhaustedTopUp: (used, limit) =>
    `Publications gratuites (${used}/${limit}) pour ce mois épuisées. Prochaine publication : 0,30 € — rechargez le portefeuille depuis Profil.`,
};

const PAGES: Record<UiTranslationLocale, ListingPostPreflightCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
};

function copyForLocale(locale: UiTranslationLocale): ListingPostPreflightCopy {
  return PAGES[locale];
}

export function collectListingPostPreflightIssues(
  input: ListingPostPreflightInput,
  locale: UiTranslationLocale,
): string[] {
  const c = copyForLocale(locale);
  const issues: string[] = [];

  if (!input.parentCategoryId || input.parentCategoryId < 1) {
    issues.push(c.selectMainCategory);
  }
  if (input.subcategoryCount > 1 && (!input.categoryId || input.categoryId < 1)) {
    if (input.title.trim().length < 5) {
      issues.push(c.titleForSubcategory);
    } else {
      issues.push(c.chooseSubcategory);
    }
  }
  if (input.hasBrands && (!input.brandCategoryId || input.brandCategoryId < 1)) {
    issues.push(c.chooseBrand);
  }
  const title = input.title.trim();
  if (title.length < 5) {
    issues.push(c.titleMinLength);
  }
  const desc = input.description.trim();
  if (desc.length < 15) {
    issues.push(c.descriptionMinLength);
  }
  if (!input.location.trim()) {
    issues.push(c.chooseCity);
  }
  if (input.sellerName.trim().length < 2) {
    issues.push(c.sellerNameRequired);
  }
  if (input.sellerPhone.replace(/\D/g, "").length < 5) {
    issues.push(c.phoneMinDigits);
  }
  if (input.isUploading) {
    issues.push(c.waitForUpload);
  }
  if (input.imageCount < 1 && !input.hasVideo) {
    issues.push(c.addPhoto);
  }

  return issues;
}

export function formatFreeQuotaWarning(
  used: number,
  limit: number,
  remaining: number,
  canPostWithWallet: boolean | undefined,
  locale: UiTranslationLocale,
): string {
  const c = copyForLocale(locale);
  if (remaining > 0) {
    return c.freeQuotaRemaining(used, limit, remaining);
  }
  if (canPostWithWallet) {
    return c.freeQuotaExhaustedCanWallet(used, limit);
  }
  return c.freeQuotaExhaustedTopUp(used, limit);
}
