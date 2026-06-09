/**
 * Generates complete English UI bundles.
 * Run: node ketujemi-2/scripts/generate-en-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyEnglishPhrases } from "./english-phrases.mjs";
import { wordTranslateSqToEn } from "./albanian-words.mjs";
import { categoryEnglishFromKs } from "./category-en-from-ks.mjs";
import { categorySqToEnglish } from "./category-sq-en.mjs";
import { PANEL_EN } from "./panel-i18n.mjs";
import { SO_DEVICE_EN } from "./sport-device-i18n.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

function categoryEnFromSq(sq) {
  let en = categoryEnglishFromKs(sq);
  if (en === sq || ALBANIAN_CHARS.test(en)) en = categorySqToEnglish(sq);
  return en;
}

function wordTranslate(text) {
  return wordTranslateSqToEn(text, applyEnglishPhrases);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vendiLib = path.join(root, "artifacts", "vendi", "src", "lib");

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

function unescapeTsString(raw) {
  return raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
}

function parseRecordEntries(body) {
  const byKey = new Map();
  const add = (key, value) => {
    if (key && value !== undefined) byKey.set(key, unescapeTsString(value));
  };

  // key:\n    "value" or 'value'
  const multiRe =
    /^\s+(\w+):\s*\n\s*(["'])((?:\\.|(?!\2)[\s\S])*?)\2,?\s*$/gm;
  let m;
  while ((m = multiRe.exec(body)) !== null) add(m[1], m[3]);

  // key: "value" (same line)
  const singleRe = /^\s+(\w+):\s*(["'])((?:\\.|(?!\2)[^\\2])*)\2,?\s*$/gm;
  while ((m = singleRe.exec(body)) !== null) {
    if (!byKey.has(m[1])) add(m[1], m[3]);
  }

  // key: `template`
  const backtickRe = /^\s+(\w+):\s*`([\s\S]*?)`,?\s*$/gm;
  while ((m = backtickRe.exec(body)) !== null) {
    if (!byKey.has(m[1])) add(m[1], m[2]);
  }

  return [...byKey.entries()].map(([key, value]) => ({ key, value }));
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
  home_partnerHeading: "Our trusted partners",
  home_partnerEmptySignupVip: "Register as VIP Partner",
  home_partnerEmptySignupStandard: "Register as Partner",
  home_categoriesLoadError: "Categories could not load. Please refresh the page.",
  home_topListingsHeading: "TOP LISTINGS",
  home_topListingsRowLabel: "TOP LISTINGS",
  nav_menuAria: "Open menu",
  nav_menuTitle: "Menu",
  nav_home: "Home",
  nav_postShort: "Post",
  login_heading: "Log in",
  login_heading_register: "Sign up",
  login_mode_login: "Log in",
  login_mode_register: "Sign up",
  login_submit_login: "Log in",
  login_submit_register: "Create account",
  login_welcomeBack: "Welcome back!",
  login_forgotPassword: "Forgot your password? Reset via email",
  login_forgotHint: "Enter your email — we will send a code to set a new password.",
  login_resetHint: "Enter the code from your email and your new password.",
  login_forgotBtn: "Send code",
  login_resetBtn: "Save new password",
  login_backToSignin: "← Back to email + password",
  login_passwordResetDone: "Password updated. You are signed in.",
  login_sub_login: "Enter your email or phone and password.",
  login_sub_register: "Email or phone + password only. Takes a few seconds.",
  login_sub_email_only: "Sign up or log in with email and password.",
  login_sub_login_email_verify:
    "Enter email and password — you will receive a code by email, then sign in.",
  login_sub_register_email_verify:
    "Sign up with email. You will receive a confirmation code by email.",
  login_sub_register_email_only:
    "New account: code by email. Already registered? Email + password — sign in immediately.",
  login_smsDisabledHint:
    "Phone sign-in is not active. Sign up with email (existing accounts too — you will receive a code).",
  login_stripeBody:
    "Linking a bank card as a payment method will be available soon via Stripe. For now you can only sign in with email or SMS.",
  login_sub:
    "To post listings, use email + password or SMS verification (Vonage).",
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
  hub_banesa_sub:
    "Select transaction type, property type and filters — results update automatically in the list below.",
  hub_drill_pick_type: "Choose category — each selection opens a new page with filters.",
  so_type_pick_hint:
    "Choose what you are looking for — each option opens a page with filters and listings.",
  hub_pickBrandLbl: "Choose brand",
  hub_pickModelLbl: "Select model",
  hub_model_pickBrandFirst: "Select a brand first",
  hub_model_pickBrandOrBody: "Choose brand or body type",
  ak_select_category_ph: "Select category…",
  ak_select_subcategory_ph: "Select subcategory…",
  ak_select_city_ph: "Select city…",
  ak_fld_category: "Select category",
  ak_fld_subcategory: "Select subcategory",
  ak_fld_city: "City",
  login_phoneIntro: "Enter the phone number in international format (e.g. +383…).",
  lz_panel_sub: "Search commercial premises, offices, warehouses, industrial units and garages.",
  lz_sec_office_count: "Number of offices",
  profile_add_email_ok: "Email added and verified.",
  profile_add_phone_ok: "Phone added and verified.",
  ps_st_lirim_banesash: "Apartment & office clearance",
  reg_sellerGate_save: "Save and continue",
  shop_apply_gate_start: "Confirm and continue with the application",
  shop_edit_gate_start: "Confirm and edit shop",
  so_intro_martial: "Paragliding, drones, helmets and safety straps.",
  so_intro_winter: "Ski, snowboard, thermal clothing and goggles.",
  ...PANEL_EN,
};

/** Keys where word-by-word replacement produces broken hybrid text. */
function usesPhraseOnlyTranslation(key) {
  return /^(login_|nav_|toast_|reg_|nf_|home_ad|hub_|so_|fj_|ap_|lz_|tel_|cat_|mh_|ps_|ep_|delete_|ak_|ui_)/.test(
    key,
  );
}

