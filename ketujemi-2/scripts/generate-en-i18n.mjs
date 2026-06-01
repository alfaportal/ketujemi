/**
 * Generates complete English UI bundles.
 * Run: node ketujemi-2/scripts/generate-en-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyEnglishPhrases } from "./english-phrases.mjs";

/** Fallback word-level Albanian → English for long static paragraphs. */
const AL_WORDS = [
  ["është", "is"],
  ["janë", "are"],
  ["për", "for"],
  ["dhe", "and"],
  ["në", "in"],
  ["të", "to"],
  ["me", "with"],
  ["nga", "from"],
  ["ose", "or"],
  ["një", "a"],
  ["nuk", "not"],
  ["ju", "you"],
  ["ne", "we"],
  ["nëse", "if"],
  ["kur", "when"],
  ["që", "that"],
  ["si", "as"],
  ["duhet", "must"],
  ["mund", "can"],
  ["pas", "after"],
  ["para", "before"],
  ["çdo", "every"],
  ["vetëm", "only"],
  ["gjithë", "all"],
  ["përdoruesit", "users"],
  ["përdorues", "user"],
  ["njoftim", "listing"],
  ["njoftime", "listings"],
  ["shpallje", "listing"],
  ["postim", "post"],
  ["postoni", "post"],
  ["kategori", "category"],
  ["kategorinë", "category"],
  ["shitës", "seller"],
  ["blerës", "buyer"],
  ["platforma", "platform"],
  ["platformës", "platform"],
  ["falas", "free"],
  ["Operatori", "Operator"],
  ["ligjor", "legal"],
  ["Misioni", "Mission"],
  ["Rregullat", "Rules"],
  ["Politika", "Policy"],
  ["Kontakt", "Contact"],
  ["Pyetje", "Questions"],
  ["Siguria", "Security"],
  ["thjesht", "simply"],
  ["transparent", "transparent"],
  ["mbledhim", "collect"],
  ["përdorim", "use"],
  ["ruhen", "stored"],
  ["enkriptuara", "encrypted"],
  ["shesim", "sell"],
  ["marketing", "marketing"],
  ["kërkoni", "request"],
  ["fshirje", "deletion"],
  ["korrigjim", "correction"],
  ["verifikim", "verification"],
  ["autentifikim", "authentication"],
  ["mbështetje", "support"],
  ["parandalim", "prevention"],
  ["mashtrimesh", "fraud"],
  ["abuzimit", "abuse"],
  ["përmirësim", "improvement"],
  ["statistika", "statistics"],
  ["shërbimit", "service"],
  ["plotësoni", "fill in"],
  ["dërgo", "send"],
  ["mesazhin", "message"],
  ["subjektin", "subject"],
  ["emri", "name"],
  ["email-i", "email"],
  ["telefonit", "phone"],
  ["adresa", "address"],
  ["ligjore", "legal"],
  ["operatorit", "operator"],
  ["pranoni", "accept"],
  ["termat", "terms"],
  ["kushtet", "conditions"],
  ["përgjegjësi", "responsibility"],
  ["vërtetësinë", "accuracy"],
  ["postimit", "listing"],
  ["tuaj", "your"],
  ["tonë", "our"],
  ["zyrtare", "official"],
  ["diaspora", "diaspora"],
  ["shqiptare", "Albanian"],
  ["tregje", "markets"],
  ["tregun", "market"],
  ["lokal", "local"],
  ["shpejt", "quickly"],
  ["thjesht", "simply"],
  ["sigurt", "safely"],
  ["komisione", "fees"],
  ["fshehura", "hidden"],
  ["bazë", "basic"],
  ["hapësirë", "space"],
  ["ndërmjetëse", "intermediary"],
  ["marrëveshja", "agreement"],
  ["çmimit", "price"],
  ["dorëzimit", "delivery"],
  ["drejt", "direct"],
  ["palëve", "parties"],
  ["mes", "between"],
  ["palë", "party"],
];

