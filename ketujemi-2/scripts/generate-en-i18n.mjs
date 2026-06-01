/**
 * Generates English UI strings from KS + MNE blocks in app-extra-i18n.ts
 * and adds `en` fields to category-translations.ts.
 *
 * Run from repo root: node ketujemi-2/scripts/generate-en-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vendiLib = path.join(root, "artifacts", "vendi", "src", "lib");

function extractObjectBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing ${startMarker}`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  throw new Error(`Unclosed block after ${startMarker}`);
}

function parseRecordEntries(body) {
  const entries = [];
  const re = /^\s+(\w+):\s*(?:"((?:\\.|[^"\\])*)"|`([\s\S]*?)`),?\s*$/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    entries.push({ key: m[1], value: (m[2] ?? m[3] ?? "").replace(/\\n/g, "\n").replace(/\\"/g, '"') });
  }
  return entries;
}

/** Serbian/Latin Montenegrin → English (UI chrome). */
const SR_EN = [
  [/Izaberite/gi, "Select"],
  [/Izaberi/gi, "Select"],
  [/Pretraži/gi, "Search"],
  [/Traži/gi, "Search"],
  [/Primijeni/gi, "Apply"],
  [/Očisti/gi, "Clear"],
  [/Nazad/gi, "Back"],
  [/Uredi/gi, "Edit"],
  [/Obriši/gi, "Delete"],
  [/Otkaži/gi, "Cancel"],
  [/Sačuvaj/gi, "Save"],
  [/Čuvanje/gi, "Saving"],
  [/Dodaj/gi, "Add"],
  [/Objavi/gi, "Post"],
  [/Besplatno/gi, "Free"],
  [/Danas/gi, "Today"],
  [/Sve\b/gi, "All"],
  [/Grad\b/gi, "City"],
  [/Cijena/gi, "Price"],
  [/Kategorij/gi, "Categor"],
  [/Filtri/gi, "Filters"],
  [/Oglasi/gi, "Listings"],
  [/oglas/gi, "listing"],
  [/Nije pronađeno/gi, "Not found"],
  [/Molimo sačekajte/gi, "Please wait"],
  [/Učitavanje/gi, "Uploading"],
  [/Stanje/gi, "Condition"],
  [/Lokacija/gi, "Location"],
  [/Kontakt/gi, "Contact"],
  [/Opis/gi, "Description"],
  [/Detalji/gi, "Details"],
  [/Marka/gi, "Brand"],
  [/Model/gi, "Model"],
  [/Godina/gi, "Year"],
  [/Prodaja/gi, "Sale"],
  [/Izdavanje/gi, "Rent"],
  [/Kupovina/gi, "Buy"],
  [/Nov\b/gi, "New"],
  [/Korišten/gi, "Used"],
  [/Po dogovoru/gi, "Negotiable"],
  [/Prijavi se/gi, "Log in"],
  [/Odjavi se/gi, "Log out"],
  [/Pomoć/gi, "Help"],
  [/Pravila/gi, "Rules"],
  [/Privatnost/gi, "Privacy"],
  [/Kolačići/gi, "Cookies"],
  [/Uslovi/gi, "Terms"],
  [/Sigurnost/gi, "Security"],
  [/Mediji/gi, "Press"],
  [/O nama/gi, "About us"],
  [/Dijaspora/gi, "Diaspora"],
  [/Tržišt/gi, "Market"],
  [/Potkategorij/gi, "Subcategor"],
  [/dostupn/gi, "available"],
  [/ukupno/gi, "total"],
  [/pregleda/gi, "views"],
  [/Stranica/gi, "Page"],
  [/ od /gi, " of "],
  [/Crnoj Gori/gi, "the Balkans"],
  [/Makedonij/gi, "North Macedonia"],
  [/Albanij/gi, "Albania"],
  [/Kosov/gi, "Kosovo"],
];

