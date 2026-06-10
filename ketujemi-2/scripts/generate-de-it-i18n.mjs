/**
 * Generates German + Italian UI bundles (sq → en → de/it), mirroring generate-fr-i18n.mjs.
 * Run: node ketujemi-2/scripts/generate-de-it-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { albanianToGerman, englishToGerman } from "./albanian-german.mjs";
import { albanianToItalian, englishToItalian } from "./albanian-italian.mjs";
import { AUTH_ACCOUNT_EN } from "./auth-account-i18n.mjs";
import { PANEL_EN } from "./panel-i18n.mjs";
import { SO_DEVICE_EN } from "./sport-device-i18n.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vendiLib = path.join(root, "artifacts", "vendi", "src", "lib");

function escapeTs(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
}

function unescapeTsString(raw) {
  return raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
}

function parseRecordEntries(body) {
  const byKey = new Map();
  const add = (key, value) => {
    if (key && value !== undefined) byKey.set(key, unescapeTsString(value));
  };
  const multiRe = /^\s+(\w+):\s*\n\s*(["'])((?:\\.|(?!\2)[\s\S])*?)\2,?\s*$/gm;
  let m;
  while ((m = multiRe.exec(body)) !== null) add(m[1], m[3]);
  const singleRe = /^\s+(\w+):\s*(["'])((?:\\.|(?!\2)[^\\2])*)\2,?\s*$/gm;
  while ((m = singleRe.exec(body)) !== null) {
    if (!byKey.has(m[1])) add(m[1], m[3]);
  }
  const backtickRe = /^\s+(\w+):\s*`([\s\S]*?)`,?\s*$/gm;
  while ((m = backtickRe.exec(body)) !== null) {
    if (!byKey.has(m[1])) add(m[1], m[2]);
  }
  return [...byKey.entries()].map(([key, value]) => ({ key, value }));
}

function findConstStart(src, constName) {
  for (const prefix of ["", "export "]) {
    const idx = src.indexOf(`${prefix}const ${constName}`);
    if (idx >= 0) return idx;
  }
  return -1;
}

function extractConstBlock(src, constName) {
  const start = findConstStart(src, constName);
  if (start < 0) return null;
  const semi = src.indexOf("};", start);
  if (semi < 0) return null;
  return src.slice(start, semi + 2);
}

function objectBody(src, constName) {
  const start = findConstStart(src, constName);
  if (start < 0) return "";
  const open = src.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(open + 1, i);
    }
  }
  return "";
}

function parseConstObject(filePath, constName) {
  const src = fs.readFileSync(filePath, "utf8");
  const body = objectBody(src, constName);
  if (!body) return [];
  const parsed = parseRecordEntries(body);
  const parsedKeys = new Set(parsed.map((e) => e.key));
  for (const m of body.matchAll(/^\s+(\w+):/gm)) {
    if (!parsedKeys.has(m[1])) parsed.push({ key: m[1], value: "" });
  }
  return parsed;
}

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

function translateEnLine(line, toLocale) {
  const tr = toLocale === "de" ? englishToGerman : englishToItalian;
  return tr(line);
}

function translateEnText(text, toLocale) {
  const tr = toLocale === "de" ? englishToGerman : englishToItalian;
  if (!text) return text;
  if (text.includes("\n")) {
    return text.split("\n").map((line) => translateEnLine(line, toLocale)).join("\n");
  }
  return translateEnLine(text, toLocale);
}

const SQ_DIRECT = /^(login_|delete_|profile_)/;

function toLocaleFromEn(locale, key, enValue, ksValue) {
  const albanianFn = locale === "de" ? albanianToGerman : albanianToItalian;
  const enFn = locale === "de" ? englishToGerman : englishToItalian;
  if (PANEL_EN[key]) return enFn(PANEL_EN[key]);
  if (AUTH_ACCOUNT_EN[key]) return enFn(AUTH_ACCOUNT_EN[key]);
  if ((!enValue || enValue === ksValue) && ksValue && /[ëçËÇ]/.test(ksValue)) {
    return albanianFn(key, ksValue);
  }
  if (SQ_DIRECT.test(key) && ksValue) return albanianFn(key, ksValue);
  if (key.endsWith("_from") && (enValue === "From" || enValue === "Nga")) {
    return locale === "de" ? "Von" : "Da";
  }
  if (key.endsWith("_to") && (enValue === "To" || enValue === "Deri")) {
    return locale === "de" ? "Bis" : "A";
  }
  return translateEnText(enValue, locale);
}

function translateEnTsStringLiterals(chunk, toLocale) {
  const tr = (inner) =>
    escapeTs(
      translateEnText(inner.replace(/\\n/g, "\n").replace(/\\"/g, '"'), toLocale),
    );
  let out = chunk;
  out = out.replace(
    /(\w+):\s*"((?:\\.|[^"\\])*)"/g,
    (_, key, inner) => `${key}: "${tr(inner)}"`,
  );
  out = out.replace(
    /^(\s+)(\w+):\s*"((?:\\.|[^"\\])*)"/gm,
    (_, indent, key, inner) => `${indent}${key}: "${tr(inner)}"`,
  );
  out = out.replace(/^(\s+)"((?:\\.|[^"\\])*)",?\s*$/gm, (_, indent, inner) => {
    return `${indent}"${tr(inner)}",`;
  });
  out = out.replace(/^(\s+)(\w+):\s*`([\s\S]*?)`,?\s*$/gm, (_, indent, key, inner) => {
    const loc = translateEnText(inner, toLocale);
    return `${indent}${key}: \`${loc.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`,`;
  });
  return out;
}

const ksExtraEntries = parseConstObject(path.join(vendiLib, "app-extra-i18n.ts"), "KS_EXTRA");
const ksExtraMap = Object.fromEntries(ksExtraEntries.map((e) => [e.key, e.value]));
const enExtraEntries = parseConstObject(path.join(vendiLib, "app-extra-i18n-en.ts"), "EN_EXTRA");
const enAk = parseConstObject(path.join(vendiLib, "arsim-kurse-form-i18n.ts"), "EN_AK");
const enSo = parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "EN_SO");
const soKs = parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "KS");

const allEnKeys = new Map();
for (const e of enExtraEntries) allEnKeys.set(e.key, e.value);
for (const e of enAk) allEnKeys.set(e.key, e.value);
for (const e of enSo) allEnKeys.set(e.key, e.value);

function writeExtra(locale) {
  const constName = locale === "de" ? "DE_EXTRA" : "IT_EXTRA";
  const fileName = locale === "de" ? "app-extra-i18n-de.ts" : "app-extra-i18n-it.ts";
  const masterKeys = new Set();
  for (const { key } of ksExtraEntries) {
    if (!key.startsWith("adm_")) masterKeys.add(key);
  }
  for (const { key } of enExtraEntries) masterKeys.add(key);
  for (const { key } of enAk) masterKeys.add(key);
  for (const { key } of enSo) masterKeys.add(key);
  const entries = [...masterKeys]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const en = allEnKeys.get(key) ?? ksExtraMap[key] ?? key;
      return {
        key,
        value: toLocaleFromEn(locale, key, en, ksExtraMap[key]),
      };
    });
  const outPath = path.join(vendiLib, fileName);
  fs.writeFileSync(
    outPath,
    `/** Auto-generated — sq→en→${locale} via ketujemi-2/scripts/generate-de-it-i18n.mjs */\nexport const ${constName}: Record<string, string> = {\n${formatRecordBody(entries)}\n};\n`,
    "utf8",
  );
  console.log(`Wrote ${outPath} (${entries.length} keys)`);
}

writeExtra("de");
writeExtra("it");

function patchAkSo(locale) {
  const akConst = locale === "de" ? "DE_AK" : "IT_AK";
  const soConst = locale === "de" ? "DE_SO" : "IT_SO";
  const akExport = locale === "de" ? "DE_AK_FORM" : "IT_AK_FORM";
  const soExport = locale === "de" ? "DE_SO_DEVICE" : "IT_SO_DEVICE";

  const akLocale = enAk.map(({ key, value }) => ({
    key,
    value: toLocaleFromEn(locale, key, value),
  }));
  const enSoMap = Object.fromEntries(enSo.map((e) => [e.key, e.value]));
  const soLocale = soKs.map(({ key }) => ({
    key,
    value: toLocaleFromEn(locale, key, enSoMap[key] ?? ""),
  }));

  const akPath = path.join(vendiLib, "arsim-kurse-form-i18n.ts");
  let akSrc = fs.readFileSync(akPath, "utf8");
  const akBlock = `const ${akConst}: Record<keyof typeof KS, string> = {\n${formatRecordBody(akLocale)}\n};\nexport const ${akExport} = ${akConst};\n`;
  if (akSrc.includes(`export const ${akExport}`)) {
    akSrc = akSrc.replace(
      new RegExp(`const ${akConst}:[\\s\\S]*?export const ${akExport} = ${akConst};\\n`),
      akBlock,
    );
  } else {
    akSrc = akSrc.replace(
      "export const FR_AK_FORM = FR_AK;",
      `${akBlock}export const FR_AK_FORM = FR_AK;`,
    );
  }
  fs.writeFileSync(akPath, akSrc, "utf8");

  const soPath = path.join(vendiLib, "sport-outdoor-device-i18n.ts");
  let soSrc = fs.readFileSync(soPath, "utf8");
  const soBlock = `const ${soConst}: Record<keyof typeof KS, string> = {\n${formatRecordBody(soLocale)}\n};\nexport const ${soExport} = ${soConst};\n`;
  if (soSrc.includes(`export const ${soExport}`)) {
    soSrc = soSrc.replace(
      new RegExp(`const ${soConst}:[\\s\\S]*?export const ${soExport} = ${soConst};\\n`),
      soBlock,
    );
  } else {
    soSrc = soSrc.replace(
      "export const FR_SO_DEVICE = FR_SO;",
      `${soBlock}export const FR_SO_DEVICE = FR_SO;`,
    );
  }
  fs.writeFileSync(soPath, soSrc, "utf8");
  console.log(`Updated arsim + sport for ${locale}`);
}

patchAkSo("de");
patchAkSo("it");

const PAGE_FILES = [
  "shop-application-i18n.ts",
  "shop-detail-i18n.ts",
  "shop-dashboard-i18n.ts",
  "open-shop-page-i18n.ts",
  "advertise-page-i18n.ts",
  "vip-packages-page-i18n.ts",
  "partner-page-i18n.ts",
  "partner-profile-i18n.ts",
  "listing-limit-i18n.ts",
  "business-profile-i18n.ts",
  "my-listings-month-i18n.ts",
  "report-listing-i18n.ts",
  "stripe-checkout-i18n.ts",
  "platform-markets-i18n.ts",
  "phone-prefix-i18n.ts",
  "listing-post-feedback-i18n.ts",
  "listing-post-preflight-i18n.ts",
  "wallet-bank-payment-i18n.ts",
  "shop-rating-i18n.ts",
  "shop-directory-i18n.ts",
  "partner-profile-panel-i18n.ts",
];

function patchPageI18n(fileName, locale) {
  const locUpper = locale === "de" ? "DE" : "IT";
  const filePath = path.join(vendiLib, fileName);
  let src = fs.readFileSync(filePath, "utf8");
  const enBlock = extractConstBlock(src, "EN");
  if (!enBlock) {
    console.warn(`No EN block in ${fileName}`);
    return;
  }
  let locBlock = enBlock.replace(/^((?:export )?)const EN:/, `$1const ${locUpper}:`);
  locBlock = translateEnTsStringLiterals(locBlock, locale);
  const old = extractConstBlock(src, locUpper);
  if (old) src = src.replace(old, locBlock);
  else src = src.replace(enBlock, `${enBlock}\n\n${locBlock}`);
  const pagesRe = new RegExp(`${locale}: EN,`);
  if (pagesRe.test(src)) src = src.replace(pagesRe, `${locale}: ${locUpper},`);
  else if (!src.includes(`${locale}: ${locUpper},`)) {
    src = src.replace(/fr: FR,/, `fr: FR,\n  ${locale}: ${locUpper},`);
  }
  fs.writeFileSync(filePath, src, "utf8");
  console.log(`Patched ${fileName} (${locale})`);
}

for (const f of PAGE_FILES) {
  patchPageI18n(f, "de");
  patchPageI18n(f, "it");
}

function patchEngagement(locale) {
  const locUpper = locale === "de" ? "de" : "it";
  const filePath = path.join(vendiLib, "engagement-i18n.ts");
  let src = fs.readFileSync(filePath, "utf8");
  src = src.replace(
    /export type EngagementLocale = "ks" \| "mk" \| "mne" \| "en" \| "fr";/,
    'export type EngagementLocale = "ks" | "mk" | "mne" | "en" | "fr" | "de" | "it";',
  );
  const copyStart = src.indexOf("const COPY: Record<EngagementLocale, EngagementCopy> = {");
  if (copyStart < 0) return;
  const enStart = src.indexOf("\n  en: {", copyStart);
  const frStart = src.indexOf("\n  fr: {", copyStart);
  if (enStart < 0 || frStart < 0) return;
  const enBlock = src.slice(enStart, frStart);
  let locBlock = enBlock.replace(/\n  en: \{/, `\n  ${locUpper}: {`);
  locBlock = translateEnTsStringLiterals(locBlock, locale);
  const oldStart = src.indexOf(`\n  ${locUpper}: {`, copyStart);
  if (oldStart >= 0) {
    const oldEnd = src.indexOf("\n};", oldStart);
    src = src.slice(0, oldStart) + locBlock + src.slice(oldEnd);
  } else {
    const copyEnd = src.indexOf("\n};", frStart);
    src = src.slice(0, copyEnd) + locBlock + src.slice(copyEnd);
  }
  fs.writeFileSync(filePath, src, "utf8");
  console.log(`Patched engagement-i18n.ts (${locale})`);
}

function patchErrorPage(locale) {
  const filePath = path.join(vendiLib, "error-page-i18n.ts");
  let src = fs.readFileSync(filePath, "utf8");
  const enStart = src.indexOf("\n  en: {");
  const frStart = src.indexOf("\n  fr: {");
  if (enStart < 0 || frStart < 0) return;
  const enBlock = src.slice(enStart, frStart);
  let locBlock = enBlock.replace(/\n  en: \{/, `\n  ${locale}: {`);
  locBlock = translateEnTsStringLiterals(locBlock, locale);
  const oldStart = src.indexOf(`\n  ${locale}: {`);
  if (oldStart >= 0) {
    const oldEnd = src.indexOf("\n  },", oldStart);
    src = src.slice(0, oldStart) + locBlock + src.slice(oldEnd);
  } else {
    src = src.replace(enBlock, `${enBlock}${locBlock}`);
  }
  fs.writeFileSync(filePath, src, "utf8");
  console.log(`Patched error-page-i18n.ts (${locale})`);
}

function patchDhurata(locale) {
  const locUpper = locale === "de" ? "DE" : "IT";
  patchPageI18n("dhurata-gift-pledge-i18n.ts", locale);
  const filePath = path.join(vendiLib, "dhurata-gift-pledge-i18n.ts");
  let src = fs.readFileSync(filePath, "utf8");
  if (!src.includes(`${locale}: ${locUpper},`)) {
    src = src.replace(/fr: FR,/, `fr: FR,\n  ${locale}: ${locUpper},`);
    fs.writeFileSync(filePath, src, "utf8");
  }
}

function patchAutoPjese(locale) {
  const constName = locale === "de" ? "AUTO_PJESE_SUB_DE" : "AUTO_PJESE_SUB_IT";
  const filePath = path.join(vendiLib, "auto-pjese-sub-i18n.ts");
  let src = fs.readFileSync(filePath, "utf8");
  src = src.replace(
    /export type UiLocale = "ks" \| "al" \| "mk" \| "mne" \| "en" \| "fr";/,
    'export type UiLocale = "ks" | "al" | "mk" | "mne" | "en" | "fr" | "de" | "it";',
  );
  const enStart = src.indexOf("export const AUTO_PJESE_SUB_EN");
  const frStart = src.indexOf("export const AUTO_PJESE_SUB_FR");
  if (enStart < 0 || frStart < 0) return;
  const enOpen = src.indexOf("{", enStart);
  let depth = 0;
  let enClose = enOpen;
  for (let i = enOpen; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) {
        enClose = i;
        break;
      }
    }
  }
  const enBody = src.slice(enOpen + 1, enClose);
  const entries = [...enBody.matchAll(/^\s+"((?:\\.|[^"\\])*)":\s*"((?:\\.|[^"\\])*)",?\s*$/gm)].map(
    (m) => ({ key: m[1].replace(/\\"/g, '"'), value: m[2].replace(/\\"/g, '"') }),
  );
  const trFn = locale === "de" ? englishToGerman : englishToItalian;
  const lines = entries.map(
    ({ key, value }) => `  "${escapeTs(key)}": "${escapeTs(trFn(value))}",`,
  );
  const block = `export const ${constName}: Record<string, string> = {\n${lines.join("\n")}\n};\n\n`;
  if (src.includes(`export const ${constName}`)) {
    const oldStart = src.indexOf(`export const ${constName}`);
    const oldOpen = src.indexOf("{", oldStart);
    depth = 0;
    let oldClose = oldOpen;
    for (let i = oldOpen; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) {
          oldClose = i + 2;
          break;
        }
      }
    }
    src = src.slice(0, oldStart) + block.trim() + "\n\n" + src.slice(oldClose).replace(/^\n+/, "");
  } else {
    src = src.replace("export function translateAutoPjeseSubLabel", `${block}export function translateAutoPjeseSubLabel`);
  }
  if (!src.includes(`locale === "${locale}"`)) {
    src = src.replace(
      'if (locale === "fr") return AUTO_PJESE_SUB_FR[text] ?? text;',
      `if (locale === "fr") return AUTO_PJESE_SUB_FR[text] ?? text;\n  if (locale === "${locale}") return ${constName}[text] ?? text;`,
    );
  }
  fs.writeFileSync(filePath, src, "utf8");
  console.log(`Patched auto-pjese-sub-i18n.ts (${locale}, ${entries.length} labels)`);
}

function patchFormOptions(locale) {
  const filePath = path.join(vendiLib, "market-context.tsx");
  let src = fs.readFileSync(filePath, "utf8");
  const fields = ["fuel", "transmission", "bodyType", "color", "techCondition", "furnished"];
  const trFn = locale === "de" ? englishToGerman : englishToItalian;
  for (const field of fields) {
    const enRe = new RegExp(`(${field}:\\s*\\{[\\s\\S]*?\\n\\s+en:\\s*\\[)([^\\]]+)(\\],)`);
    const m = src.match(enRe);
    if (!m) continue;
    const enItems = [...m[2].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) =>
      x[1].replace(/\\"/g, '"'),
    );
    const locItems = enItems.map((s) => `"${escapeTs(trFn(s))}"`).join(", ");
    const locLine = `\n    ${locale}:  [${locItems}],`;
    const frRe = new RegExp(`(${field}:\\s*\\{[\\s\\S]*?\\n\\s+fr:\\s*\\[[^\\]]+\\],)`);
    if (src.includes(`${field}:`) && src.match(new RegExp(`${field}:[\\s\\S]*?\\n\\s+${locale}:`))) {
      src = src.replace(
        new RegExp(`(${field}:\\s*\\{[\\s\\S]*?\\n\\s+${locale}:\\s*\\[)[^\\]]+(\\],)`),
        `$1${locItems}$2`,
      );
    } else {
      src = src.replace(frRe, `$1${locLine}`);
    }
  }
  if (!src.includes(`uiLang === "${locale}"`)) {
    src = src.replace(
      'if (uiLang === "fr" && opts.fr?.length) return opts.fr;',
      `if (uiLang === "${locale}" && opts.${locale}?.length) return opts.${locale};\n  if (uiLang === "fr" && opts.fr?.length) return opts.fr;`,
    );
  }
  fs.writeFileSync(filePath, src, "utf8");
  console.log(`Patched FORM_OPTIONS in market-context.tsx (${locale})`);
}

patchEngagement("de");
patchEngagement("it");
patchErrorPage("de");
patchErrorPage("it");
patchDhurata("de");
patchDhurata("it");
patchAutoPjese("de");
patchAutoPjese("it");
for (const script of ["generate-cat-de-it.mjs", "generate-shop-subcategory-i18n.mjs", "generate-market-context-de-it.mjs", "generate-static-pages-de-it.mjs"]) {
  const p = path.join(__dirname, script);
  if (fs.existsSync(p)) {
    spawnSync(process.execPath, [p], { stdio: "inherit" });
  }
}

console.log("Done — German + Italian bundles generated.");