function wordTranslate(text) {
  let s = applyEnglishPhrases(text);
  for (const [sq, en] of AL_WORDS) {
    s = s.replace(new RegExp(`\\b${sq}\\b`, "gi"), en);
  }
  return s;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vendiLib = path.join(root, "artifacts", "vendi", "src", "lib");

const ALBANIAN_CHARS = /[ëçËÇ]/;
const CYRILLIC = /[\u0400-\u04FF]/;

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
    entries.push({
      key: m[1],
      value: (m[2] ?? m[3] ?? "").replace(/\\n/g, "\n").replace(/\\"/g, '"'),
    });
  }
  return entries;
}

function parseConstObject(filePath, constName) {
  const src = fs.readFileSync(filePath, "utf8");
  const marker = `const ${constName}`;
  const start = src.indexOf(marker);
  if (start < 0) return [];
  const open = src.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return parseRecordEntries(src.slice(open + 1, i));
    }
  }
  return [];
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
    const v =
      value.includes("\n") || value.length > 120
        ? `\`${value.replace(/`/g, "\\`")}\``
        : `"${escapeTs(value)}"`;
    return `  ${key}: ${v},`;
  });
  return `export const ${name}: Record<string, string> = {\n${lines.join("\n")}\n};\n`;
}

const KEY_OVERRIDES = {
  ui_emptyListingsSubLong:
    "Be the first to post in this category and reach thousands of potential buyers!",
  ui_walletPerListing: "1 listing = €0.30 from balance",
  ui_walletCreditHint: "Credit does not expire — spend until used (@ €0.30/listing)",
  ui_walletListingsRemaining: "Listings remaining",
  ui_supportChatTitle: "Help",
  ui_payByCard: "Pay by card",
  ui_packagesContinuePost: "You can continue posting your listing.",
  ui_categorySuggestPick: "Choose this category",
  ui_giftPledgeLegal:
    'By clicking "Continue" you accept full legal responsibility for the accuracy of your listing.',
  ui_giftCategoryPriceNote: "In this category the price is always €0.",
  ui_walletTopupLimit: "You have reached the free limit. Top up your wallet (€0.30 per listing).",
  ui_walletPostSuccess: "Listing posted. Balance: €{balance} — {remaining} listings remaining.",
  ui_walletExtraPostCost:
    "You have reached the free limit. Each extra listing costs €{price} from your wallet.",
  ui_sellLangBlocked: 'Selling language is not allowed in "Wanted to Buy" (blocked word: "{word}").',
  ui_contentModerationFail: "Content did not pass automatic review.",
  ui_bankPaymentLogin: "Sign in to see payment instructions.",
  ui_bankPaymentNotFound: "Payment not found or bank transfer is not active.",
  ui_bankPaymentTitle: "Bank transfer (Kosovo)",
  ui_bankPaymentSub: "Bank transfer for wallet top-up",
  ui_beneficiaryLabel: "Beneficiary",
  ui_reportProblemPh: "Describe the problem…",
  ui_streetAddressPh: "Street, house number…",
  ui_postGiftBtn: "🎁 Post gift →",
  ui_postRequestBtn: "Post request",
  ui_paymentMethodsAria: "Payment methods",
  ui_diasporaMarketsTitle: "Germany, Switzerland, Austria, France, Italy, UK, USA, Montenegro",
  ui_giftPledgeBack: "Back",
  ui_giftPledgeWarnTitle: "⚠️ READ CAREFULLY BEFORE YOU CONTINUE",
  ui_giftPledgeIntro1:
    "This section is for kind-hearted people who want to help others.",
  ui_giftPledgeIntro2: "Any misuse is taken with the utmost seriousness.",
  ui_giftPledgeItem1:
    "I confirm the item is completely FREE — I will not ask for any payment, favour or service in return",
  ui_giftPledgeItem2:
    "I confirm the item exists physically and is available — this is not a fake or fraudulent listing",
  ui_giftPledgeItem3:
    "I confirm the photos are real and of my item — not stock images or someone else's photos",
  ui_giftPledgeItem4:
    "I understand anyone who misuses this section for fraud, advertising or harmful purposes is reported immediately and permanently banned",
  ui_giftPledgeItem5:
    "I understand KetuJemi monitors every post in this category and may remove any listing without warning",
  ui_giftPledgeContinue: "✅ I understand & agree — Continue →",
  ui_supportWelcome:
    "Hello! Ask briefly — I will guide you where to go on KetuJemi.",
  ui_supportBusy: "Could not reach the server. Please try again.",
  ui_supportVoiceError:
    "Microphone was not enabled. Allow the microphone in your browser and try again.",
  ui_supportVoiceHttps: "For voice (🎤) open the page over HTTPS: https://ketujemi.com",
  ui_supportVoiceMobile: "For voice use Chrome on desktop.",
  ui_supportVoiceUnsupported:
    "This browser does not support voice. Use Chrome or Edge on desktop.",
  ui_supportTyping: "Typing…",
  ui_supportListening: "Listening… speak now",
  ui_supportInputPh: "Type your question…",
  ui_supportListeningPh: "Listening to voice…",
  ui_supportVoiceStopAria: "Stop and send",
  ui_supportVoiceStartAria: "Speak with voice",
  ui_supportCloseAria: "Close",
  ui_supportFab: "Help",
  ui_categorySuggestTitle: "AI category tip",
  ui_categorySuggestAnalyzing: "Analyzing your title…",
  ui_categorySuggestDismiss: "Thanks, I know",
  ui_categorySuggestMsg:
    "{product} belongs in category «{category}» — choosing the right category helps you reach more buyers!",
  ui_categorySuggestDefaultProduct: "Your item",
  ui_walletTitle: "Wallet",
  ui_walletBalanceLabel: "Balance",
  ui_walletTopupTitle: "Top up wallet (S / M / L)",
  ui_walletPayOnline: "Pay online",
  ui_walletStripeNotConfigured:
    "Online payment is not configured on the server yet (Stripe or Kosovo bank).",
  ui_walletStripeHint:
    "Pay by card (Visa/Mastercard) via Stripe — available from Kosovo and the diaspora.",
  ui_walletRefresh: "Refresh balance",
  ui_paymentFailed: "Payment failed",
  ui_networkError: "Network error",
  lz_country_any: "All countries",
  lz_country_lbl: "Country",
  lz_country_ph: "Select country",
};