/** Albanian → English (common UI). */
const SQ_EN = [
  [/Shpalljet/gi, "Listings"],
  [/shpallje/gi, "listing"],
  [/Kërko/gi, "Search"],
  [/Filtrat/gi, "Filters"],
  [/Kategoria/gi, "Category"],
  [/Qyteti/gi, "City"],
  [/Çmimi/gi, "Price"],
  [/Zbato/gi, "Apply"],
  [/Pastro/gi, "Clear"],
  [/Kthehu/gi, "Back"],
  [/Edito/gi, "Edit"],
  [/Fshi/gi, "Delete"],
  [/Anulo/gi, "Cancel"],
  [/Ruaj/gi, "Save"],
  [/Duke ruajtur/gi, "Saving"],
  [/Posto/gi, "Post"],
  [/Falas/gi, "Free"],
  [/Sot/gi, "Today"],
  [/Të gjitha/gi, "All"],
  [/Kategoritë/gi, "Categories"],
  [/Shiko të gjitha/gi, "View all"],
  [/Përshkrimi/gi, "Description"],
  [/Detajet/gi, "Details"],
  [/Shitësi/gi, "Seller"],
  [/Telefono/gi, "Call"],
  [/Zgjidh/gi, "Select"],
  [/Nënkategoria/gi, "Subcategory"],
  [/Vendndodhja/gi, "Location"],
  [/Kontakti/gi, "Contact"],
  [/Fotot/gi, "Photos"],
  [/Gjendja/gi, "Condition"],
  [/Hyr/gi, "Log in"],
  [/Dil/gi, "Log out"],
  [/Kyçu/gi, "Log in"],
  [/Me marrëveshje/gi, "Negotiable"],
  [/Nuk u gjet/gi, "Nothing found"],
  [/Nuk ka/gi, "No"],
  [/ende/gi, "yet"],
  [/Bëhu i pari/gi, "Be the first"],
  [/Mund të postoni/gi, "You can post"],
  [/nga kudo/gi, "from anywhere"],
];

const KEY_OVERRIDES = {
  nav_menuAria: "Open menu",
  nav_menuTitle: "Menu",
  nav_home: "Home",
  nav_postShort: "Post",
  home_adAria: "Advertisement",
  home_adBadge: "Ad",
  home_adHeadline: "Your ad here —",
  home_adContactPrefix: "Contact:",
  home_carouselPrev: "Previous slide",
  home_carouselNext: "Next slide",
  home_carouselDot: "Show slide {n}",
  home_partnerHeading: "Our trusted partners",
  home_partnerEmptySignupVip: "Sign up as VIP Partner",
  home_partnerEmptySignupStandard: "Sign up as Partner",
  home_topListingsHeading: "TOP listings",
  home_topListingsRowLabel: "TOP listings",
  home_monthPartnerBadge: "Partner of the month",
  login_heading: "Log in",
  login_heading_register: "Sign up",
  login_sub_login: "Enter your email or phone and password.",
  login_sub_login_email_verify:
    "Enter email and password — you will receive a code by email, then sign in.",
  login_sub_register: "Email or phone + password only. Ready in seconds.",
  login_welcomeBack: "Welcome back!",
  login_forgotPassword: "Forgot password? Reset via email",
  login_forgotHint: "Enter your email — we will send a reset code.",
  login_resetHint: "Enter the code from your email and a new password.",
  login_forgotBtn: "Send code",
  login_resetBtn: "Save new password",
  login_backToSignin: "← Back to email + password",
  login_passwordResetDone: "Password changed. You are signed in.",
  nf_title: "Page not found",
  nf_body: "This page does not exist or has moved. Check the address and try again.",
  cat_pickPartKind: "Choose part type",
  cat_pickKindBrand: "Choose type or brand",
  cat_sectionTypes: "Types",
  cat_sectionBrands: "Brands",
};

const ALBANIAN_CHARS = /[ëçËÇ]/;

function toEnglish(key, ks, mne) {
  if (KEY_OVERRIDES[key]) return KEY_OVERRIDES[key];
  let s = ks;
  for (const [re, rep] of SQ_EN) s = s.replace(re, rep);
  if (ALBANIAN_CHARS.test(s) && mne) {
    let m = mne;
    for (const [re, rep] of SR_EN) m = m.replace(re, rep);
    if (!ALBANIAN_CHARS.test(m)) s = m;
  }
  for (const [re, rep] of SR_EN) s = s.replace(re, rep);
  return s;
}

function escapeTs(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
}

function formatRecord(name, entries) {
  const lines = entries.map(({ key, value }) => {
    const v = value.includes("\n") || value.length > 120
      ? `\`${value.replace(/`/g, "\\`")}\``
      : `"${escapeTs(value)}"`;
    return `  ${key}: ${v},`;
  });
  return `export const ${name}: Record<string, string> = {\n${lines.join("\n")}\n};\n`;
}

// ── app-extra-i18n-en.ts ─────────────────────────────────────────────────────
const extraPath = path.join(vendiLib, "app-extra-i18n.ts");
const extraSrc = fs.readFileSync(extraPath, "utf8");
const ksBody = extractObjectBlock(extraSrc, "const KS_EXTRA", "const AL_OVERRIDES");
const mneBody = extractObjectBlock(extraSrc, "const MNE_EXTRA", "export const EXTRA_TRANSLATIONS");
const ksEntries = parseRecordEntries(ksBody);
const mneMap = Object.fromEntries(parseRecordEntries(mneBody).map((e) => [e.key, e.value]));
const enEntries = ksEntries.map(({ key, value }) => ({
  key,
  value: toEnglish(key, value, mneMap[key]),
}));
const enExtraPath = path.join(vendiLib, "app-extra-i18n-en.ts");
fs.writeFileSync(
  enExtraPath,
  `/** Auto-generated English UI strings — run ketujemi-2/scripts/generate-en-i18n.mjs to refresh */\n\n${formatRecord("EN_EXTRA", enEntries)}`,
  "utf8",
);
console.log(`Wrote ${enExtraPath} (${enEntries.length} keys)`);

