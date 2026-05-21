import "./load-env.js";
import { eq, isNull } from "drizzle-orm";
import { db, pool } from "./index.js";
import { categoriesTable } from "./schema/categories.js";

const PARENT_CATEGORIES: {
  name: string;
  slug: string;
  icon: string;
}[] = [
  { name: "Vetura", slug: "vetura", icon: "Car" },
  { name: "Motorr & Skuter", slug: "motorr-skuter", icon: "Bike" },
  { name: "Kamionë & Furgonë", slug: "kamione-furgone", icon: "Truck" },
  { name: "Auto Pjesë", slug: "auto-pjese", icon: "Wrench" },
  { name: "Banesa & Shtëpi", slug: "banesa-shtepi", icon: "Home" },
  { name: "Lokale & Zyrë", slug: "lokale-zyre", icon: "Building2" },
  { name: "Telefona", slug: "telefona", icon: "Smartphone" },
  { name: "Kompjuterë & Laptopë", slug: "kompjutere-laptope", icon: "Laptop" },
  { name: "Elektronikë & Pajisje Shtëpiake", slug: "tv-elektronike", icon: "Tv" },
  { name: "Mobilje & Dekorime", slug: "mobilje-dekorime", icon: "Sofa" },
  { name: "Rroba & Këpucë", slug: "rroba-kepuce", icon: "Shirt" },
  { name: "Fëmijë", slug: "femije", icon: "Baby" },
  { name: "Sport & Outdoor", slug: "sport-outdoor", icon: "Dumbbell" },
  { name: "Punë & Shërbime", slug: "pune-sherbime", icon: "Briefcase" },
  { name: "Bujqësi & Blegtori", slug: "bujqesi-blegtori", icon: "Wheat" },
  { name: "Arsim & Kurse", slug: "arsim-kurse", icon: "GraduationCap" },
  { name: "Muzikë & Hobby", slug: "muzike-hobby", icon: "Music" },
  { name: "Kafshë", slug: "kafshet", icon: "PawPrint" },
];

const VETURA_BODY_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Sedan", slug: "sedan", icon: "Car" },
  { name: "Hatchback", slug: "hatchback", icon: "Car" },
  { name: "SUV & Jeep", slug: "suv-jeep", icon: "Car" },
  { name: "Kombi & Minivan", slug: "kombi-minivan", icon: "Car" },
  { name: "Kabriolet & Sportive", slug: "kabriolet-sportive", icon: "Car" },
  { name: "Kupe", slug: "kupe", icon: "Car" },
  { name: "Elektrike & Hibride", slug: "elektrike-hibride", icon: "Zap" },
  { name: "Pickup", slug: "pickup", icon: "Car" },
  { name: "Klasike & Vintage", slug: "klasike-vintage", icon: "Car" },
];

/** Subcategories shown on the Motorr & Skuter hub (flat under parent; slugs prefixed to stay unique globally). */
const MOTOR_SKUTER_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Chopper", slug: "motorr-type-chopper", icon: "Bike" },
  { name: "Enduro", slug: "motorr-type-enduro", icon: "Bike" },
  { name: "Motokros", slug: "motorr-type-motokros", icon: "Bike" },
  { name: "Motorr Sportiv", slug: "motorr-type-sportiv", icon: "Bike" },
  { name: "Quad & ATV", slug: "motorr-type-quad-atv", icon: "Bike" },
  { name: "Skuter", slug: "motorr-type-skuter", icon: "Bike" },
  { name: "Vespa", slug: "motorr-type-vespa", icon: "Bike" },
];

const MOTOR_SKUTER_BRANDS: { name: string; slug: string }[] = [
  { name: "Aprilia", slug: "motorr-aprilia" },
  { name: "BMW", slug: "motorr-bmw" },
  { name: "Ducati", slug: "motorr-ducati" },
  { name: "Harley-Davidson", slug: "motorr-harley-davidson" },
  { name: "Honda", slug: "motorr-honda" },
  { name: "Kawasaki", slug: "motorr-kawasaki" },
  { name: "KTM", slug: "motorr-ktm" },
  { name: "Piaggio", slug: "motorr-piaggio" },
  { name: "Suzuki", slug: "motorr-suzuki" },
  { name: "Yamaha", slug: "motorr-yamaha" },
  { name: "Benelli", slug: "motorr-benelli" },
  { name: "Husqvarna", slug: "motorr-husqvarna" },
  { name: "Keeway", slug: "motorr-keeway" },
  { name: "Kymco", slug: "motorr-kymco" },
  { name: "SYM", slug: "motorr-sym" },
  { name: "Triumph", slug: "motorr-triumph" },
];

