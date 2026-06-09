/**
 * Generates shop-directory subcategory labels (slug → locale) from Albanian source.
 * Run: node ketujemi-2/scripts/generate-shop-subcategory-i18n.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { shopSubcategoryToEnglish } from "./shop-subcategory-sq-en.mjs";
import { shopSubcategoryToFrench } from "./shop-subcategory-en-fr.mjs";

function titleCaseEn(en) {
  return en.replace(/(^|[\s&(/])([a-z])/g, (_, pre, c) => pre + c.toUpperCase());
}

function shopLabelFr(en) {
  const fr = shopSubcategoryToFrench(en);
  if (fr !== en) return fr;
  return shopSubcategoryToFrench(titleCaseEn(en));
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const taxonomyPath = join(root, "lib/shop-directory-taxonomy.ts");
const catPath = join(root, "artifacts/vendi/src/lib/category-translations.ts");
const outPath = join(
  root,
  "artifacts/vendi/src/lib/shop-directory-subcategory-i18n.generated.ts",
);

const taxonomySrc = readFileSync(taxonomyPath, "utf8");
const subRe = /\{\s*"slug":\s*"([^"]+)",\s*"nameSq":\s*"((?:\\.|[^"\\])*)"\s*\}/g;
const subs = [];
let m;
while ((m = subRe.exec(taxonomySrc)) !== null) {
  subs.push({ slug: m[1], nameSq: m[2].replace(/\\"/g, '"') });
}

const catSrc = readFileSync(catPath, "utf8");
const catRe =
  /"((?:\\.|[^"\\])+)":\s*\{\s*ks:\s*"((?:\\.|[^"\\])*)",\s*al:[^,]+,\s*mk:\s*"((?:\\.|[^"\\])*)",\s*mne:\s*"((?:\\.|[^"\\])*)"\s*\}/g;
const mkBySq = {};
const mneBySq = {};
while ((m = catRe.exec(catSrc)) !== null) {
  const name = m[1].replace(/\\"/g, '"');
  mkBySq[name] = m[3].replace(/\\"/g, '"');
  mneBySq[name] = m[4].replace(/\\"/g, '"');
}

const en = {};
const fr = {};
const mk = {};
const mne = {};

for (const { slug, nameSq } of subs) {
  const enLabel = shopSubcategoryToEnglish(nameSq);
  en[slug] = enLabel;
  fr[slug] = shopLabelFr(enLabel);
  mk[slug] = mkBySq[nameSq] ?? enLabel;
  mne[slug] = mneBySq[nameSq] ?? enLabel;
}

function emitRecord(name, obj) {
  const lines = Object.entries(obj)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  "${k.replace(/"/g, '\\"')}": "${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",`);
  return `export const ${name}: Record<string, string> = {\n${lines.join("\n")}\n};\n`;
}

const out = `/** Auto-generated — run ketujemi-2/scripts/generate-shop-subcategory-i18n.mjs */\n${emitRecord("SHOP_SUB_EN", en)}${emitRecord("SHOP_SUB_FR", fr)}${emitRecord("SHOP_SUB_MK", mk)}${emitRecord("SHOP_SUB_MNE", mne)}`;

writeFileSync(outPath, out, "utf8");
console.log(`Wrote ${subs.length} shop subcategory labels to ${outPath}`);
