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
  introApplyTitle: string;
  introApplyText: string;
  introApplyBtn: string;
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

const CATEGORY_DE: Record<string, string> = {
  "makina-transport": "Fahrzeuge & Transport",
  patundshmeri: "Immobilien",
  "elektronike-teknologji": "Elektronik & Technologie",
  "shtepi-mobilje": "Haus & Möbel",
  "moda-veshje": "Mode & Kleidung",
  "ndertim-instalime": "Bau & Installationen",
  "biznes-sherbime": "Business & professionelle Dienstleistungen",
  "femije-nena": "Kinder & Mütter",
  "sport-rekreacion": "Sport & Freizeit",
  "bujqesi-blegtori": "Landwirtschaft & Viehzucht",
  "kafshe-shtepiake": "Haustiere",
  "arsim-kurse": "Bildung & Kurse",
  "evente-dasma": "Events & Hochzeiten",
  "turizem-udhetimet": "Tourismus & Reisen",
  "shendetesi-bukuri": "Gesundheit & Schönheit",
};

const CATEGORY_IT: Record<string, string> = {
  "makina-transport": "Veicoli e trasporti",
  patundshmeri: "Immobiliare",
  "elektronike-teknologji": "Elettronica e tecnologia",
  "shtepi-mobilje": "Casa e arredamento",
  "moda-veshje": "Moda e abbigliamento",
  "ndertim-instalime": "Edilizia e installazioni",
  "biznes-sherbime": "Business e servizi professionali",
  "femije-nena": "Bambini e mamme",
  "sport-rekreacion": "Sport e tempo libero",
  "bujqesi-blegtori": "Agricoltura e zootecnia",
  "kafshe-shtepiake": "Animali domestici",
  "arsim-kurse": "Formazione e corsi",
  "evente-dasma": "Eventi e matrimoni",
  "turizem-udhetimet": "Turismo e viaggi",
  "shendetesi-bukuri": "Salute e bellezza",
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
  homeBannerTitle: "Bizneset dhe Zyrat Dixhitale — Lidhu direkt me ta me një klikim.",
  homeBannerSubtitle: "{count} kategori • Qindra biznese dhe zyra lokale • në çdo vend",
  homeBannerBtn: "Shiko të gjithë bizneset →",
  introTitle: "Hapësira Dixhitale — E ardhmja e tregtisë dhe shërbimeve!",
  introP1:
    "Hapësira Dixhitale në KetuJemi.com është prania online e çdo biznesi, dyqani, firme apo zyre — nga biznesi i vogël lokal deri te kompanitë e mëdha. Çdo partner ka faqen e vet të personalizuar me produktet, shërbimet, çmimet, fotot dhe kontaktin e drejtpërdrejtë me shitësin apo ofruesin e shërbimit.",
  introP2:
    "Ti nuk ke nevojë të ecësh nëpër treg, të telefonosh pa fund, apo të humbasësh kohë — me një kërkim të shpejtë gjen biznesin që të duhet, sheh atë që ofron, dhe kontakton direkt me pronarin — pa ndërmjetës, pa komision, pa vonesë!",
  introP3:
    "Të gjitha bizneset në KetuJemi janë të verifikuara nga stafi ynë — kështu që ti mund të bashkëpunosh apo blesh me besim dhe siguri të plotë!",
  introApplyTitle: "Ke biznes apo zyrë?",
  introApplyText:
    "Apliko për profilin tënd dixhital — stafi ynë e shqyrton kërkesën dhe e aktivizon brenda 24 orëve.",
  introApplyBtn: "Apliko tani →",
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
  homeBannerTitle: "Дигитални бизниси и канцеларии — Поврзете се директно со еден клик.",
  homeBannerSubtitle: "{count} категории • Стотици локални бизниси и канцеларии • на секое место",
  homeBannerBtn: "Види ги сите бизниси →",
  introTitle: "Дигитален простор — Иднината на трговијата и услугите!",
  introP1:
    "Дигиталниот простор на KetuJemi.com е онлајн присуство на секој бизнис, продавница, фирма или канцеларија — од малиот локален бизнис до големите компании. Секој партнер има сопствена персонализирана страница со производи, услуги, цени, фотографии и директен контакт со продавачот или давателот на услугата.",
  introP2:
    "Не мора да шеташ низ пазарот, бесконечно да телефонираш или да губиш време — со едно брзо пребарување го наоѓаш бизнисот што ти треба, го гледаш она што нуди и директно контактираш со сопственикот — без посредник, без провизија, без доцнење!",
  introP3:
    "Сите бизниси на KetuJemi се верификувани од нашиот тим — така што можеш да соработуваш или купуваш со целосно доверба и сигурност!",
  introApplyTitle: "Имате бизнис или канцеларија?",
  introApplyText:
    "Аплицирајте за вашиот дигитален профил — тимот ја разгледува барањето и ја активира во рок од 24 часа.",
  introApplyBtn: "Аплицирајте сега →",
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
  homeBannerTitle: "Digitalni biznisi i uredi — Povežite se direktno jednim klikom.",
  homeBannerSubtitle: "{count} kategorija • Stotine lokalnih biznisa i ureda • na svakom mjestu",
  homeBannerBtn: "Pogledaj sve biznise →",
  introTitle: "Digitalni prostor — Budućnost trgovine i usluga!",
  introP1:
    "Digitalni prostor na KetuJemi.com je online prisustvo svakog biznisa, prodavnice, firme ili ureda — od malog lokalnog biznisa do velikih kompanija. Svaki partner ima svoju personalizovanu stranicu sa proizvodima, uslugama, cijenama, fotografijama i direktnim kontaktom sa prodavcem ili pružaocem usluge.",
  introP2:
    "Ne moraš šetati pijacu, beskonačno zvati ili gubiti vrijeme — jednom brzom pretragom nalaziš biznis koji ti treba, vidiš šta nudi i direktno kontaktiraš vlasnika — bez posrednika, bez provizije, bez čekanja!",
  introP3:
    "Svi biznisi na KetuJemi su verifikovani od strane našeg tima — tako da možeš saradjivati ili kupovati sa potpunim povjerenjem i sigurnošću!",
  introApplyTitle: "Imate biznis ili ured?",
  introApplyText:
    "Prijavite se za svoj digitalni profil — tim pregleda zahtjev i aktivira ga u roku od 24 sata.",
  introApplyBtn: "Prijavi se sada →",
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
  homeBannerTitle: "Digital Businesses and Offices — Connect directly with one click.",
  homeBannerSubtitle: "{count} categories • Hundreds of local businesses and offices • everywhere",
  homeBannerBtn: "View all businesses →",
  introTitle: "Digital Space — The future of trade and services!",
  introP1:
    "The Digital Space on KetuJemi.com is the online presence of every business, shop, firm, or office — from small local businesses to large companies. Each partner has their own personalised page with products, services, prices, photos, and direct contact with the seller or service provider.",
  introP2:
    "You don't need to walk through markets, make endless calls, or waste time — with one quick search you find the business you need, see what they offer, and contact the owner directly — no middleman, no commission, no delay!",
  introP3:
    "All businesses on KetuJemi are verified by our team — so you can work together or buy with full confidence and peace of mind!",
  introApplyTitle: "Have a business or office?",
  introApplyText:
    "Apply for your digital profile — our team reviews your request and activates it within 24 hours.",
  introApplyBtn: "Apply now →",
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
  ...EN,
  docTitle: "Negozi — KetuJemi.com",
  seoTitle: "Negozi online | KetuJemi.com — Trova ogni negozio in un unico posto",
  seoDescription:
    "Trova negozi locali ovunque. {count} categorie, centinaia di negozi digitali.",
  seoCategoryTitleSuffix: "Negozi su KetuJemi.com",
  seoCategoryDescription:
    "Trova negozi {category} in Kosovo, Albania e Macedonia del Nord. Sfoglia le offerte e contatta direttamente.",
  seoSubcategoryTitle: "{subcategory} in {category} — KetuJemi.com",
  fuseNoResults: "Nessun negozio trovato per «{term}»",
  docCategoryTitle: "Negozi",
  navShops: "Negozi",
  navBuySell: "Compra e vendi",
  navHelp: "Aiuto",
  homeBannerTitle: "Business e uffici digitali — Collegati direttamente con un clic.",
  homeBannerSubtitle: "{count} categorie • Centinaia di business e uffici locali • ovunque",
  homeBannerBtn: "Vedi tutti i business →",
  introTitle: "Spazio digitale — Il futuro del commercio e dei servizi!",
  introP1:
    "Lo spazio digitale su KetuJemi.com è la presenza online di ogni attività, negozio, impresa o ufficio — dal piccolo business locale alle grandi aziende. Ogni partner ha la propria pagina personalizzata con prodotti, servizi, prezzi, foto e contatto diretto con il venditore o il fornitore del servizio.",
  introP2:
    "Non devi girare per i mercati, telefonare all'infinito o perdere tempo — con una ricerca veloce trovi l'attività che ti serve, vedi cosa offre e contatti direttamente il proprietario — senza intermediari, senza commissioni, senza attese!",
  introP3:
    "Tutte le attività su KetuJemi sono verificate dal nostro team — così puoi collaborare o acquistare con piena fiducia e tranquillità!",
  introApplyTitle: "Hai un'attività o un ufficio?",
  introApplyText:
    "Richiedi il tuo profilo digitale — il nostro team esamina la richiesta e lo attiva entro 24 ore.",
  introApplyBtn: "Richiedi ora →",
  searchPlaceholder: "🔍 Cerca negozio... es. mobili, telefono, scarpe",
  searchBtn: "Cerca",
  filterCity: "Città",
  filterCountry: "Paese",
  filterAll: "Tutti",
  shopsCount: "negozi",
  viewShop: "Vedi negozio →",
  viewAllShops: "Vedi tutti i negozi →",
  noShops: "Non ci sono ancora negozi in questa categoria.",
  noResults: "Nessun negozio trovato.",
  allSubcategories: "Tutti",
  categoryNames: CATEGORY_IT,
};