const CAR_BRANDS: { name: string; slug: string }[] = [
  { name: "Alfa Romeo", slug: "alfa-romeo" },
  { name: "Audi", slug: "audi" },
  { name: "BMW", slug: "bmw" },
  { name: "Chevrolet", slug: "chevrolet" },
  { name: "Citroen", slug: "citroen" },
  { name: "Dacia", slug: "dacia" },
  { name: "Dodge", slug: "dodge" },
  { name: "Ferrari", slug: "ferrari" },
  { name: "Fiat", slug: "fiat" },
  { name: "Ford", slug: "ford" },
  { name: "Honda", slug: "honda" },
  { name: "Hyundai", slug: "hyundai" },
  { name: "Infiniti", slug: "infiniti" },
  { name: "Jeep", slug: "jeep" },
  { name: "Kia", slug: "kia" },
  { name: "Lada", slug: "lada" },
  { name: "Lamborghini", slug: "lamborghini" },
  { name: "Land Rover", slug: "land-rover" },
  { name: "Lexus", slug: "lexus" },
  { name: "Mazda", slug: "mazda" },
  { name: "Mercedes-Benz", slug: "mercedes-benz" },
  { name: "Mitsubishi", slug: "mitsubishi" },
  { name: "Nissan", slug: "nissan" },
  { name: "Opel", slug: "opel" },
  { name: "Peugeot", slug: "peugeot" },
  { name: "Porsche", slug: "porsche" },
  { name: "Renault", slug: "renault" },
  { name: "Seat", slug: "seat" },
  { name: "Skoda", slug: "skoda" },
  { name: "Subaru", slug: "subaru" },
  { name: "Suzuki", slug: "suzuki" },
  { name: "Tesla", slug: "tesla" },
  { name: "Toyota", slug: "toyota" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Volvo", slug: "volvo" },
  { name: "Zastava", slug: "zastava" },
];

async function ensureCategory(
  data: { name: string; slug: string; icon: string; parent_id?: number | null },
): Promise<number> {
  const existing = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, data.slug))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const [row] = await db
    .insert(categoriesTable)
    .values({
      name: data.name,
      slug: data.slug,
      icon: data.icon,
      parent_id: data.parent_id ?? null,
    })
    .returning({ id: categoriesTable.id });

  return row.id;
}

/** Idempotent: ensures Motor & Skuter type + brand leaf categories exist under the parent slug `motorr-skuter`. */
async function seedMotorSkuterSubcategoriesAlways() {
  const motorrRow = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, "motorr-skuter"))
    .limit(1);

  if (!motorrRow[0]) {
    console.warn(
      '[seed] Skip Motorr & Skuter subcategories — parent slug "motorr-skuter" not found. Run parent seed first.',
    );
    return;
  }

  const motorrId = motorrRow[0].id;

  for (const t of MOTOR_SKUTER_TYPES) {
    await ensureCategory({ ...t, parent_id: motorrId });
  }
  for (const b of MOTOR_SKUTER_BRANDS) {
    await ensureCategory({ ...b, name: b.name, slug: b.slug, icon: "Bike", parent_id: motorrId });
  }

  console.log(
    `[seed] Motorr & Skuter: ${MOTOR_SKUTER_TYPES.length} types + ${MOTOR_SKUTER_BRANDS.length} brands`,
  );
}

/** Subcategories for Kamionë & Furgonë hub (slugs prefixed for global uniqueness). */
const KAMION_FURGONE_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Autobusë", slug: "kamione-type-autobuse", icon: "Truck" },
  { name: "Auto-bartës", slug: "kamione-type-auto-bartes", icon: "Truck" },
  { name: "Furgonë", slug: "kamione-type-furgone", icon: "Truck" },
  { name: "Kamionë", slug: "kamione-type-kamione", icon: "Truck" },
  { name: "Mauna", slug: "kamione-type-mauna", icon: "Truck" },
  { name: "Trailer & Rimorkio", slug: "kamione-type-trailer-rimorkio", icon: "Truck" },
];

