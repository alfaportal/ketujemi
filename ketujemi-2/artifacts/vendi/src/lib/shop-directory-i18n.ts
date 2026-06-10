import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";
import type { ShopDirectoryCategory, ShopDirectorySubcategory } from "@/lib/shop-directory-taxonomy";
import {
  SHOP_SUB_DE,
  SHOP_SUB_DE_BY_SQ,
  SHOP_SUB_EN,
  SHOP_SUB_EN_BY_SQ,
  SHOP_SUB_FR,
  SHOP_SUB_FR_BY_SQ,
  SHOP_SUB_IT,
  SHOP_SUB_IT_BY_SQ,
  SHOP_SUB_MK,
  SHOP_SUB_MK_BY_SQ,
  SHOP_SUB_MNE,
  SHOP_SUB_MNE_BY_SQ,
} from "@/lib/shop-directory-subcategory-i18n.generated";

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
  navHelp: string;
  homeBannerTitle: string;
  homeBannerSubtitle: string;
  homeBannerBtn: string;
  introTitle: string;
  introP1: string;
  introP2: string;
  introP3: string;
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

const CATEGORY_FR: Record<string, string> = {
  "makina-transport": "Véhicules et transport",
  patundshmeri: "Immobilier",
  "elektronike-teknologji": "Électronique et technologie",
  "shtepi-mobilje": "Maison et mobilier",
  "moda-veshje": "Mode et vêtements",
  "ndertim-instalime": "Construction et installations",
  "biznes-sherbime": "Entreprises et services professionnels",
  "femije-nena": "Enfants et mamans",
  "sport-rekreacion": "Sport et loisirs",
  "bujqesi-blegtori": "Agriculture et élevage",
  "kafshe-shtepiake": "Animaux domestiques",
  "arsim-kurse": "Éducation et cours",
  "evente-dasma": "Événements et mariages",
  "turizem-udhetimet": "Tourisme et voyages",
  "shendetesi-bukuri": "Santé et beauté",
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
    "Gjej dyqane lokale në çdo vend. {count} kategori, qindra dyqane dixhitale.",
  seoCategoryTitleSuffix: "Dyqane në KetuJemi.com",
  seoCategoryDescription:
    "Gjej dyqane {category} në Kosovë, Shqipëri dhe Maqedoni. Shiko ofertat dhe kontakto direkt.",
  seoSubcategoryTitle: "{subcategory} në {category} — KetuJemi.com",
  fuseNoResults: "Nuk u gjet asnjë dyqan për «{term}»",
  docCategoryTitle: "Dyqanet",
  navShops: "Dyqanet",
  navBuySell: "Bli & Shit",
  navHelp: "Ndihmë",
  homeBannerTitle: "Bizneset Dixhitale — Bli direkt nga bizneset me një klikim",
  homeBannerSubtitle: "{count} kategori • Qindra dyqane lokale • në çdo vend",
  homeBannerBtn: "Shiko të gjitha dyqanet →",
  introTitle: "🏪 Dyqani Dixhital — E ardhmja e tregtisë!",
  introP1:
    "Dyqani Dixhital në KetuJemi.com është prania online e çdo biznesi dhe dyqani fizik — nga dyqani i lagjës deri te kompanitë e mëdha. Çdo dyqan ka faqen e vet të personalizuar me produktet, çmimet, fotot dhe kontaktin e drejtpërdrejtë me shitësin.",
  introP2:
    "Ti nuk ke nevojë të ecësh nëpër treg, të telefonosh pa fund, apo të humbasësh kohë — me një kërkim të shpejtë gjen dyqanin që të duhet, sheh produktet që ofron, dhe kontakton direkt me pronarin — pa ndërmjetës, pa komision, pa vonesë!",
  introP3:
    "Të gjitha dyqanet në KetuJemi janë të verifikuara nga stafi ynë — kështu që ti mund të blesh me besim dhe siguri të plotë! ✅",
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
    "Најдете локални продавници на секое место. {count} категории, стотици дигитални продавници.",
  seoCategoryTitleSuffix: "Продавници на KetuJemi.com",
  seoCategoryDescription:
    "Најдете продавници за {category} во Косово, Албанија и Македонија. Погледнете понуди и контактирајте директно.",
  seoSubcategoryTitle: "{subcategory} во {category} — KetuJemi.com",
  fuseNoResults: "Не е пронајдена продавница за «{term}»",
  docCategoryTitle: "Продавници",
  navShops: "Продавници",
  navBuySell: "Купи и продавај",
  navHelp: "Помош",
  homeBannerTitle: "Дигитални бизниси — Купувајте директно од бизнисите со еден клик",
  homeBannerSubtitle: "{count} категории • Стотици локални продавници • на секое место",
  homeBannerBtn: "Види ги сите продавници →",
  introTitle: "🏪 Дигитална продавница — Иднината на трговијата!",
  introP1:
    "Дигиталната продавница на KetuJemi.com е онлајн присуство на секој бизнис и физичка продавница — од продавницата во маалото до големите компании. Секоја продавница има сопствена персонализирана страница со производи, цени, фотографии и директен контакт со продавачот.",
  introP2:
    "Не мора да шеташ низ пазарот, бесконечно да телефонираш или да губиш време — со едно брзо пребарување го наоѓаш продавницата што ти треба, ги гледаш понудените производи и директно контактираш со сопственикот — без посредник, без провизија, без доцнење!",
  introP3:
    "Сите продавници на KetuJemi се верификувани од нашиот тим — така што можеш да купуваш со целосно доверба и сигурност! ✅",
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
    "Pronađite lokalne prodavnice na svakom mjestu. {count} kategorija, stotine digitalnih prodavnica.",
  seoCategoryTitleSuffix: "Prodavnice na KetuJemi.com",
  seoCategoryDescription:
    "Pronađite prodavnice za {category} na Kosovu, u Albaniji i Makedoniji. Pogledajte ponude i kontaktirajte direktno.",
  seoSubcategoryTitle: "{subcategory} u {category} — KetuJemi.com",
  fuseNoResults: "Nije pronađena prodavnica za «{term}»",
  docCategoryTitle: "Prodavnice",
  navShops: "Prodavnice",
  navBuySell: "Kupi i prodaj",
  navHelp: "Pomoć",
  homeBannerTitle: "Digitalni biznisi — Kupujte direktno od biznisa jednim klikom",
  homeBannerSubtitle: "{count} kategorija • Stotine lokalnih prodavnica • na svakom mjestu",
  homeBannerBtn: "Pogledaj sve prodavnice →",
  introTitle: "🏪 Digitalna prodavnica — Budućnost trgovine!",
  introP1:
    "Digitalna prodavnica na KetuJemi.com je online prisustvo svakog biznisa i fizičke prodavnice — od prodavnice u komšiluku do velikih kompanija. Svaka prodavnica ima svoju personalizovanu stranicu sa proizvodima, cijenama, fotografijama i direktnim kontaktom sa prodavcem.",
  introP2:
    "Ne moraš šetati pijacu, beskonačno zvati ili gubiti vrijeme — jednom brzom pretragom nalaziš prodavnicu koja ti treba, vidiš proizvode koje nudi i direktno kontaktiraš vlasnika — bez posrednika, bez provizije, bez čekanja!",
  introP3:
    "Sve prodavnice na KetuJemi su verifikovane od strane našeg tima — tako da možeš kupovati sa potpunim povjerenjem i sigurnošću! ✅",
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
    "Find local shops everywhere. {count} categories, hundreds of digital stores.",
  seoCategoryTitleSuffix: "Shops on KetuJemi.com",
  seoCategoryDescription:
    "Find {category} shops in Kosovo, Albania and North Macedonia. Browse offers and contact directly.",
  seoSubcategoryTitle: "{subcategory} in {category} — KetuJemi.com",
  fuseNoResults: "No shop found for «{term}»",
  docCategoryTitle: "Shops",
  navShops: "Shops",
  navBuySell: "Buy & Sell",
  navHelp: "Help",
  homeBannerTitle: "Digital Businesses — Buy directly from businesses in one click",
  homeBannerSubtitle: "{count} categories • Hundreds of local shops • everywhere",
  homeBannerBtn: "View all shops →",
  introTitle: "🏪 Digital Shop — The future of commerce!",
  introP1:
    "The Digital Shop on KetuJemi.com is the online presence of every business and physical store — from the corner shop to major companies. Each shop has its own personalised page with products, prices, photos, and direct contact with the seller.",
  introP2:
    "You don't need to walk through markets, make endless calls, or waste time — with one quick search you find the shop you need, see what they offer, and contact the owner directly — no middleman, no commission, no delay!",
  introP3:
    "All shops on KetuJemi are verified by our team — so you can buy with full confidence and peace of mind! ✅",
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

const IT: ShopDirectoryCopy = {
  ...KS,
  docTitle: "Negozi — KetuJemi.com",
  seoTitle: "Online Negozi | KetuJemi.com — Find every store in one place",
  seoDescription: "Find local shops everywhere. {count} categories, hundreds of digital stores.",
  seoCategoryTitleSuffix: "Negozi on KetuJemi.com",
  seoCategoryDescription: "Find {category} shops in Kosovo, Albania and Macedonia del Nord. Browse offers and contact directly.",
  seoSubcategoryTitle: "{subcategory} in {category} — KetuJemi.com",
  fuseNoResults: "No shop found for «{term}»",
  docCategoryTitle: "Negozi",
  navShops: "Negozi",
  navBuySell: "Compra e vendi",
  navHelp: "Aiuto",
  homeBannerTitle: "Digital Businesses — Buy directly from businesses in one click",
  homeBannerSubtitle: "{count} categories • Hundreds of local shops • everywhere",
  homeBannerBtn: "Vedi tutto shops →",
  introTitle: "🏪 Digital Shop — The future of commerce!",
  introP1: "The Digital Shop on KetuJemi.com is the online presence of every business and physical store — from the corner shop to major companies. Each shop has its own personalised page with products, prices, photos, and direct contact with the seller.",
  introP2: "You don't need to walk through markets, make endless calls, or waste time — with one quick search you find the shop you need, see what they offer, and contact the owner directly — no middleman, no commission, no delay!",
  introP3: "Tutto shops on KetuJemi are verified by our team — so you can buy with full confidence and peace of mind! ✅",
  searchPlaceholder: "🔍 Cerca shops... e.g. furniture, phone, shoes",
  searchBtn: "Cerca",
  filterCity: "Città",
  filterCountry: "Paese",
  filterAll: "Tutto",
  shopsCount: "shops",
  viewShop: "Vedi negozio →",
  viewAllShops: "Vedi tutto shops →",
  noShops: "No shops in this category yet.",
  noResults: "No shops found.",
  allSubcategories: "Tutto",
  categoryNames: CATEGORY_EN,
};

const DE: ShopDirectoryCopy = {
  ...KS,
  docTitle: "Shops — KetuJemi.com",
  seoTitle: "Online Shops | KetuJemi.com — Find every store in one place",
  seoDescription: "Find local shops everywhere. {count} categories, hundreds of digital stores.",
  seoCategoryTitleSuffix: "Shops on KetuJemi.com",
  seoCategoryDescription: "Find {category} shops in Kosovo, Albanien and Nordmazedonien. Browse offers and contact directly.",
  seoSubcategoryTitle: "{subcategory} in {category} — KetuJemi.com",
  fuseNoResults: "Nein shop found for «{term}»",
  docCategoryTitle: "Shops",
  navShops: "Shops",
  navBuySell: "Kaufen & Verkaufen",
  navHelp: "Hilfe",
  homeBannerTitle: "Digital Businesses — Buy directly from businesses in one click",
  homeBannerSubtitle: "{count} categories • Hundreds of local shops • everywhere",
  homeBannerBtn: "Alle anzeigen shops →",
  introTitle: "🏪 Digital Shop — The future of commerce!",
  introP1: "The Digital Shop on KetuJemi.com is the online presence of every business and physical store — from the corner shop to major companies. Each shop has its own personalised page with products, prices, photos, and direct contact with the seller.",
  introP2: "You don't need to walk through markets, make endless calls, or waste time — with one quick search you find the shop you need, see what they offer, and contact the owner directly — no middleman, no commission, no delay!",
  introP3: "Alle shops on KetuJemi are verified by our team — so you can buy with full confidence and peace of mind! ✅",
  searchPlaceholder: "🔍 Suchen shops... e.g. furniture, phone, shoes",
  searchBtn: "Suchen",
  filterCity: "Stadt",
  filterCountry: "Land",
  filterAll: "Alle",
  shopsCount: "shops",
  viewShop: "Shop ansehen →",
  viewAllShops: "Alle anzeigen shops →",
  noShops: "Nein shops in this category yet.",
  noResults: "Nein shops found.",
  allSubcategories: "Alle",
  categoryNames: CATEGORY_EN,
};

const FR: ShopDirectoryCopy = {
  ...EN,
  docTitle: "Boutiques — KetuJemi.com",
  seoTitle: "Boutiques en ligne | KetuJemi.com — Toutes les boutiques au même endroit",
  seoDescription:
    "Trouvez des boutiques locales partout. {count} catégories, des centaines de boutiques digitales.",
  seoCategoryTitleSuffix: "Boutiques sur KetuJemi.com",
  seoCategoryDescription:
    "Trouvez des boutiques {category} au Kosovo, en Albanie et en Macédoine du Nord. Parcourez les offres et contactez directement.",
  seoSubcategoryTitle: "{subcategory} dans {category} — KetuJemi.com",
  fuseNoResults: "Aucune boutique trouvée pour «{term}»",
  docCategoryTitle: "Boutiques",
  navShops: "Boutiques",
  navBuySell: "Acheter et vendre",
  navHelp: "Aide",
  homeBannerTitle: "Entreprises digitales — Achetez directement auprès des entreprises en un clic",
  homeBannerSubtitle: "{count} catégories • Des centaines de boutiques locales • partout",
  homeBannerBtn: "Voir toutes les boutiques →",
  introTitle: "🏪 Boutique digitale — L'avenir du commerce !",
  introP1:
    "La boutique digitale sur KetuJemi.com est la présence en ligne de chaque entreprise et magasin physique — de l'épicerie du quartier aux grandes entreprises. Chaque boutique dispose de sa propre page personnalisée avec produits, prix, photos et contact direct avec le vendeur.",
  introP2:
    "Pas besoin de parcourir les marchés, d'appeler sans fin ou de perdre du temps — une recherche rapide suffit pour trouver la boutique qu'il vous faut, voir ses produits et contacter directement le propriétaire — sans intermédiaire, sans commission, sans attente !",
  introP3:
    "Toutes les boutiques sur KetuJemi sont vérifiées par notre équipe — achetez donc en toute confiance ! ✅",
  searchPlaceholder: "🔍 Rechercher une boutique... ex. mobilier, téléphone, chaussures",
  searchBtn: "Rechercher",
  filterCity: "Ville",
  filterCountry: "Pays",
  filterAll: "Tout",
  shopsCount: "boutiques",
  viewShop: "Voir la boutique →",
  viewAllShops: "Voir toutes les boutiques →",
  noShops: "Pas encore de boutique dans cette catégorie.",
  noResults: "Aucune boutique trouvée.",
  allSubcategories: "Tout",
  categoryNames: CATEGORY_FR,
};

const PAGES: Record<UiTranslationLocale, ShopDirectoryCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
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

const SUB_BY_LOCALE: Record<
  Exclude<UiTranslationLocale, "ks">,
  Record<string, string>
> = {
  mk: SHOP_SUB_MK,
  mne: SHOP_SUB_MNE,
  en: SHOP_SUB_EN,
  fr: SHOP_SUB_FR,
  de: SHOP_SUB_DE,
  it: SHOP_SUB_IT,
};

const SUB_BY_SQ_LOCALE: Record<
  Exclude<UiTranslationLocale, "ks">,
  Record<string, string>
> = {
  mk: SHOP_SUB_MK_BY_SQ,
  mne: SHOP_SUB_MNE_BY_SQ,
  en: SHOP_SUB_EN_BY_SQ,
  fr: SHOP_SUB_FR_BY_SQ,
  de: SHOP_SUB_DE_BY_SQ,
  it: SHOP_SUB_IT_BY_SQ,
};

export function translateDirectorySubcategory(
  sub: Pick<ShopDirectorySubcategory, "slug" | "nameSq">,
  locale: UiTranslationLocale,
): string {
  if (locale === "ks") return sub.nameSq;
  const bySlug = SUB_BY_LOCALE[locale]?.[sub.slug];
  if (bySlug) return bySlug;
  const bySq = SUB_BY_SQ_LOCALE[locale]?.[sub.nameSq];
  if (bySq) return bySq;
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