function mneToEnglish(mne) {
  if (!mne || CYRILLIC.test(mne)) return null;
  const tr = translateStaticStringValue(mne);
  if (ALBANIAN_CHARS.test(tr) || CYRILLIC.test(tr)) return null;
  return tr;
}

function toEnglish(key, ks, mne) {
  if (KEY_OVERRIDES[key]) return KEY_OVERRIDES[key];
  if (key.endsWith("_from") && (ks === "Nga" || ks === "Od")) return "From";
  if (key.endsWith("_to") && (ks === "Deri" || ks === "Do")) return "To";
  let en = usesPhraseOnlyTranslation(key)
    ? translateStaticStringValue(ks)
    : translateStringValue(ks);
  if (
    ALBANIAN_CHARS.test(en) &&
    !/^(hub_|ap_|cat_|fj_|ak_|lz_|so_|mh_|ps_|rk_|ksh_|bb_|ep_|md_|ni_|kl_|tel_)/.test(key)
  ) {
    const fromMne = mneToEnglish(mne);
    if (fromMne) en = fromMne;
  }
  return en;
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
const alBody = extractObjectBlock(extraSrc, "const AL_OVERRIDES", "const MK_EXTRA");
const mneBody = extractObjectBlock(extraSrc, "const MNE_EXTRA", "export const EXTRA_TRANSLATIONS");
const ksEntries = parseRecordEntries(ksBody);
const alEntries = parseRecordEntries(alBody);
const mneMap = Object.fromEntries(parseRecordEntries(mneBody).map((e) => [e.key, e.value]));

const akKs = parseConstObject(path.join(vendiLib, "arsim-kurse-form-i18n.ts"), "KS");
const akMne = Object.fromEntries(
  parseConstObject(path.join(vendiLib, "arsim-kurse-form-i18n.ts"), "MNE").map((e) => [e.key, e.value]),
);
const soKs = parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "KS");
const soMne = Object.fromEntries(
  parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "MNE").map((e) => [e.key, e.value]),
);

/** AL_OVERRIDES wins over KS_EXTRA (same as `al` bundle). */
const allKeys = new Map();
for (const e of ksEntries) allKeys.set(e.key, e.value);
for (const e of alEntries) allKeys.set(e.key, e.value);
for (const e of [...akKs, ...soKs]) allKeys.set(e.key, e.value);

const enEntries = [...allKeys.entries()]
  .filter(([key]) => !key.startsWith("adm_"))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, ks]) => ({
    key,
    value: toEnglish(key, ks, mneMap[key] ?? soMne[key] ?? akMne[key]),
  }));