function toEnglish(key, ks, mne) {
  if (KEY_OVERRIDES[key]) return KEY_OVERRIDES[key];
  let base = ks;
  if (mne && !CYRILLIC.test(mne)) base = mne;
  let s = wordTranslate(base);
  if (ALBANIAN_CHARS.test(s) || CYRILLIC.test(s)) {
    s = wordTranslate(ks);
  }
  if (CYRILLIC.test(s) && mne && !CYRILLIC.test(mne)) {
    s = wordTranslate(mne);
  }
  return s;
}

function translateStringValue(value) {
  const raw = value.replace(/\\n/g, "\n").replace(/\\"/g, '"');
  const exact = applyEnglishPhrases(raw);
  if (!ALBANIAN_CHARS.test(exact)) return exact;
  return wordTranslate(raw);
}

/** Static legal pages: phrase map only (word-level breaks Albanian/MNE prose). */
function translateStaticStringValue(value) {
  const raw = value.replace(/\\n/g, "\n").replace(/\\"/g, '"');
  return applyEnglishPhrases(raw);
}

function translateTsStringLiterals(chunk, staticPages = false) {
  const tr = (inner) => {
    const raw = inner.replace(/\\n/g, "\n").replace(/\\"/g, '"');
    return escapeTs(
      staticPages ? translateStaticStringValue(raw) : translateStringValue(raw),
    );
  };
  let out = chunk.replace(
    /^(\s+)(\w+):\s*"((?:\\.|[^"\\])*)"/gm,
    (_, indent, key, inner) => `${indent}${key}: "${tr(inner)}"`,
  );
  out = out.replace(
    /^(\s+)"((?:\\.|[^"\\])*)",?\s*$/gm,
    (_, indent, inner) => `${indent}"${tr(inner)}",`,
  );
  out = out.replace(
    /:\s*\[\s*"((?:\\.|[^"\\])*)"\s*\]/g,
    (_, inner) => `: ["${tr(inner)}"]`,
  );
  return out;
}