const KAMION_FURGONE_BRANDS: { name: string; slug: string }[] = [
  { name: "DAF", slug: "kamione-daf" },
  { name: "Iveco", slug: "kamione-iveco" },
  { name: "MAN", slug: "kamione-man" },
  { name: "Mercedes-Benz", slug: "kamione-mercedes-benz" },
  { name: "Renault", slug: "kamione-renault" },
  { name: "Scania", slug: "kamione-scania" },
  { name: "Volvo", slug: "kamione-volvo" },
  { name: "Mitsubishi Fuso", slug: "kamione-mitsubishi-fuso" },
  { name: "Isuzu", slug: "kamione-isuzu" },
  { name: "Volkswagen", slug: "kamione-volkswagen" },
  { name: "Ford", slug: "kamione-ford" },
  { name: "Fiat", slug: "kamione-fiat" },
];

async function seedKamioneFurgoneSubcategoriesAlways() {
  const row = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, "kamione-furgone"))
    .limit(1);

  if (!row[0]) {
    console.warn(
      '[seed] Skip Kamionë & Furgonë subcategories — parent slug "kamione-furgone" not found. Run parent seed first.',
    );
    return;
  }

  const parentId = row[0].id;

  for (const t of KAMION_FURGONE_TYPES) {
    await ensureCategory({ ...t, parent_id: parentId });
  }
  for (const b of KAMION_FURGONE_BRANDS) {
    await ensureCategory({ ...b, name: b.name, slug: b.slug, icon: "Truck", parent_id: parentId });
  }

  console.log(
    `[seed] Kamionë & Furgonë: ${KAMION_FURGONE_TYPES.length} types + ${KAMION_FURGONE_BRANDS.length} brands`,
  );
}

/** Part types shown on the Auto Pjesë hub (flat under parent slug `auto-pjese`). */
const AUTO_PJESE_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Akumulatorë", slug: "auto-pjes-type-akumulatore", icon: "Wrench" },
  { name: "Amortizerë", slug: "auto-pjes-type-amortizere", icon: "Wrench" },
  { name: "Drita & LED", slug: "auto-pjes-type-drita-led", icon: "Wrench" },
  { name: "Fellne & Goma", slug: "auto-pjes-type-fellne-goma", icon: "Wrench" },
  { name: "Motorrë", slug: "auto-pjes-type-motore", icon: "Wrench" },
  { name: "Pjesë Karoserie", slug: "auto-pjes-type-karoserie", icon: "Wrench" },
  { name: "Sisteme Frenimi", slug: "auto-pjes-type-frenim", icon: "Wrench" },
  { name: "Vajra & Filtra", slug: "auto-pjes-type-vajra-filtra", icon: "Wrench" },
];

async function seedAutoPjesSubcategoriesAlways() {
  const row = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, "auto-pjese"))
    .limit(1);

  if (!row[0]) {
    console.warn(
      '[seed] Skip Auto Pjesë subcategories — parent slug "auto-pjese" not found. Run parent seed first.',
    );
    return;
  }

  const parentId = row[0].id;
  for (const t of AUTO_PJESE_TYPES) {
    await ensureCategory({ ...t, parent_id: parentId });
  }

  console.log(`[seed] Auto Pjesë: ${AUTO_PJESE_TYPES.length} types`);
}

/** Property types shown on the Banesa & Shtëpi hub (under parent slug `banesa-shtepi`). */
const BANESA_SHTEPI_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Apartamente & Banesa", slug: "banesa-type-apartamente-banesa", icon: "Home" },
  { name: "Dhoma me Qira", slug: "banesa-type-dhoma-qira", icon: "Home" },
  { name: "Shtëpi", slug: "banesa-type-shtepi", icon: "Home" },
  { name: "Toka & Truall", slug: "banesa-type-toka-truall", icon: "Home" },
  { name: "Vikendica", slug: "banesa-type-vikendica", icon: "Home" },
];

async function seedBanesaShtepiSubcategoriesAlways() {
  const row = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, "banesa-shtepi"))
    .limit(1);

  if (!row[0]) {
    console.warn(
      '[seed] Skip Banesa & Shtëpi subcategories — parent slug "banesa-shtepi" not found. Run parent seed first.',
    );
    return;
  }

  const parentId = row[0].id;
  for (const t of BANESA_SHTEPI_TYPES) {
    await ensureCategory({ ...t, parent_id: parentId });
  }

  console.log(`[seed] Banesa & Shtëpi: ${BANESA_SHTEPI_TYPES.length} types`);
}