function formatRecordBody(entries) {
  return entries
    .map(({ key, value }) => {
      const v =
        value.includes("\n") || value.length > 120
          ? `\`${value.replace(/`/g, "\\`")}\``
          : `"${escapeTs(value)}"`;
      return `  ${key}: ${v},`;
    })
    .join("\n");
}

const enExtraPath = path.join(vendiLib, "app-extra-i18n-en.ts");
fs.writeFileSync(
  enExtraPath,
  `/** Auto-generated — run ketujemi-2/scripts/generate-en-i18n.mjs */
/** adm_* strings live in admin-en-i18n.ts (hand-maintained). */

import { ADMIN_EN_EXTRA } from "./admin-en-i18n";

export const EN_EXTRA: Record<string, string> = {
  ...ADMIN_EN_EXTRA,
${formatRecordBody(enEntries)}
};
`,
  "utf8",
);
console.log(`Wrote ${enExtraPath} (${enEntries.length} non-admin keys + ADMIN_EN_EXTRA)`);

// ── arsim / sport EN consts ──────────────────────────────────────────────────
const enAk = akKs.map(({ key, value }) => ({
  key,
  value: PANEL_EN[key] ?? toEnglish(key, value, akMne[key]),
}));
const enSo = soKs.map(({ key, value }) => ({
  key,
  value: SO_DEVICE_EN[key] ?? toEnglish(key, value, soMne[key]),
}));

const akPath = path.join(vendiLib, "arsim-kurse-form-i18n.ts");
let akSrc = fs.readFileSync(akPath, "utf8");
const enAkBlock = `const EN_AK: Record<keyof typeof KS, string> = {\n${formatRecordBody(enAk)}\n};\nexport const EN_AK_FORM = EN_AK;\n`;
if (akSrc.includes("export const EN_AK_FORM")) {
  akSrc = akSrc.replace(/const EN_AK:[\s\S]*?export const EN_AK_FORM = EN_AK;\n/, enAkBlock);
} else {
  akSrc = akSrc.replace(
    "export const MNE_AK_FORM = MNE;",
    `${enAkBlock}export const MNE_AK_FORM = MNE;`,
  );
}
fs.writeFileSync(akPath, akSrc, "utf8");
console.log("Updated arsim-kurse-form-i18n.ts EN_AK_FORM");

const soPath = path.join(vendiLib, "sport-outdoor-device-i18n.ts");
let soSrc = fs.readFileSync(soPath, "utf8");
const enSoBlock = `const EN_SO: Record<keyof typeof KS, string> = {\n${formatRecordBody(enSo)}\n};\nexport const EN_SO_DEVICE = EN_SO;\n`;
if (soSrc.includes("export const EN_SO_DEVICE")) {
  soSrc = soSrc.replace(/const EN_SO:[\s\S]*?export const EN_SO_DEVICE = EN_SO;\n/, enSoBlock);
} else {
  soSrc = soSrc.replace(
    "export const MNE_SO_DEVICE = MNE;",
    `${enSoBlock}export const MNE_SO_DEVICE = MNE;`,
  );
}
fs.writeFileSync(soPath, soSrc, "utf8");
console.log("Updated sport-outdoor-device-i18n.ts EN_SO_DEVICE");

// ── static-pages-i18n-en.ts (hand-maintained — do not auto-overwrite) ───────────
const enStaticPath = path.join(vendiLib, "static-pages-i18n-en.ts");
if (fs.existsSync(enStaticPath)) {
  console.log(`Skipped ${enStaticPath} (hand-maintained)`);
} else {
  console.warn(`Missing hand-maintained ${enStaticPath}`);
}

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
  catEn[name] = categoryEnFromSq(ks || name);
}

const extraCatKeyRe = /"((?:\\.|[^"\\])+)"\s*:\s*\{\s*mk:/g;
for (const file of ["femije-category-translations.ts", "arsim-kurse-category-translations.ts"]) {
  const src = fs.readFileSync(path.join(vendiLib, file), "utf8");
  let km;
  while ((km = extraCatKeyRe.exec(src)) !== null) {
    const name = km[1];
    if (!catEn[name]) catEn[name] = categoryEnFromSq(name);
  }
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