const DE: ShopDirectoryCopy = {
  ...EN,
  docTitle: "Shops — KetuJemi.com",
  seoTitle: "Online-Shops | KetuJemi.com — Jeden Shop an einem Ort finden",
  seoDescription:
    "Finden Sie lokale Shops überall. {count} Kategorien, Hunderte digitaler Geschäfte.",
  seoCategoryTitleSuffix: "Shops auf KetuJemi.com",
  seoCategoryDescription:
    "Finden Sie {category}-Shops in Kosovo, Albanien und Nordmazedonien. Angebote ansehen und direkt kontaktieren.",
  seoSubcategoryTitle: "{subcategory} in {category} — KetuJemi.com",
  fuseNoResults: "Kein Shop gefunden für «{term}»",
  docCategoryTitle: "Shops",
  navShops: "Shops",
  navBuySell: "Kaufen & Verkaufen",
  navHelp: "Hilfe",
  homeBannerTitle: "Digitale Unternehmen und Büros — Direkt mit einem Klick verbinden.",
  homeBannerSubtitle: "{count} Kategorien • Hunderte lokaler Unternehmen und Büros • überall",
  homeBannerBtn: "Alle Unternehmen ansehen →",
  introTitle: "Digitaler Raum — Die Zukunft von Handel und Dienstleistungen!",
  introP1:
    "Der digitale Raum auf KetuJemi.com ist die Online-Präsenz jedes Unternehmens, Ladens, jeder Firma oder jedes Büros — vom kleinen lokalen Betrieb bis zu großen Firmen. Jeder Partner hat seine eigene personalisierte Seite mit Produkten, Dienstleistungen, Preisen, Fotos und direktem Kontakt zum Verkäufer oder Dienstleister.",
  introP2:
    "Sie müssen nicht über Märkte laufen, endlos telefonieren oder Zeit verlieren — mit einer schnellen Suche finden Sie das Unternehmen, das Sie brauchen, sehen das Angebot und kontaktieren den Inhaber direkt — ohne Vermittler, ohne Provision, ohne Verzögerung!",
  introP3:
    "Alle Unternehmen auf KetuJemi werden von unserem Team verifiziert — so können Sie mit vollem Vertrauen und Sicherheit zusammenarbeiten oder einkaufen!",
  introApplyTitle: "Haben Sie ein Unternehmen oder ein Büro?",
  introApplyText:
    "Beantragen Sie Ihr digitales Profil — unser Team prüft die Anfrage und aktiviert es innerhalb von 24 Stunden.",
  introApplyBtn: "Jetzt beantragen →",
  searchPlaceholder: "🔍 Shop suchen... z. B. Möbel, Telefon, Schuhe",
  searchBtn: "Suchen",
  filterCity: "Stadt",
  filterCountry: "Land",
  filterAll: "Alle",
  shopsCount: "Shops",
  viewShop: "Shop ansehen →",
  viewAllShops: "Alle Shops ansehen →",
  noShops: "In dieser Kategorie gibt es noch keine Shops.",
  noResults: "Keine Shops gefunden.",
  allSubcategories: "Alle",
  categoryNames: CATEGORY_DE,
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
  homeBannerTitle: "Entreprises et bureaux digitaux — Connectez-vous directement en un clic.",
  homeBannerSubtitle: "{count} catégories • Des centaines d'entreprises et bureaux locaux • partout",
  homeBannerBtn: "Voir toutes les entreprises →",
  introTitle: "Espace digital — L'avenir du commerce et des services !",
  introP1:
    "L'espace digital sur KetuJemi.com est la présence en ligne de chaque entreprise, boutique, firme ou bureau — du petit commerce local aux grandes sociétés. Chaque partenaire dispose de sa propre page personnalisée avec produits, services, prix, photos et contact direct avec le vendeur ou le prestataire de services.",
  introP2:
    "Pas besoin de parcourir les marchés, d'appeler sans fin ou de perdre du temps — une recherche rapide suffit pour trouver l'entreprise qu'il vous faut, voir ce qu'elle propose et contacter directement le propriétaire — sans intermédiaire, sans commission, sans attente !",
  introP3:
    "Toutes les entreprises sur KetuJemi sont vérifiées par notre équipe — vous pouvez donc collaborer ou acheter en toute confiance et sécurité !",
  introApplyTitle: "Vous avez une entreprise ou un bureau ?",
  introApplyText:
    "Demandez votre profil digital — notre équipe examine la demande et l'active sous 24 heures.",
  introApplyBtn: "Demander maintenant →",
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