/** Lokale & Zyrë hub */
const LOKALE_ZYRE_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Depo", slug: "lokale-type-depo", icon: "Building2" },
  { name: "Garazha", slug: "lokale-type-garazha", icon: "Building2" },
  { name: "Lokale Afariste", slug: "lokale-type-afariste", icon: "Building2" },
  { name: "Objekte Industriale", slug: "lokale-type-industriale", icon: "Building2" },
  { name: "Zyrë", slug: "lokale-type-zyre", icon: "Building2" },
];

const TELEFONA_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Smartphones", slug: "telefona-type-smartphones", icon: "Smartphone" },
  { name: "Telefona Fiksë", slug: "telefona-type-fikse", icon: "Smartphone" },
  { name: "Numra & Kartela", slug: "telefona-type-numra-kartela", icon: "Smartphone" },
  { name: "Pjesë Rezervë", slug: "telefona-type-pjese-rezerve", icon: "Smartphone" },
  { name: "Aksesorë", slug: "telefona-type-aksesore-smartphone", icon: "Smartphone" },
];

const TELEFONA_BRANDS: { name: string; slug: string }[] = [
  { name: "Apple", slug: "telefona-apple" },
  { name: "Google", slug: "telefona-google" },
  { name: "Honor", slug: "telefona-honor" },
  { name: "Huawei", slug: "telefona-huawei" },
  { name: "Motorola", slug: "telefona-motorola" },
  { name: "Nokia", slug: "telefona-nokia" },
  { name: "OnePlus", slug: "telefona-oneplus" },
  { name: "Samsung", slug: "telefona-samsung" },
  { name: "Xiaomi", slug: "telefona-xiaomi" },
  { name: "ZTE", slug: "telefona-zte" },
];

const KOMPJUTERE_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Desktop PC", slug: "kompj-type-desktop-pc", icon: "Laptop" },
  { name: "Laptopë", slug: "kompj-type-laptop", icon: "Laptop" },
  { name: "Monitorë", slug: "kompj-type-monitore", icon: "Laptop" },
  { name: "Pjesë Harduerike", slug: "kompj-type-harduer", icon: "Laptop" },
  { name: "Serverë", slug: "kompj-type-servere", icon: "Laptop" },
  { name: "Tabletë", slug: "kompj-type-tablete", icon: "Laptop" },
];

const KOMPJUTERE_BRANDS: { name: string; slug: string }[] = [
  { name: "Acer", slug: "kompj-acer" },
  { name: "Apple", slug: "kompj-apple" },
  { name: "ASUS", slug: "kompj-asus" },
  { name: "Dell", slug: "kompj-dell" },
  { name: "HP", slug: "kompj-hp" },
  { name: "Huawei", slug: "kompj-huawei" },
  { name: "Lenovo", slug: "kompj-lenovo" },
  { name: "Microsoft", slug: "kompj-microsoft" },
  { name: "MSI", slug: "kompj-msi" },
  { name: "Razer", slug: "kompj-razer" },
];

const TV_ELECTRONIKE_TYPES: { name: string; slug: string; icon: string }[] = [
  {
    name: "Pajisje të Mëdha Shtëpiake",
    slug: "tv-type-pajisje-medha-shtepiake",
    icon: "Tv",
  },
  { name: "Klimatizim & Ngrohje", slug: "tv-type-klimatizim-ngrohje", icon: "Tv" },
  { name: "Televizorë & Projektorë", slug: "tv-type-televizore-projektor", icon: "Tv" },
  { name: "Konzola & Gaming", slug: "tv-type-konzola-gaming", icon: "Tv" },
  { name: "Audio & Pajisje Zëri", slug: "tv-type-audio-zeri", icon: "Tv" },
  {
    name: "Kamera, Foto & Smart Watch",
    slug: "tv-type-kamera-foto-smartwatch",
    icon: "Tv",
  },
  {
    name: "Laptopë & Kompjuterë",
    slug: "tv-type-laptop-kompjutere",
    icon: "Laptop",
  },
];