// ── app-extra-i18n-en.ts ─────────────────────────────────────────────────────
const extraPath = path.join(vendiLib, "app-extra-i18n.ts");
const extraSrc = fs.readFileSync(extraPath, "utf8");
const ksBody = extractObjectBlock(extraSrc, "const KS_EXTRA", "const AL_OVERRIDES");
const mneBody = extractObjectBlock(extraSrc, "const MNE_EXTRA", "export const EXTRA_TRANSLATIONS");
const ksEntries = parseRecordEntries(ksBody);
const mneMap = Object.fromEntries(parseRecordEntries(mneBody).map((e) => [e.key, e.value]));

const akKs = parseConstObject(path.join(vendiLib, "arsim-kurse-form-i18n.ts"), "KS");
const akMne = Object.fromEntries(
  parseConstObject(path.join(vendiLib, "arsim-kurse-form-i18n.ts"), "MNE").map((e) => [e.key, e.value]),
);
const soKs = parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "KS");
const soMne = Object.fromEntries(
  parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "MNE").map((e) => [e.key, e.value]),
);

const allKeys = new Map();
for (const e of [...ksEntries, ...akKs, ...soKs]) allKeys.set(e.key, e.value);
for (const [key, ks] of allKeys) {
  allKeys.set(key, ks);
}

const enEntries = [...allKeys.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, ks]) => ({
    key,
    value: toEnglish(key, ks, mneMap[key] ?? soMne[key] ?? akMne[key]),
  }));

const enExtraPath = path.join(vendiLib, "app-extra-i18n-en.ts");
fs.writeFileSync(
  enExtraPath,
  `/** Auto-generated — run ketujemi-2/scripts/generate-en-i18n.mjs */\n\n${formatRecord("EN_EXTRA", enEntries)}`,
  "utf8",
);
console.log(`Wrote ${enExtraPath} (${enEntries.length} keys)`);

// ── arsim / sport EN consts ──────────────────────────────────────────────────
const enAk = akKs.map(({ key, value }) => ({ key, value: toEnglish(key, value, akMne[key]) }));
const enSo = soKs.map(({ key, value }) => ({ key, value: toEnglish(key, value, soMne[key]) }));

const akPath = path.join(vendiLib, "arsim-kurse-form-i18n.ts");
let akSrc = fs.readFileSync(akPath, "utf8");
if (!akSrc.includes("export const EN_AK_FORM")) {
  akSrc = akSrc.replace(
    "export const MNE_AK_FORM = MNE;",
    `${formatRecord("EN_AK", enAk).replace("Record<string, string>", "Record<keyof typeof KS, string>")}\nexport const EN_AK_FORM = EN_AK;\nexport const MNE_AK_FORM = MNE;`,
  );
  fs.writeFileSync(akPath, akSrc, "utf8");
  console.log("Updated arsim-kurse-form-i18n.ts with EN_AK_FORM");
}

const soPath = path.join(vendiLib, "sport-outdoor-device-i18n.ts");
let soSrc = fs.readFileSync(soPath, "utf8");
if (!soSrc.includes("export const EN_SO_DEVICE")) {
  soSrc = soSrc.replace(
    "export const MNE_SO_DEVICE = MNE;",
    `${formatRecord("EN_SO", enSo).replace("Record<string, string>", "Record<keyof typeof KS, string>")}\nexport const EN_SO_DEVICE = EN_SO;\nexport const MNE_SO_DEVICE = MNE;`,
  );
  fs.writeFileSync(soPath, soSrc, "utf8");
  console.log("Updated sport-outdoor-device-i18n.ts with EN_SO_DEVICE");
}

