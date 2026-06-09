/**
 * Generates French UI: Albanian source → English bundles → French (clean, no hybrids).
 * Run: node ketujemi-2/scripts/generate-fr-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { englishToFrench, FR_KEY_FROM_SQ } from "./albanian-french.mjs";
import { PAGE_I18N_FR } from "./page-i18n-fr-phrases.mjs";

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

function parseConstObject(filePath, constName) {
  const src = fs.readFileSync(filePath, "utf8");
  const start = findConstStart(src, constName);
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

function translateEnLine(line) {
  const trimmed = line.trim();
  if (PAGE_I18N_FR[trimmed]) {
    return line.replace(trimmed, PAGE_I18N_FR[trimmed]);
  }
  const bullet = trimmed.match(/^- (.+)$/);
  if (bullet && PAGE_I18N_FR[bullet[1]]) {
    return line.replace(bullet[1], PAGE_I18N_FR[bullet[1]]);
  }
  return englishToFrench(line);
}

function translateEnText(text) {
  if (!text) return text;
  if (PAGE_I18N_FR[text]) return PAGE_I18N_FR[text];
  if (text.includes("\n")) {
    return text
      .split("\n")
      .map((line) => translateEnLine(line))
      .join("\n");
  }
  return translateEnLine(text);
}

function toFrenchFromEn(key, enValue) {
  if (FR_KEY_FROM_SQ[key]) return FR_KEY_FROM_SQ[key];
  return translateEnText(enValue);
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

function translateEnTsStringLiterals(chunk, { inlineProps = false } = {}) {
  const tr = (inner) =>
    escapeTs(translateEnText(inner.replace(/\\n/g, "\n").replace(/\\"/g, '"')));
  let out = chunk;
  if (inlineProps) {
    out = out.replace(
      /(\w+):\s*"((?:\\.|[^"\\])*)"/g,
      (_, key, inner) => `${key}: "${tr(inner)}"`,
    );
  }
  out = out.replace(
    /^(\s+)(\w+):\s*"((?:\\.|[^"\\])*)"/gm,
    (_, indent, key, inner) => `${indent}${key}: "${tr(inner)}"`,
  );
  out = out.replace(
    /^(\s+)"((?:\\.|[^"\\])*)",?\s*$/gm,
    (_, indent, inner) => `${indent}"${tr(inner)}",`,
  );
  out = out.replace(/^(\s+)(\w+):\s*`([\s\S]*?)`,?\s*$/gm, (_, indent, key, inner) => {
    const fr = translateEnText(inner);
    return `${indent}${key}: \`${fr.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`,`;
  });
  return out;
}

// ── app-extra-i18n-fr.ts (EN_EXTRA → fr, sq fallback) ────────────────────────
const enExtraEntries = parseConstObject(path.join(vendiLib, "app-extra-i18n-en.ts"), "EN_EXTRA");

const enAk = parseConstObject(path.join(vendiLib, "arsim-kurse-form-i18n.ts"), "EN_AK");
const enSo = parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "EN_SO");
const akKs = parseConstObject(path.join(vendiLib, "arsim-kurse-form-i18n.ts"), "KS");
const soKs = parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "KS");

const allEnKeys = new Map();
for (const e of enExtraEntries) allEnKeys.set(e.key, e.value);
for (const e of enAk) allEnKeys.set(e.key, e.value);
for (const e of enSo) allEnKeys.set(e.key, e.value);

const frEntries = [...allEnKeys.entries()]
  .filter(([key]) => !key.startsWith("adm_"))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, en]) => ({ key, value: toFrenchFromEn(key, en) }));

const frExtraPath = path.join(vendiLib, "app-extra-i18n-fr.ts");
fs.writeFileSync(
  frExtraPath,
  `/** Auto-generated — sq→en→fr via ketujemi-2/scripts/generate-fr-i18n.mjs */\nexport const FR_EXTRA: Record<string, string> = {\n${formatRecordBody(frEntries)}\n};\n`,
  "utf8",
);
console.log(`Wrote ${frExtraPath} (${frEntries.length} keys)`);

// ── static-pages-i18n-fr.ts (hand-maintained — do not auto-overwrite) ───────
const frStaticPath = path.join(vendiLib, "static-pages-i18n-fr.ts");
if (fs.existsSync(frStaticPath)) {
  console.log(`Skipped ${frStaticPath} (hand-maintained)`);
} else {
  console.warn(`Missing hand-maintained ${frStaticPath}`);
}

// ── arsim / sport FR from EN ─────────────────────────────────────────────────
const frAk = enAk.map(({ key, value }) => ({ key, value: toFrenchFromEn(key, value) }));
const frSo = enSo.map(({ key, value }) => ({ key, value: toFrenchFromEn(key, value) }));

const akPath = path.join(vendiLib, "arsim-kurse-form-i18n.ts");
let akSrc = fs.readFileSync(akPath, "utf8");
const frAkBlock = `const FR_AK: Record<keyof typeof KS, string> = {\n${formatRecordBody(frAk)}\n};\nexport const FR_AK_FORM = FR_AK;\n`;
if (akSrc.includes("export const FR_AK_FORM")) {
  akSrc = akSrc.replace(/const FR_AK:[\s\S]*?export const FR_AK_FORM = FR_AK;\n/, frAkBlock);
} else {
  akSrc = akSrc.replace("export const EN_AK_FORM = EN_AK;", `${frAkBlock}export const EN_AK_FORM = EN_AK;`);
}
fs.writeFileSync(akPath, akSrc, "utf8");
console.log("Updated arsim-kurse-form-i18n.ts FR_AK_FORM");

const soPath = path.join(vendiLib, "sport-outdoor-device-i18n.ts");
let soSrc = fs.readFileSync(soPath, "utf8");
const frSoBlock = `const FR_SO: Record<keyof typeof KS, string> = {\n${formatRecordBody(frSo)}\n};\nexport const FR_SO_DEVICE = FR_SO;\n`;
if (soSrc.includes("export const FR_SO_DEVICE")) {
  soSrc = soSrc.replace(/const FR_SO:[\s\S]*?export const FR_SO_DEVICE = FR_SO;\n/, frSoBlock);
} else {
  soSrc = soSrc.replace("export const EN_SO_DEVICE = EN_SO;", `${frSoBlock}export const EN_SO_DEVICE = EN_SO;`);
}
fs.writeFileSync(soPath, soSrc, "utf8");
console.log("Updated sport-outdoor-device-i18n.ts FR_SO_DEVICE");

// ── Page i18n: EN block → FR block (clean English → French) ──────────────────
const PAGE_FILES = [
  "shop-application-i18n.ts",
  "shop-detail-i18n.ts",
  "shop-dashboard-i18n.ts",
  "open-shop-page-i18n.ts",
  "advertise-page-i18n.ts",
  "vip-packages-page-i18n.ts",
  "partner-page-i18n.ts",
  "partner-profile-i18n.ts",
];

function patchPageI18n(fileName) {
  const filePath = path.join(vendiLib, fileName);
  let src = fs.readFileSync(filePath, "utf8");
  const enBlock = extractConstBlock(src, "EN");
  const sqBlock = extractConstBlock(src, "KS") ?? extractConstBlock(src, "SQ");
  const sourceBlock = enBlock ?? sqBlock;
  if (!sourceBlock) {
    console.warn(`No EN/KS/SQ block in ${fileName}`);
    return;
  }

  const sourceName = enBlock ? "EN" : extractConstBlock(src, "KS") ? "KS" : "SQ";
  let frBlock = sourceBlock.replace(
    /^((?:export )?)const (EN|KS|SQ):/,
    "$1const FR:",
  );
  frBlock = translateEnTsStringLiterals(frBlock, { inlineProps: true });

  const oldFr = extractConstBlock(src, "FR");
  if (oldFr) src = src.replace(oldFr, frBlock);
  else if (enBlock) src = src.replace(enBlock, `${enBlock}\n\n${frBlock}`);
  else src = src.replace(sqBlock, `${sqBlock}\n\n${frBlock}`);

  src = src.replace("fr: EN,", "fr: FR,");
  fs.writeFileSync(filePath, src, "utf8");
  console.log(`Patched ${fileName} (${sourceName}→fr)`);
}

for (const f of PAGE_FILES) patchPageI18n(f);

// ── category FR from Albanian names ───────────────────────────────────────────
import { spawnSync } from "node:child_process";
const catFrScript = path.join(__dirname, "generate-cat-fr.mjs");
spawnSync(process.execPath, [catFrScript], { stdio: "inherit" });

const shopSubScript = path.join(__dirname, "generate-shop-subcategory-i18n.mjs");
spawnSync(process.execPath, [shopSubScript], { stdio: "inherit" });

console.log("Done — French generated (sq → en → fr, separate bundles).");