const MOBILJE_DEKORIME_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Dhoma e Gjumit", slug: "mobilje-type-dhoma-gjumit", icon: "Sofa" },
  { name: "Kopshtit & Terasa", slug: "mobilje-type-kopsht-terasa", icon: "Sofa" },
  { name: "Kuzhina", slug: "mobilje-type-kuzhina", icon: "Sofa" },
  { name: "Ndriçim", slug: "mobilje-type-ndricim", icon: "Sofa" },
  { name: "Sallone & Ulëse", slug: "mobilje-type-sallone-ulese", icon: "Sofa" },
  { name: "Tepihë & Perde", slug: "mobilje-type-tepihe-perde", icon: "Sofa" },
];

const RROBA_KEPUCE_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Aksesorë", slug: "rroba-type-aksesore", icon: "Shirt" },
  { name: "Këpucë", slug: "rroba-type-kepuce", icon: "Shirt" },
  { name: "Veshje për Femra", slug: "rroba-type-veshje-femra", icon: "Shirt" },
  { name: "Veshje për Fëmijë", slug: "rroba-type-veshje-femije", icon: "Shirt" },
  { name: "Veshje për Meshkuj", slug: "rroba-type-veshje-meshkuj", icon: "Shirt" },
];

const FEMIJE_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Karroca", slug: "femije-type-karroca", icon: "Baby" },
  { name: "Lodra", slug: "femije-type-lodra", icon: "Baby" },
  { name: "Pajisje për Foshnje", slug: "femije-type-foshnje", icon: "Baby" },
  { name: "Rroba për Fëmijë", slug: "femije-type-rroba", icon: "Baby" },
  { name: "Ushqim & Higjienë", slug: "femije-type-ushqim-higjiene", icon: "Baby" },
];

const SPORT_OUTDOOR_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Biçikleta", slug: "sport-type-bicikleta", icon: "Dumbbell" },
  { name: "Fitnes & Joga", slug: "sport-type-fitnes-joga", icon: "Dumbbell" },
  { name: "Pajisje Kampingu", slug: "sport-type-kampingu", icon: "Dumbbell" },
  { name: "Sportet me Top", slug: "sport-type-top", icon: "Dumbbell" },
  { name: "Sportet Dimërore", slug: "sport-type-dimerore", icon: "Dumbbell" },
];

const PUNE_SHERBIME_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Administratë", slug: "pune-type-administrate", icon: "Briefcase" },
  { name: "Gastronomi", slug: "pune-type-gastronomi", icon: "Briefcase" },
  { name: "IT & Dizajn", slug: "pune-type-it-dizajn", icon: "Briefcase" },
  { name: "Marketing", slug: "pune-type-marketing", icon: "Briefcase" },
  { name: "Ndërtimtari", slug: "pune-type-ndertimtari", icon: "Briefcase" },
  { name: "Shërbime Transporti", slug: "pune-type-transporti", icon: "Briefcase" },
  { name: "Zejtari", slug: "pune-type-zejtari", icon: "Briefcase" },
];

const BUJQESI_BLEGTORI_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Bagëti", slug: "bujq-type-bageti", icon: "Wheat" },
  { name: "Farëra & Plehra", slug: "bujq-type-farera-plehra", icon: "Wheat" },
  { name: "Makineri Bujqësore", slug: "bujq-type-makineri", icon: "Wheat" },
  { name: "Shpezë", slug: "bujq-type-shpeze", icon: "Wheat" },
  { name: "Ushqim për Kafshë", slug: "bujq-type-ushqim-kafshet", icon: "Wheat" },
];

const ARSIM_KURSE_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Gjuhë të Huaja", slug: "arsim-type-gjuhe-huaja", icon: "GraduationCap" },
  { name: "Kurse Profesionale", slug: "arsim-type-kurse-prof", icon: "GraduationCap" },
  { name: "Mësime Private", slug: "arsim-type-mesime-private", icon: "GraduationCap" },
  { name: "Trajnime IT", slug: "arsim-type-trajnime-it", icon: "GraduationCap" },
];

const MUZIKE_HOBBY_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Instrumente Frymore", slug: "muzike-type-frymore", icon: "Music" },
  { name: "Instrumente me Tela", slug: "muzike-type-tela", icon: "Music" },
  { name: "Instrumente me Tastierë", slug: "muzike-type-tastiere", icon: "Music" },
  { name: "Libra", slug: "muzike-type-libra", icon: "Music" },
  { name: "Pajisje Studio", slug: "muzike-type-studio", icon: "Music" },
  { name: "Art, Teatër & Film", slug: "muzike-type-art-teater-film", icon: "Music" },
];

