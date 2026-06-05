import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const RAW = [
  ["makina-transport", "🚗", "Makina & Transport", [
    "Vetura", "Kamionë & Furgonë", "Motorr & Skuter", "Biçikleta & Trotineta", "Autobusë & Minibusë",
    "Traktorë & Makineri", "Ekskavatorë & Makineri ndërtimi", "Barka & Jete", "Kamper & Karavan", "Rimorkio",
    "Makina me qera", "Pjesë këmbimi", "Goma & Rrota", "Karoseri & Xhama", "Audio & Elektronikë makine",
    "Vajra & Kimikate", "Servisim & Riparime",
  ]],
  ["patundshmeri", "🏠", "Patundshmëri", [
    "Banesa në shitje", "Banesa me qera", "Shtëpi & Vila në shitje", "Shtëpi & Vila me qera",
    "Toka & Parcela ndërtimore", "Toka bujqësore", "Lokale biznesi në shitje", "Lokale biznesi me qera",
    "Garazha & Parkingje", "Dhoma me qera", "Apartamente turistike", "Magazina & Depoja",
    "Ndërtesa industriale", "Objekte hotelerie", "Investime & Projekte",
  ]],
  ["elektronike-teknologji", "📱", "Elektronikë & Teknologji", [
    "Telefona celularë", "Laptopë", "Kompjuterë & PC", "Tabletë & iPad", "TV & Monitorë", "Kamera & Foto",
    "Kamera sigurie & CCTV", "Gaming & Konzol", "PlayStation & Xbox & Nintendo", "Smartwatch & Wearables",
    "Drone", "Printerë & Skaner", "Projektor", "Komponentë PC", "Hard disk & SSD", "Router & Networking",
    "Aksesorë telefoni", "Aksesorë laptop", "Bateri & Karikues", "Kufje & Altoparlantë", "Mikrofon & Studio",
    "Smart Home",
  ]],
  ["shtepi-mobilje", "🏡", "Shtëpi & Mobilje", [
    "Mobilje sallon", "Mobilje dhome gjumi", "Mobilje kuzhine", "Mobilje banje", "Mobilje zyre",
    "Mobilje ballkoni & Kopshti", "Mobilje fëmijësh", "Krevat & Dyshekë", "Tavolina & Karriget",
    "Dollap & Kasaforta", "Frigorifer & Ngrirës", "Lavatriçe & Tharëse", "Kuzhinë & Sobë", "Enë kuzhine",
    "Mikser & Kafemakina", "Aspirator & Fshesa", "Ngrohës & Radiator", "Klima & Ventilator",
    "Shpore druri & Oxhakë", "Ndriçim & Llamba", "Perde & Tapete", "Dekorime & Tabllo", "Bimë & Lule",
    "Banja & Sanitari", "Pllaka & Mozaik", "Dritare & Dyer", "Gardhe & Porta", "Çatia & Izolimi",
    "Materiale ndërtimi", "Ngjyra & Suva", "Sisteme ujësjellësi", "Sisteme elektrike", "Sisteme alarmi",
    "Mjete pune", "Skeleri & Pajisje ndërtimi",
  ]],
  ["moda-veshje", "👗", "Moda & Veshje", [
    "Rroba femra", "Rroba meshkuj", "Rroba fëmijë", "Rroba bebësh", "Xhinse & Pantallona", "Bluza & Këmisha",
    "Fustane & Fund", "Xhaketa & Pallto", "Kostume & Smokingje", "Rroba sportive", "Rroba plazhi",
    "Rroba nate & Brendëshme", "Rroba pune & Uniforma", "Veshje tradicionale", "Këpucë femra", "Këpucë meshkuj",
    "Këpucë fëmijësh", "Çizme & Shablla", "Atlete & Sneakers", "Sandale & Shapka", "Çanta femra", "Çanta meshkuj",
    "Çanta shpine", "Portofola", "Bizhuteri ari & argjendi", "Bizhuteri fashion", "Orë femra", "Orë meshkuj",
    "Syze dielli", "Syze optike", "Parfume femra", "Parfume meshkuj", "Kozmetikë & Makeup", "Kujdes lëkure",
    "Kujdes flokësh", "Produkte hijenie",
  ]],
  ["pune-sherbime", "💼", "Punë & Shërbime", [
    "Oferta pune (kohë të plotë)", "Oferta pune (kohë të pjesshme)", "Kërkoj punë", "Punë sezonale",
    "Punë jashtë vendit", "Instalime elektrike", "Instalime hidraulike & Ujësjellës", "Instalime ngrohje & Klima",
    "Instalime kamera & Alarme", "Instalime rrjeta & Internet", "Instalime solar & Panele diellore",
    "Ndërtim & Muraturë", "Gipsi & Suvatime", "Pllakosje & Mozaik", "Bojatisje & Dekorim",
    "Riparim çatie & Izolim", "Riparim dyshemeje & Parket", "Riparim dritaresh & dyerve",
    "Riparim makine & Servisim", "Riparim elektronike & Telefona", "Riparim pajisje shtëpie",
    "Pastrim shtëpish & Zyrave", "Pastrim industrial", "Dezinfektim & Deratizim", "Transport mallrash",
    "Transport njerëzish", "Shpërndarje & Korrieri", "Lëvizje furniture", "Fotografi & Videografi",
    "Dizajn grafik & Logo", "Web dizajn & Zhvillim", "Marketing & Social media", "Përkthim & Interpretim",
    "Kontabilitet & Tatim", "Avokatë & Juridik", "Noterë & Kadastër", "Sigurime", "Konsulencë biznesi",
    "Catering & Gatim", "Kujdes pleqsh & Fëmijësh", "Mësimdhënie private", "Shërbime varrezash",
    "Shitja me shumicë", "Importim & Eksportim", "Franchise & Partneritet",
  ]],
  ["femije-nena", "👶", "Fëmijë & Nëna", [
    "Rroba fëmijësh 0-3 vjeç", "Rroba fëmijësh 4-12 vjeç", "Rroba bebësh", "Këpucë fëmijësh", "Karrocë bebeje",
    "Krevat & Djep bebeje", "Kolltuk makine për fëmijë", "Lodra edukative", "Lodra për bebë", "Lodra për fëmijë",
    "Lego & Konstruktivë", "Kukulla & Figura aksioni", "Biçikleta fëmijësh", "Trotineta fëmijësh",
    "Trampolinë & Rrëshqitëse", "Gaming fëmijësh", "Libra fëmijësh", "Libra shkollor fillor",
    "Libra shkollor mesëm", "Materiale shkollore", "Produkte nëna", "Ushqime bebeje", "Produkte shtatzënie",
    "Çerdhe & Kopsht", "Animacion & Festa fëmijësh",
  ]],
  ["sport-rekreacion", "⚽", "Sport & Rekreacion", [
    "Futboll & Aksesorë", "Basketboll & Volejboll", "Tenis & Ping-pong", "Palestër & Fitness",
    "Biçikleta sport", "Vrapim & Atletizëm", "Noti & Plazh", "Ski & Sportet dimërore", "Gjueti & Armë sportive",
    "Peshkim & Aksesorë", "Kampim & Hiking", "Alpinizëm & Skalim", "Kajak & Sportet ujore",
    "Arte marciale & Boks", "Yoga & Pilates", "Instrumente muzikore", "Muzikë elektronike & DJ",
    "Libra & Revista", "Koleksione & Antika", "Bileta evente & Koncerte", "Pajisje fotografie & Video",
  ]],
  ["bujqesi-blegtori", "🌾", "Bujqësi & Blegtori", [
    "Lopë & Viça", "Delet & Dhitë", "Derrat", "Shpendë (pula, rosa)", "Bletë & Produkte bletarie", "Kuaj",
    "Kafshë të tjera bujqësore", "Traktorë", "Kombajne & Makineri të rënda", "Plugje & Frezë",
    "Sisteme ujitjeje", "Sera & Pajisje sere", "Fara & Fidane", "Plehra organike & Kimike",
    "Pesticide & Herbicide", "Perime & Fruta", "Produkte blegtorale", "Drurë frutorë & Bimë", "Pylltari & Dru zjarri",
  ]],
  ["kafshe-shtepiake", "🐾", "Kafshë Shtëpiake", [
    "Qen (shitje & adoptim)", "Mace (shitje & adoptim)", "Shpendë (papagaj, kanarina)", "Peshq & Akuariume",
    "Brejtës (lepuj, hamster)", "Reptile & Egzotike", "Ushqim qensh", "Ushqim macesh", "Aksesorë kafshësh",
    "Shtretër & Kafaze", "Veshje kafshësh", "Kozmetikë kafshësh", "Veteriner & Shërbime",
    "Strehim & Pension kafshësh", "Trajnim kafshësh",
  ]],
  ["arsim-kurse", "🎓", "Arsim & Kurse", [
    "Mësimdhënie private matematikë", "Mësimdhënie private gjuhë shqipe", "Kurse anglisht", "Kurse gjermanisht",
    "Kurse italishte & frëngjishte", "Kurse turqishte & arabe", "Kurse IT & Programim", "Kurse dizajn grafik",
    "Kurse marketing dixhital", "Kurse kontabiliteti", "Kurse shoferësh", "Kurse profesionale",
    "Kurse gatimi & pastiçeri", "Kurse kozmetike & bukurie", "Kurse fotografie & video", "Libra universitar",
    "Libra shkollor", "Materiale provimesh", "Diploma & Certifikata",
  ]],
  ["evente-dasma", "🎉", "Evente & Dasma", [
    "Salla dasmash", "Salla festash & Eventesh", "Fotograf dasme", "Videograf dasme", "Katering & Menuja",
    "Ëmbëlsira & Torta dasmash", "Dekorime dasmash & Lule", "Veshje nusesh", "Veshje dhëndrit",
    "Veshje ceremoniale", "Muzikë & Orkestra", "DJ & Sistem zëri", "Animacion & Spektakël",
    "Makina dasme & Kortezh", "Hotele & Fjetje", "Organizim eventesh", "Ftesa & Shtyp",
  ]],
  ["turizem-udhetime", "✈️", "Turizëm & Udhëtime", [
    "Apartamente turistike", "Vila & Shtëpi pushimi", "Hotele & Pensione", "Camping & Karavane",
    "Bileta avioni", "Paketa turistike", "Makina me qera", "Guidë turistike", "Aktivitete aventure",
    "Plazhe & Spa", "Udhëtime grupore",
  ]],
  ["shendetesi-bukuri", "🏥", "Shëndetësi & Bukuri", [
    "Pajisje mjekësore", "Karrige & Karrocë invalidësh", "Suplementa & Vitamina", "Produkte shëndetësore",
    "Kozmetikë & Makeup profesional", "Sallon bukurie", "Sallon flokësh", "Masazh & Relaksim",
    "Optikë & Syze mjekësore", "Stomatolog & Dentist", "Fizioterapi & Rehabilitim", "Psikolog & Këshillim",
    "Produkte dietë & Humbje peshe", "Produkte shtatzënie & Nëna",
  ]],
];

