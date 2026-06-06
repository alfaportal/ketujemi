import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";
import type { ShopDirectoryCategory, ShopDirectorySubcategory } from "@/lib/shop-directory-taxonomy";

export type ShopDirectoryCopy = {
  docTitle: string;
  seoTitle: string;
  seoDescription: string;
  seoCategoryTitleSuffix: string;
  seoCategoryDescription: string;
  seoSubcategoryTitle: string;
  fuseNoResults: string;
  docCategoryTitle: string;
  navShops: string;
  navBuySell: string;
  homeBannerTitle: string;
  homeBannerSubtitle: string;
  homeBannerBtn: string;
  searchPlaceholder: string;
  searchBtn: string;
  filterCity: string;
  filterCountry: string;
  filterAll: string;
  shopsCount: string;
  viewShop: string;
  viewAllShops: string;
  noShops: string;
  noResults: string;
  allSubcategories: string;
  categoryNames: Record<string, string>;
};

const CATEGORY_MK: Record<string, string> = {
  "makina-transport": "Автомобили и транспорт",
  patundshmeri: "Недвижнини",
  "elektronike-teknologji": "Електроника и технологија",
  "shtepi-mobilje": "Дом и мебел",
  "moda-veshje": "Мода и облека",
  "ndertim-instalime": "Градежништво и инсталации",
  "biznes-sherbime": "Бизнис и професионални услуги",
  "femije-nena": "Деца и мајки",
  "sport-rekreacion": "Спорт и рекреација",
  "bujqesi-blegtori": "Земјоделство и сточарство",
  "kafshe-shtepiake": "Домашни миленици",
  "arsim-kurse": "Образование и курсеви",
  "evente-dasma": "Настани и свадби",
  "turizem-udhetimet": "Туризам и патувања",
  "shendetesi-bukuri": "Здравје и убавина",
};

const CATEGORY_MNE: Record<string, string> = {
  "makina-transport": "Automobili i transport",
  patundshmeri: "Nekretnine",
  "elektronike-teknologji": "Elektronika i tehnologija",
  "shtepi-mobilje": "Dom i namještaj",
  "moda-veshje": "Moda i odjeća",
  "ndertim-instalime": "Građevina i instalacije",
  "biznes-sherbime": "Biznis i profesionalne usluge",
  "femije-nena": "Djeca i majke",
  "sport-rekreacion": "Sport i rekreacija",
  "bujqesi-blegtori": "Poljoprivreda i stočarstvo",
  "kafshe-shtepiake": "Kućni ljubimci",
  "arsim-kurse": "Obrazovanje i kursevi",
  "evente-dasma": "Događaji i vjenčanja",
  "turizem-udhetimet": "Turizam i putovanja",
  "shendetesi-bukuri": "Zdravlje i ljepota",
};

const CATEGORY_EN: Record<string, string> = {
  "makina-transport": "Vehicles & Transport",
  patundshmeri: "Real Estate",
  "elektronike-teknologji": "Electronics & Technology",
  "shtepi-mobilje": "Home & Furniture",
  "moda-veshje": "Fashion & Clothing",
  "ndertim-instalime": "Construction & Installations",
  "biznes-sherbime": "Business & Professional Services",
  "femije-nena": "Children & Mothers",
  "sport-rekreacion": "Sports & Recreation",
  "bujqesi-blegtori": "Agriculture & Livestock",
  "kafshe-shtepiake": "Pets",
  "arsim-kurse": "Education & Courses",
  "evente-dasma": "Events & Weddings",
  "turizem-udhetimet": "Tourism & Travel",
  "shendetesi-bukuri": "Health & Beauty",
};