const KAFSHET_TYPES: { name: string; slug: string; icon: string }[] = [
  { name: "Akuariume", slug: "kafshet-type-akuariume", icon: "PawPrint" },
  { name: "Mace", slug: "kafshet-type-mace", icon: "PawPrint" },
  { name: "Qen", slug: "kafshet-type-qen", icon: "PawPrint" },
  { name: "Shpendë", slug: "kafshet-type-shpende", icon: "PawPrint" },
  { name: "Ushqim & Aksesorë për Kafshë", slug: "kafshet-type-ushqim-aksesore", icon: "PawPrint" },
];

async function seedTypesUnderParentSlug(
  parentSlug: string,
  types: { name: string; slug: string; icon: string }[],
  loggingLabel: string,
) {
  const row = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, parentSlug))
    .limit(1);

  if (!row[0]) {
    console.warn(`[seed] Skip ${loggingLabel} — parent slug "${parentSlug}" not found.`);
    return;
  }

  const parentId = row[0].id;
  for (const t of types) {
    await ensureCategory({ ...t, parent_id: parentId });
  }
  console.log(`[seed] ${loggingLabel}: ${types.length} subcategories`);
}

async function seedTypesAndBrandsUnderParentSlug(
  parentSlug: string,
  types: { name: string; slug: string; icon: string }[],
  brands: { name: string; slug: string }[],
  iconForBrand: string,
  loggingLabel: string,
) {
  const row = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, parentSlug))
    .limit(1);

  if (!row[0]) {
    console.warn(`[seed] Skip ${loggingLabel} — parent slug "${parentSlug}" not found.`);
    return;
  }

  const parentId = row[0].id;
  for (const t of types) {
    await ensureCategory({ ...t, parent_id: parentId });
  }
  for (const b of brands) {
    await ensureCategory({ ...b, name: b.name, slug: b.slug, icon: iconForBrand, parent_id: parentId });
  }
  console.log(`[seed] ${loggingLabel}: ${types.length} types + ${brands.length} brands`);
}

async function seedRemainingMarketplaceHubSubcategoriesAlways() {
  await seedTypesUnderParentSlug("lokale-zyre", LOKALE_ZYRE_TYPES, "Lokale & Zyrë");
  await seedTypesAndBrandsUnderParentSlug(
    "telefona",
    TELEFONA_TYPES,
    TELEFONA_BRANDS,
    "Smartphone",
    "Telefona",
  );
  await seedTypesAndBrandsUnderParentSlug(
    "kompjutere-laptope",
    KOMPJUTERE_TYPES,
    KOMPJUTERE_BRANDS,
    "Laptop",
    "Kompjuterë & Laptopë",
  );
  await seedTypesUnderParentSlug(
    "tv-elektronike",
    TV_ELECTRONIKE_TYPES,
    "Elektronikë & Pajisje Shtëpiake",
  );
  await seedTypesUnderParentSlug("mobilje-dekorime", MOBILJE_DEKORIME_TYPES, "Mobilje & Dekorime");
  await seedTypesUnderParentSlug("rroba-kepuce", RROBA_KEPUCE_TYPES, "Rroba & Këpucë");
  await seedTypesUnderParentSlug("femije", FEMIJE_TYPES, "Fëmijë");
  await seedTypesUnderParentSlug("sport-outdoor", SPORT_OUTDOOR_TYPES, "Sport & Outdoor");
  await seedTypesUnderParentSlug("pune-sherbime", PUNE_SHERBIME_TYPES, "Punë & Shërbime");
  await seedTypesUnderParentSlug("bujqesi-blegtori", BUJQESI_BLEGTORI_TYPES, "Bujqësi & Blegtori");
  await seedTypesUnderParentSlug("arsim-kurse", ARSIM_KURSE_TYPES, "Arsim & Kurse");
  await seedTypesUnderParentSlug("muzike-hobby", MUZIKE_HOBBY_TYPES, "Muzikë & Hobby");
  await seedTypesUnderParentSlug("kafshet", KAFSHET_TYPES, "Kafshë");
}

async function seedParentsOnly() {
  console.log("Seeding parent categories…");
  for (const cat of PARENT_CATEGORIES) {
    await ensureCategory(cat);
  }
  console.log(`Done: ${PARENT_CATEGORIES.length} parent categories.`);
}

