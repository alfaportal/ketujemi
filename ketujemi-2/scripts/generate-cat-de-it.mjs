/**
 * German + Italian category labels from Albanian (sq) via English.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categoryEnglishFromKs } from "./category-en-from-ks.mjs";
import { categorySqToEnglish } from "./category-sq-en.mjs";
import { categoryToGerman } from "./category-en-de.mjs";
import { categoryToItalian } from "./category-en-it.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

function categoryEnFromSq(sq) {
  let en = categoryEnglishFromKs(sq);
  if (en === sq || ALBANIAN_CHARS.test(en)) en = categorySqToEnglish(sq);
  return en;
}

/** Prefer canonical key (DB name) over ks marketing copy for EN lookup. */
function categoryEnForName(name, ks) {
  let en = categoryEnFromSq(name);
  if ((en === name || ALBANIAN_CHARS.test(en)) && ks && ks !== name) {
    const alt = categoryEnFromSq(ks);
    if (alt !== ks && !ALBANIAN_CHARS.test(alt)) en = alt;
  }
  return en;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catPath = join(root, "artifacts/vendi/src/lib/category-translations.ts");

const catSrc = readFileSync(catPath, "utf8");
const catRe =
  /"((?:\\.|[^"\\])+)":\s*\{\s*ks:\s*"((?:\\.|[^"\\])*)",\s*al:[^,]+,\s*mk:\s*"((?:\\.|[^"\\])*)",\s*mne:\s*"((?:\\.|[^"\\])*)"\s*\}/g;

const catDe = {};
const catIt = {};
let m;
while ((m = catRe.exec(catSrc)) !== null) {
  const name = m[1].replace(/\\"/g, '"');
  const ks = m[2].replace(/\\"/g, '"');
  const en = categoryEnForName(name, ks);
  catDe[name] = categoryToGerman(en);
  catIt[name] = categoryToItalian(en);
}

for (const file of ["femije-category-translations.ts", "arsim-kurse-category-translations.ts"]) {
  const src = readFileSync(join(root, "artifacts/vendi/src/lib", file), "utf8");
  const keyRe = /"((?:\\.|[^"\\])+)"\s*:\s*\{\s*mk:/g;
  let km;
  while ((km = keyRe.exec(src)) !== null) {
    const name = km[1].replace(/\\"/g, '"');
    if (!catDe[name]) {
      const en = categoryEnForName(name, name);
      catDe[name] = categoryToGerman(en);
      catIt[name] = categoryToItalian(en);
    }
  }
}

function writeGenerated(locale, obj, constName, fileName) {
  let out = `/** ${locale} category labels — generated from Albanian (sq) */\n`;
  out += `export const ${constName}: Record<string, string> = {\n`;
  for (const [k, v] of Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))) {
    out += `  "${k.replace(/"/g, '\\"')}": "${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",\n`;
  }
  out += "};\n";
  writeFileSync(join(root, "artifacts/vendi/src/lib", fileName), out, "utf8");
  console.log(`Wrote ${fileName} (${Object.keys(obj).length} categories)`);
}

writeGenerated("German", catDe, "CAT_DE_GENERATED", "category-translations-de.generated.ts");
writeGenerated("Italian", catIt, "CAT_IT_GENERATED", "category-translations-it.generated.ts");

let updatedCat = catSrc;
if (!updatedCat.includes("category-translations-de.generated")) {
  updatedCat = updatedCat.replace(
    'import { CAT_FR_GENERATED } from "./category-translations-fr.generated";',
    'import { CAT_FR_GENERATED } from "./category-translations-fr.generated";\nimport { CAT_DE_GENERATED } from "./category-translations-de.generated";\nimport { CAT_IT_GENERATED } from "./category-translations-it.generated";',
  );
}
if (!updatedCat.includes('UiCategoryLocale = MarketCode | "en" | "fr" | "de" | "it"')) {
  updatedCat = updatedCat.replace(
    'export type UiCategoryLocale = MarketCode | "en" | "fr";',
    'export type UiCategoryLocale = MarketCode | "en" | "fr" | "de" | "it";',
  );
}
if (!updatedCat.includes('localeCode === "de"')) {
  updatedCat = updatedCat.replace(
    `  if (localeCode === "fr") {
    return (
      CAT_FR_GENERATED[name] ??
      translateArsimKurseCategory(name, "fr") ??
      translateFemijeCategory(name, "fr") ??
      name
    );
  }`,
    `  if (localeCode === "fr") {
    return (
      CAT_FR_GENERATED[name] ??
      translateArsimKurseCategory(name, "fr") ??
      translateFemijeCategory(name, "fr") ??
      name
    );
  }
  if (localeCode === "de") {
    return (
      CAT_DE_GENERATED[name] ??
      translateArsimKurseCategory(name, "de") ??
      translateFemijeCategory(name, "de") ??
      name
    );
  }
  if (localeCode === "it") {
    return (
      CAT_IT_GENERATED[name] ??
      translateArsimKurseCategory(name, "it") ??
      translateFemijeCategory(name, "it") ??
      name
    );
  }`,
  );
}
writeFileSync(catPath, updatedCat, "utf8");