// ── category en fields ───────────────────────────────────────────────────────
const CAT_EN = {
  Vetura: "Cars",
  "Motorr & Skuter": "Motorcycles & Scooters",
  "Kamionë & Furgonë": "Trucks & Vans",
  "Auto Pjesë": "Auto Parts",
  "Banesa & Shtëpi": "Homes & Apartments",
  "Lokale & Zyrë": "Commercial & Office",
  Telefona: "Phones",
  "Kompjuterë & Laptopë": "Computers & Laptops",
  "TV & Elektronikë": "Electronics & Home Appliances",
  "Elektronikë & Pajisje Shtëpiake": "Electronics & Home Appliances",
  "Mobilje & Dekorime": "Furniture & Decor",
  "Rroba & Këpucë": "Clothing & Shoes",
  Fëmijë: "Kids",
  "Sport & Outdoor": "Sports & Outdoor",
  "Punë & Shërbime": "Jobs & Services",
  "Bujqësi & Blegtori": "Agriculture & Livestock",
  "Arsim & Kurse": "Education & Courses",
  "Muzikë & Hobby": "Music & Hobby",
  Kafshë: "Pets",
  "Kërkoj të Blej": "Wanted to Buy",
  "Dhurata & Falas": "Gifts & Free",
};

const catPath = path.join(vendiLib, "category-translations.ts");
let catSrc = fs.readFileSync(catPath, "utf8");
if (!catSrc.includes('export type MarketCode = "ks"')) {
  throw new Error("Unexpected category-translations format");
}
catSrc = catSrc.replace(
  'export type MarketCode = "ks" | "al" | "mk" | "mne";',
  'export type MarketCode = "ks" | "al" | "mk" | "mne";\nexport type UiCategoryLocale = MarketCode | "en";',
);
catSrc = catSrc.replace(
  /export function translateCategory\(name: string, localeCode: MarketCode\): string \{/,
  `export function translateCategory(name: string, localeCode: UiCategoryLocale): string {
  if (localeCode === "en") {
    return (
      CAT_EN[name] ??
      CAT_TRANSLATIONS[name]?.mne ??
      translateArsimKurseCategory(name, "mne") ??
      translateFemijeCategory(name, "mne") ??
      name
    );
  }`,
);
if (!catSrc.includes("const CAT_EN")) {
  const enBlock =
    "\n/** English category labels (UI language en). */\nconst CAT_EN: Record<string, string> = " +
    JSON.stringify(CAT_EN, null, 2).replace(/"([^"]+)":/g, '"$1":') +
    ";\n";
  catSrc = catSrc.replace(
    "export const CAT_TRANSLATIONS:",
    `${enBlock}\nexport const CAT_TRANSLATIONS:`,
  );
}
fs.writeFileSync(catPath, catSrc, "utf8");
console.log("Updated category-translations.ts");

// ── static-pages-i18n-en.ts (from KS block) ───────────────────────────────────
const staticPath = path.join(vendiLib, "static-pages-i18n.ts");
const staticSrc = fs.readFileSync(staticPath, "utf8");
const ksStaticStart = staticSrc.indexOf("const KS: StaticPagesCopy = {");
const mkStaticStart = staticSrc.indexOf("const MK: StaticPagesCopy = {");
if (ksStaticStart < 0 || mkStaticStart < 0) throw new Error("static-pages KS/MK markers missing");
let ksStaticBlock = staticSrc.slice(ksStaticStart, mkStaticStart);
ksStaticBlock = ksStaticBlock.replace(
  /: "((?:\\.|[^"\\])*)"/g,
  (_, inner) => {
    const raw = inner.replace(/\\n/g, "\n").replace(/\\"/g, '"');
    return `: "${escapeTs(toEnglish("", raw, ""))}"`;
  },
);
ksStaticBlock = ksStaticBlock.replace(
  /: `([\s\S]*?)`/g,
  (_, inner) => `: \`${inner.replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\``,
);
const enStaticPath = path.join(vendiLib, "static-pages-i18n-en.ts");
fs.writeFileSync(
  enStaticPath,
  `/** Auto-generated English static pages — run ketujemi-2/scripts/generate-en-i18n.mjs */\nimport type { StaticPagesCopy } from "./static-pages-i18n";\n\n${ksStaticBlock.replace("const KS:", "export const EN_STATIC_PAGES:")}\n`,
  "utf8",
);
console.log(`Wrote ${enStaticPath}`);
