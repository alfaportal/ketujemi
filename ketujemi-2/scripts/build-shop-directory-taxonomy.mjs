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
    "Vetura", "Kamionë & Furgonë", "Motorr & Skuter", "Biçikleta & Trotineta elektrike", "Autobusë & Minibusë",
    "Traktorë & Makineri bujqësore", "Ekskavatorë & Makineri ndërtimi", "Barka & Jete", "Kamper & Karavan", "Rimorkio",
    "Makina me qera", "Servisim & Riparime auto", "Pjesë këmbimi & Aksesorë", "Goma & Rrota", "Karoseri & Xhama",
    "Audio & Elektronikë makine", "Vajra & Kimikate auto",
  ]],
  ["patundshmeri", "🏠", "Patundshmëri", [
    "Banesa në shitje", "Banesa me qera", "Shtëpi & Vila në shitje", "Shtëpi & Vila me qera",
    "Toka & Parcela ndërtimore", "Toka bujqësore", "Lokale biznesi në shitje", "Lokale biznesi me qera",
    "Garazha & Parkingje", "Dhoma me qera", "Apartamente turistike", "Magazina & Depoja",
    "Ndërtesa industriale & Fabrika", "Investime & Projekte",
  ]],
  ["elektronike-teknologji", "📱", "Elektronikë & Teknologji", [
    "Telefona celularë", "Laptopë", "Kompjuterë & PC Desktop", "Tabletë & iPad", "TV & Monitorë", "Kamera & Foto",
    "Kamera sigurie & CCTV", "Gaming & Konzol", "Smartwatch & Wearables", "Drone & Aksesorë", "Printerë & Skaner",
    "Komponentë PC", "Hard disk & SSD & USB", "Router & Networking", "Aksesorë telefoni & laptop",
    "Bateri & Karikues", "Kufje & Altoparlantë", "Smart Home & Automatizim", "Riparim elektronike & Telefona",
  ]],
  ["shtepi-mobilje", "🏡", "Shtëpi & Mobilje", [
    "Mobilje sallon & Dhome ndeje", "Mobilje dhome gjumi", "Mobilje kuzhine", "Mobilje banje", "Mobilje zyre",
    "Mobilje ballkoni & Kopshti", "Krevat & Dyshekë", "Tavolina & Karriget", "Dollap & Kasaforta",
    "Frigorifer & Ngrirës", "Lavatriçe & Tharëse", "Kuzhinë & Sobë", "Enë kuzhine & Aksesorë",
    "Mikser & Blender & Kafemakina", "Aspirator & Fshesa elektrike", "Ngrohës & Radiator", "Klima & Ventilator",
    "Shpore druri & Oxhakë", "Ndriçim & Llamba", "Perde & Tapete & Dyshekë dyshemeje", "Dekorime & Tabllo & Pasqyra",
    "Bimë & Lule & Vazo", "Banja & Sanitari & Vaskë", "Pllaka & Mozaik & Parket", "Dritare & Dyer & Korniza",
    "Gardhe & Porta & Hekurishtë", "Çatia & Izolimi", "Materiale ndërtimi", "Ngjyra & Llaq & Suva",
    "Sisteme ujësjellësi & Kanalizimi", "Sisteme elektrike & Kabllo", "Sisteme alarmi & Kamera sigurie",
    "Mjete pune & Makina", "Skeleri & Pajisje ndërtimi",
  ]],
  ["moda-veshje", "👗", "Moda & Veshje", [
    "Rroba femra", "Rroba meshkuj", "Rroba fëmijë & Bebë", "Xhinse & Pantallona", "Bluza & Këmisha",
    "Fustane & Fund", "Xhaketa & Pallto & Kapele", "Kostume & Smokingje", "Rroba sportive & Vrapimi",
    "Rroba plazhi & Noti", "Rroba nate & Brendëshme", "Rroba pune & Uniforma", "Veshje tradicionale & Kombëtare",
    "Këpucë femra", "Këpucë meshkuj", "Këpucë fëmijësh", "Çizme & Shablla", "Atlete & Sneakers", "Sandale & Shapka",
    "Çanta femra & meshkuj", "Çanta shpine & Udhëtimi", "Portofola & Aksesorë", "Bizhuteri ari & argjendi",
    "Bizhuteri fashion & Costume", "Orë femra & meshkuj", "Syze dielli & optike", "Parfume femra & meshkuj",
    "Kozmetikë & Makeup", "Kujdes lëkure & Serume", "Kujdes flokësh & Ngjyra", "Produkte hijenie & Parfumeri",
  ]],
  ["ndertim-instalime", "🔧", "Ndërtim & Instalime", [
    "Ndërtim & Muraturë", "Gipsi & Suvatime", "Pllakosje & Mozaik", "Bojatisje & Dekorim",
    "Riparim çatie & Izolim", "Riparim dyshemeje & Parket", "Riparim dritaresh & dyerve",
    "Instalime elektrike", "Instalime hidraulike & Ujësjellës", "Instalime ngrohje & Klima",
    "Instalime kamera & Alarme", "Instalime rrjeta & Internet", "Instalime solar & Panele diellore",
    "Lëvizje furniture & Transport", "Pastrim shtëpish & Zyrave", "Pastrim industrial & Dezinfektim",
    "Mirëmbajtje & Riparime të përgjithshme",
  ]],
  ["biznes-sherbime", "💼", "Biznes & Shërbime Profesionale", [
    "Oferta pune (kohë të plotë)", "Oferta pune (kohë të pjesshme & Sezonale)", "Kërkoj punë", "Punë jashtë vendit",
    "Fotografi & Videografi", "Dizajn grafik & Logo & Branding", "Web dizajn & Zhvillim & App",
    "Marketing & Social media", "Përkthim & Interpretim", "Kontabilitet & Tatim & Auditim",
    "Avokatë & Shërbime juridike", "Noterë & Kadastër", "Sigurime", "Konsulencë biznesi",
    "Shitja me shumicë & Importim", "Franchise & Partneritet", "Catering & Gatim & Banket",
    "Kujdes pleqsh & Fëmijësh", "Shërbime varrezash & Ceremoniale", "Dezinfektim & Deratizim",
  ]],
  ["femije-nena", "👶", "Fëmijë & Nëna", [
    "Rroba fëmijësh 0-3 vjeç", "Rroba fëmijësh 4-12 vjeç", "Rroba bebësh & Newborn", "Këpucë fëmijësh",
    "Karrocë bebeje", "Krevat & Djep bebeje", "Kolltuk makine për fëmijë", "Lodra edukative", "Lodra për bebë",
    "Lodra për fëmijë", "Lego & Konstruktivë & Puzzle", "Kukulla & Figura aksioni",
    "Biçikleta & Trotineta fëmijësh", "Trampolinë & Rrëshqitëse", "Gaming fëmijësh", "Libra fëmijësh & Edukative",
    "Libra shkollor", "Materiale shkollore", "Produkte nëna & Shtatzënie", "Ushqime bebeje & Suplementa",
    "Çerdhe & Kopsht (shërbime)", "Animacion & Festa fëmijësh",
  ]],
  ["sport-rekreacion", "⚽", "Sport & Rekreacion", [
    "Futboll & Aksesorë", "Basketboll & Volejboll & Handball", "Tenis & Ping-pong & Badminton",
    "Palestër & Fitness & Bodybuilding", "Biçikleta sport & MTB", "Vrapim & Atletizëm", "Noti & Plazh & Sporte ujore",
    "Ski & Snowboard & Sportet dimërore", "Gjueti & Armë sportive", "Peshkim & Aksesorë",
    "Kampim & Hiking & Trekking", "Alpinizëm & Skalim", "Arte marciale & Boks & Karate",
    "Yoga & Pilates & Meditim", "Instrumente muzikore", "Muzikë elektronike & DJ & Studio",
    "Koleksione & Antika & Vintage", "Bileta evente & Koncerte & Sport", "Pajisje fotografie & Video hobist",
  ]],
  ["bujqesi-blegtori", "🌾", "Bujqësi & Blegtori", [
    "Lopë & Viça", "Delet & Dhitë", "Derrat & Lepujt", "Shpendë (pula, rosa, gjelat, pata)",
    "Bletë & Produkte bletarie & Mjaltë", "Kuaj & Mushka", "Kafshë të tjera bujqësore",
    "Traktorë & Kombajne", "Makineri bujqësore të rënda", "Plugje & Frezë & Kultivatorë",
    "Sisteme ujitjeje & Pika", "Sera & Tunele & Pajisje sere", "Fara & Fidane & Bulbe",
    "Plehra organike & Kimike", "Pesticide & Herbicide & Fungicide", "Perime & Fruta & Produkte sezonale",
    "Produkte blegtorale (qumësht, djathë, mish)", "Drurë frutorë & Bimë dekorative", "Pylltari & Dru zjarri & Biomasë",
  ]],
  ["kafshe-shtepiake", "🐾", "Kafshë Shtëpiake", [
    "Qen (shitje & adoptim)", "Mace (shitje & adoptim)", "Shpendë (papagaj, kanarina, zogu)",
    "Peshq & Akuariume & Terrariume", "Brejtës (lepuj, hamster, guinea pig)", "Reptile & Egzotike",
    "Ushqim qensh & macesh", "Ushqim kafshësh të tjera", "Aksesorë & Lodra kafshësh", "Shtretër & Kafaze & Shtëpiza",
    "Veshje & Aksesorë mode kafshësh", "Kozmetikë & Tualetim kafshësh", "Veteriner & Shërbime mjekësore",
    "Strehim & Pension kafshësh", "Trajnim & Edukim kafshësh",
  ]],
  ["arsim-kurse", "🎓", "Arsim & Kurse", [
    "Mësimdhënie private (matematikë, fizikë, kimi)", "Mësimdhënie private (gjuhë shqipe & letërsi)",
    "Mësimdhënie private (histori, gjeografi)", "Kurse anglisht (të gjitha nivelet)", "Kurse gjermanisht",
    "Kurse italishte & frëngjishte", "Kurse turqishte & arabe", "Kurse IT & Programim & Web",
    "Kurse dizajn grafik & UI/UX", "Kurse marketing dixhital & SEO", "Kurse kontabiliteti & financë",
    "Kurse shoferësh (A, B, C, D, E)", "Kurse elektricist & hidraulik", "Kurse gatimi & pastiçeri & bukëpjekje",
    "Kurse kozmetike & estetikë", "Kurse fotografie & video & editim", "Kurse gjuhë shenjash",
    "Libra universitar & profesional", "Libra shkollor (fillor & mesëm & lartë)", "Materiale provimesh & Teste",
    "Diploma & Certifikata & Nostrifikime",
  ]],
  ["evente-dasma", "🎉", "Evente & Dasma", [
    "Salla dasmash", "Salla festash & Eventesh & Konferencash", "Fotograf dasme & Evente", "Videograf dasme & Evente",
    "Katering & Menuja & Buffet", "Ëmbëlsira & Torta dasmash & Sheqerpare", "Dekorime dasmash & Lule & Buqeta",
    "Veshje nusesh & Kostume dasmash", "Veshje dhëndrit & Smoking", "Veshje ceremoniale & Festive",
    "Muzikë & Orkestra & Trupë artistike", "DJ & Sistem zëri & Ndriçim skenë", "Animacion & Spektakël & Magji",
    "Makina dasme & Kortezh", "Hotele & Fjetje & Honeymoon", "Organizim eventesh & Koordinim", "Ftesa & Shtyp & Dhurata",
  ]],
  ["turizem-udhetimet", "✈️", "Turizëm & Udhëtime", [
    "Apartamente turistike", "Vila & Shtëpi pushimi", "Hotele & Pensione & B&B", "Camping & Karavane & Glamping",
    "Bileta avioni & Treni & Autobus", "Paketa turistike & All-inclusive", "Makina me qera", "Guidë turistike & Përkthyes",
    "Aktivitete aventure & Rafting", "Plazhe & Spa & Wellness", "Udhëtime grupore & Ekskursione",
    "Vizat & Dokumente udhëtimi",
  ]],
  ["shendetesi-bukuri", "🏥", "Shëndetësi & Bukuri", [
    "Pajisje mjekësore & Diagnostike", "Karrige & Karrocë invalidësh", "Suplementa & Vitamina & Proteina",
    "Produkte shëndetësore & Natyrale", "Kozmetikë & Makeup profesional", "Sallon bukurie & Estetikë",
    "Sallon flokësh & Berber", "Masazh & Relaksim & Spa", "Optikë & Syze mjekësore",
    "Stomatolog & Dentist & Ortodoncist", "Fizioterapi & Rehabilitim", "Psikolog & Këshillim & Terapi",
    "Nutricionit & Dietë & Humbje peshe", "Produkte shtatzënie & Nëna",
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
  "pune-sherbime": "biznes-sherbime",
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