const KS: ShopDirectoryCopy = {
  docTitle: "Dyqanet — KetuJemi.com",
  seoTitle: "Dyqanet Online | KetuJemi.com — Gjej çdo dyqan në një vend",
  seoDescription:
    "Gjej dyqane lokale në Kosovë, Shqipëri, Maqedoni dhe Diasporë. 15 kategori, qindra dyqane dixhitale.",
  seoCategoryTitleSuffix: "Dyqane në KetuJemi.com",
  seoCategoryDescription:
    "Gjej dyqane {category} në Kosovë, Shqipëri dhe Maqedoni. Shiko ofertat dhe kontakto direkt.",
  seoSubcategoryTitle: "{subcategory} në {category} — KetuJemi.com",
  fuseNoResults: "Nuk u gjet asnjë dyqan për «{term}»",
  docCategoryTitle: "Dyqanet",
  navShops: "Dyqanet",
  navBuySell: "Bli & Shit",
  homeBannerTitle: "🏪 Dyqanet — Gjej çdo dyqan në një vend",
  homeBannerSubtitle: "15 kategori • Qindra dyqane lokale • Ferizaj, Prishtinë, Tiranë dhe më gjerë",
  homeBannerBtn: "Shiko të gjitha dyqanet →",
  searchPlaceholder: "🔍 Kërko dyqan... p.sh. mobilje, telefon, këpucë",
  searchBtn: "Kërko",
  filterCity: "Qyteti",
  filterCountry: "Shteti",
  filterAll: "Të gjitha",
  shopsCount: "dyqane",
  viewShop: "Shiko dyqanin →",
  viewAllShops: "Shiko të gjitha dyqanet →",
  noShops: "Nuk ka dyqane në këtë kategori ende.",
  noResults: "Nuk u gjet asnjë dyqan.",
  allSubcategories: "Të gjitha",
  categoryNames: {},
};

const MK: ShopDirectoryCopy = {
  ...KS,
  docTitle: "Продавници — KetuJemi.com",
  seoTitle: "Онлајн продавници | KetuJemi.com — Најдете ја секоја продавница на едно место",
  seoDescription:
    "Најдете локални продавници во Косово, Албанија, Македонија и дијаспора. 15 категории, стотици дигитални продавници.",
  seoCategoryTitleSuffix: "Продавници на KetuJemi.com",
  seoCategoryDescription:
    "Најдете продавници за {category} во Косово, Албанија и Македонија. Погледнете понуди и контактирајте директно.",
  seoSubcategoryTitle: "{subcategory} во {category} — KetuJemi.com",
  fuseNoResults: "Не е пронајдена продавница за «{term}»",
  docCategoryTitle: "Продавници",
  navShops: "Продавници",
  navBuySell: "Купи и продавај",
  homeBannerTitle: "🏪 Продавници — Најдете ја секоја продавница на едно место",
  homeBannerSubtitle: "15 категории • Стотици локални продавници • Ferizaj, Prishtinë, Tirana и пошироко",
  homeBannerBtn: "Види ги сите продавници →",
  searchPlaceholder: "🔍 Пребарај продавница... нпр. мебел, телефон, обувки",
  searchBtn: "Пребарај",
  filterCity: "Град",
  filterCountry: "Држава",
  filterAll: "Сите",
  shopsCount: "продавници",
  viewShop: "Види ја продавницата →",
  viewAllShops: "Види ги сите продавници →",
  noShops: "Сè уште нема продавници во оваа категорија.",
  noResults: "Не е пронајдена ниедна продавница.",
  allSubcategories: "Сите",
  categoryNames: CATEGORY_MK,
};