// ── static-pages-i18n-en.ts (from MNE Latin — phrase map to English) ─────────────
const staticPath = path.join(vendiLib, "static-pages-i18n.ts");
const staticSrc = fs.readFileSync(staticPath, "utf8");
const mneStaticStart = staticSrc.indexOf("const MNE: StaticPagesCopy = {");
const mneStaticEnd = staticSrc.indexOf("export const STATIC_PAGES:");
let mneStaticBlock = staticSrc.slice(mneStaticStart, mneStaticEnd);
mneStaticBlock = translateTsStringLiterals(mneStaticBlock, true);
mneStaticBlock = mneStaticBlock.replace("const MNE:", "export const EN_STATIC_PAGES:");

const enStaticPath = path.join(vendiLib, "static-pages-i18n-en.ts");
fs.writeFileSync(
  enStaticPath,
  `/** Auto-generated — run ketujemi-2/scripts/generate-en-i18n.mjs */\nimport type { StaticPagesCopy } from "./static-pages-i18n";\n\n${mneStaticBlock}`,
  "utf8",
);
console.log(`Wrote ${enStaticPath}`);

// ── category-translations — full CAT_EN ───────────────────────────────────────
const catPath = path.join(vendiLib, "category-translations.ts");
const catSrc = fs.readFileSync(catPath, "utf8");
const catBody = extractObjectBlock(catSrc, "export const CAT_TRANSLATIONS", "};");
const catRe = /"((?:\\.|[^"\\])+)":\s*\{\s*ks:\s*"((?:\\.|[^"\\])*)",\s*al:[^,]+,\s*mk:\s*"((?:\\.|[^"\\])*)",\s*mne:\s*"((?:\\.|[^"\\])*)"\s*\}/g;
const catEn = {};
let cm;
while ((cm = catRe.exec(catBody)) !== null) {
  const name = cm[1];
  const ks = cm[2];
  const mne = cm[4];
  catEn[name] = toEnglish(name, ks, mne);
}

const catEnPath = path.join(vendiLib, "category-translations-en.generated.ts");
fs.writeFileSync(
  catEnPath,
  `/** Auto-generated English category labels */\nexport const CAT_EN_GENERATED: Record<string, string> = ${JSON.stringify(catEn, null, 2)};\n`,
  "utf8",
);

let updatedCat = catSrc;
if (!updatedCat.includes("category-translations-en.generated")) {
  updatedCat = updatedCat.replace(
    'import { translateFemijeCategory } from "./femije-category-translations";',
    'import { translateFemijeCategory } from "./femije-category-translations";\nimport { CAT_EN_GENERATED } from "./category-translations-en.generated";',
  );
}
updatedCat = updatedCat.replace(
  /const CAT_EN: Record<string, string> = \{[\s\S]*?\};/,
  "",
);
updatedCat = updatedCat.replace(
  /CAT_EN\[name\]/g,
  "CAT_EN_GENERATED[name]",
);
if (!updatedCat.includes("UiCategoryLocale")) {
  updatedCat = updatedCat.replace(
    'export type MarketCode = "ks" | "al" | "mk" | "mne";',
    'export type MarketCode = "ks" | "al" | "mk" | "mne";\nexport type UiCategoryLocale = MarketCode | "en";',
  );
}
if (!updatedCat.includes('localeCode === "en"')) {
  updatedCat = updatedCat.replace(
    /export function translateCategory\(name: string, localeCode: [^)]+\): string \{/,
    `export function translateCategory(name: string, localeCode: UiCategoryLocale): string {
  if (localeCode === "en") {
    return (
      CAT_EN_GENERATED[name] ??
      translateArsimKurseCategory(name, "en") ??
      translateFemijeCategory(name, "en") ??
      name
    );
  }`,
  );
}
fs.writeFileSync(catPath, updatedCat, "utf8");
console.log(`Wrote ${catEnPath} (${Object.keys(catEn).length} categories)`);