/** Vetura body types + brands (brands attach to Sedan for the 3-level category UI). */
async function seedBrandsUnderVetura() {
  const veturaRow = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, "vetura"))
    .limit(1);

  if (!veturaRow[0]) {
    throw new Error('Vetura category not found — run `pnpm run seed:parents` first.');
  }

  const veturaId = veturaRow[0].id;

  console.log("Ensuring Vetura body types…");
  const bodyTypeIds = new Map<string, number>();
  for (const body of VETURA_BODY_TYPES) {
    const id = await ensureCategory({ ...body, parent_id: veturaId });
    bodyTypeIds.set(body.slug, id);
  }

  const sedanId = bodyTypeIds.get("sedan");
  if (!sedanId) {
    throw new Error("Sedan body type missing after seed step");
  }

  console.log("Seeding car brands under Vetura (Sedan)…");
  for (const brand of CAR_BRANDS) {
    await ensureCategory({
      name: brand.name,
      slug: brand.slug,
      icon: "Car",
      parent_id: sedanId,
    });
  }

  console.log(
    `Done: ${CAR_BRANDS.length} car brands under Vetura › Sedan (plus ${VETURA_BODY_TYPES.length} body types).`,
  );
}

async function seedFull() {
  const topLevel = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(isNull(categoriesTable.parent_id));

  /** Hub pickers read children from the API; keep these in sync whenever parent rows exist. */
  if (topLevel.length >= PARENT_CATEGORIES.length) {
    await seedMotorSkuterSubcategoriesAlways();
    await seedKamioneFurgoneSubcategoriesAlways();
    await seedAutoPjesSubcategoriesAlways();
    await seedBanesaShtepiSubcategoriesAlways();
    await seedRemainingMarketplaceHubSubcategoriesAlways();

    const brands = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, "bmw"));
    if (brands.length > 0) {
      console.log("Database already seeded — skipping Vetura inserts.");
      return;
    }
  }

  console.log("Seeding parent categories…");
  const parentIds = new Map<string, number>();
  for (const cat of PARENT_CATEGORIES) {
    const id = await ensureCategory(cat);
    parentIds.set(cat.slug, id);
  }

  const veturaId = parentIds.get("vetura");
  if (!veturaId) {
    throw new Error("Vetura category missing after seed");
  }

  console.log("Seeding Vetura body types…");
  const bodyTypeIds = new Map<string, number>();
  for (const body of VETURA_BODY_TYPES) {
    const id = await ensureCategory({ ...body, parent_id: veturaId });
    bodyTypeIds.set(body.slug, id);
  }

  const sedanId = bodyTypeIds.get("sedan");
  if (!sedanId) {
    throw new Error("Sedan body type missing after seed");
  }

  console.log("Seeding car brands…");
  for (const brand of CAR_BRANDS) {
    await ensureCategory({
      name: brand.name,
      slug: brand.slug,
      icon: "Car",
      parent_id: sedanId,
    });
  }

  await seedMotorSkuterSubcategoriesAlways();
  await seedKamioneFurgoneSubcategoriesAlways();
  await seedAutoPjesSubcategoriesAlways();
  await seedBanesaShtepiSubcategoriesAlways();
  await seedRemainingMarketplaceHubSubcategoriesAlways();

  console.log(
    `Done: ${PARENT_CATEGORIES.length} parent categories, ${VETURA_BODY_TYPES.length} body types, ${CAR_BRANDS.length} car brands.`,
  );
}

async function seed() {
  if (process.argv.includes("--parents-only")) {
    await seedParentsOnly();
    return;
  }
  if (process.argv.includes("--auto-pjes-subcats-only")) {
    await seedAutoPjesSubcategoriesAlways();
    return;
  }
  if (process.argv.includes("--banesa-subcats-only")) {
    await seedBanesaShtepiSubcategoriesAlways();
    return;
  }
  if (process.argv.includes("--kamione-subcats-only")) {
    await seedKamioneFurgoneSubcategoriesAlways();
    return;
  }
  if (process.argv.includes("--motorr-subcats-only")) {
    await seedMotorSkuterSubcategoriesAlways();
    return;
  }
  if (process.argv.includes("--general-subcats-only")) {
    await seedRemainingMarketplaceHubSubcategoriesAlways();
    return;
  }
  if (process.argv.includes("--brands-only")) {
    await seedBrandsUnderVetura();
    return;
  }
  await seedFull();
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