const categories = RAW.map(([slug, emoji, nameSq, subs]) => ({
  slug,
  emoji,
  nameSq,
  subcategories: subs.map((nameSq) => ({ slug: slugify(nameSq), nameSq })),
}));

const listingSlugMap = {
  vetura: "makina-transport",
  "motorr-skuter": "makina-transport",
  "kamione-furgone": "makina-transport",
  "auto-pjese": "makina-transport",
  "banesa-shtepi": "patundshmeri",
  "lokale-zyre": "patundshmeri",
  telefona: "elektronike-teknologji",
  "kompjutere-laptope": "elektronike-teknologji",
  "tv-elektronike": "elektronike-teknologji",
  "mobilje-dekorime": "shtepi-mobilje",
  "rroba-kepuce": "moda-veshje",
  femije: "femije-nena",
  "sport-outdoor": "sport-rekreacion",
  "pune-sherbime": "pune-sherbime",
  "bujqesi-blegtori": "bujqesi-blegtori",
  kafshet: "kafshe-shtepiake",
  "arsim-kurse": "arsim-kurse",
  "muzike-hobby": "sport-rekreacion",
};

const out = `/** Auto-generated — run ketujemi-2/scripts/build-shop-directory-taxonomy.mjs */
export type ShopDirectorySubcategory = { slug: string; nameSq: string };
export type ShopDirectoryCategory = {
  slug: string;
  emoji: string;
  nameSq: string;
  subcategories: ShopDirectorySubcategory[];
};

export const SHOP_DIRECTORY_CATEGORIES: ShopDirectoryCategory[] = ${JSON.stringify(categories, null, 2)};

export const LISTING_PARENT_SLUG_TO_DIRECTORY: Record<string, string> = ${JSON.stringify(listingSlugMap, null, 2)};

export function directoryCategoryBySlug(slug: string): ShopDirectoryCategory | undefined {
  return SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === slug);
}

export function directorySubcategoryBySlug(categorySlug: string, subSlug: string): ShopDirectorySubcategory | undefined {
  return directoryCategoryBySlug(categorySlug)?.subcategories.find((s) => s.slug === subSlug);
}

export function guessDirectoryCategoryFromListingSlug(listingParentSlug: string | null | undefined): string | null {
  if (!listingParentSlug) return null;
  const key = listingParentSlug.trim().toLowerCase();
  return LISTING_PARENT_SLUG_TO_DIRECTORY[key] ?? null;
}

export function defaultSubcategoryForCategory(categorySlug: string): string | null {
  return directoryCategoryBySlug(categorySlug)?.subcategories[0]?.slug ?? null;
}
`;

writeFileSync(join(__dirname, "../lib/shop-directory-taxonomy.ts"), out, "utf8");
console.log("Wrote shop-directory-taxonomy.ts with", categories.length, "categories");