const MNE: ShopDirectoryCopy = {
  ...KS,
  docTitle: "Prodavnice — KetuJemi.com",
  seoTitle: "Online prodavnice | KetuJemi.com — Pronađite svaku prodavnicu na jednom mjestu",
  seoDescription:
    "Pronađite lokalne prodavnice na Kosovu, u Albaniji, Makedoniji i dijaspori. 15 kategorija, stotine digitalnih prodavnica.",
  seoCategoryTitleSuffix: "Prodavnice na KetuJemi.com",
  seoCategoryDescription:
    "Pronađite prodavnice za {category} na Kosovu, u Albaniji i Makedoniji. Pogledajte ponude i kontaktirajte direktno.",
  seoSubcategoryTitle: "{subcategory} u {category} — KetuJemi.com",
  fuseNoResults: "Nije pronađena prodavnica za «{term}»",
  docCategoryTitle: "Prodavnice",
  navShops: "Prodavnice",
  navBuySell: "Kupi i prodaj",
  homeBannerTitle: "🏪 Prodavnice — Pronađite svaku prodavnicu na jednom mjestu",
  homeBannerSubtitle: "15 kategorija • Stotine lokalnih prodavnica • Ferizaj, Priština, Tirana i šire",
  homeBannerBtn: "Pogledaj sve prodavnice →",
  searchPlaceholder: "🔍 Pretraži prodavnicu... npr. namještaj, telefon, cipele",
  searchBtn: "Pretraži",
  filterCity: "Grad",
  filterCountry: "Država",
  filterAll: "Sve",
  shopsCount: "prodavnica",
  viewShop: "Pogledaj prodavnicu →",
  viewAllShops: "Pogledaj sve prodavnice →",
  noShops: "Još nema prodavnica u ovoj kategoriji.",
  noResults: "Nije pronađena nijedna prodavnica.",
  allSubcategories: "Sve",
  categoryNames: CATEGORY_MNE,
};

const EN: ShopDirectoryCopy = {
  ...KS,
  docTitle: "Shops — KetuJemi.com",
  seoTitle: "Online Shops | KetuJemi.com — Find every store in one place",
  seoDescription:
    "Find local shops in Kosovo, Albania, North Macedonia and the diaspora. 15 categories, hundreds of digital stores.",
  seoCategoryTitleSuffix: "Shops on KetuJemi.com",
  seoCategoryDescription:
    "Find {category} shops in Kosovo, Albania and North Macedonia. Browse offers and contact directly.",
  seoSubcategoryTitle: "{subcategory} in {category} — KetuJemi.com",
  fuseNoResults: "No shop found for «{term}»",
  docCategoryTitle: "Shops",
  navShops: "Shops",
  navBuySell: "Buy & Sell",
  homeBannerTitle: "🏪 Shops — Find every store in one place",
  homeBannerSubtitle: "15 categories • Hundreds of local shops • Ferizaj, Pristina, Tirana and beyond",
  homeBannerBtn: "View all shops →",
  searchPlaceholder: "🔍 Search shops... e.g. furniture, phone, shoes",
  searchBtn: "Search",
  filterCity: "City",
  filterCountry: "Country",
  filterAll: "All",
  shopsCount: "shops",
  viewShop: "View shop →",
  viewAllShops: "View all shops →",
  noShops: "No shops in this category yet.",
  noResults: "No shops found.",
  allSubcategories: "All",
  categoryNames: CATEGORY_EN,
};

const PAGES: Record<UiTranslationLocale, ShopDirectoryCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
};

export function shopDirectoryForLocale(locale: UiTranslationLocale): ShopDirectoryCopy {
  return PAGES[locale];
}

export function useShopDirectoryCopy(): ShopDirectoryCopy {
  const { uiLang } = useMarket();
  return shopDirectoryForLocale(translationKeyForUiLang(uiLang));
}

export function translateDirectoryCategory(
  cat: Pick<ShopDirectoryCategory, "slug" | "nameSq">,
  locale: UiTranslationLocale,
): string {
  if (locale === "ks") return cat.nameSq;
  const copy = PAGES[locale];
  return copy.categoryNames[cat.slug] ?? cat.nameSq;
}

export function translateDirectorySubcategory(
  sub: Pick<ShopDirectorySubcategory, "slug" | "nameSq">,
  locale: UiTranslationLocale,
): string {
  if (locale === "ks") return sub.nameSq;
  return sub.nameSq;
}

export function seoCategoryDescriptionFor(
  copy: ShopDirectoryCopy,
  categoryName: string,
): string {
  return copy.seoCategoryDescription.replace("{category}", categoryName);
}

export function seoSubcategoryTitleFor(
  copy: ShopDirectoryCopy,
  subcategoryName: string,
  categoryName: string,
): string {
  return copy.seoSubcategoryTitle
    .replace("{subcategory}", subcategoryName)
    .replace("{category}", categoryName);
}

export function fuseNoResultsMessage(copy: ShopDirectoryCopy, term: string): string {
  return copy.fuseNoResults.replace("{term}", term);
}
