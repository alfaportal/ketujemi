/**
 * French listing category labels: Albanian (sq) → English → French.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categoryEnglishFromKs } from "./category-en-from-ks.mjs";
import { categorySqToEnglish } from "./category-sq-en.mjs";
import { categoryToFrench } from "./category-en-fr.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

function categoryEnFromSq(sq) {
  let en = categoryEnglishFromKs(sq);
  if (en === sq || ALBANIAN_CHARS.test(en)) en = categorySqToEnglish(sq);
  return en;
}

function categoryFrenchFromSq(sq) {
  return categoryToFrench(categoryEnFromSq(sq));
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catPath = join(root, "artifacts/vendi/src/lib/category-translations.ts");
const outPath = join(root, "artifacts/vendi/src/lib/category-translations-fr.generated.ts");

const catSrc = readFileSync(catPath, "utf8");
const catRe =
  /"((?:\\.|[^"\\])+)":\s*\{\s*ks:\s*"((?:\\.|[^"\\])*)",\s*al:[^,]+,\s*mk:\s*"((?:\\.|[^"\\])*)",\s*mne:\s*"((?:\\.|[^"\\])*)"\s*\}/g;

const catFr = {};
let m;
while ((m = catRe.exec(catSrc)) !== null) {
  const name = m[1].replace(/\\"/g, '"');
  const ks = m[2].replace(/\\"/g, '"');
  catFr[name] = categoryFrenchFromSq(ks || name);
}

for (const file of ["femije-category-translations.ts", "arsim-kurse-category-translations.ts"]) {
  const src = readFileSync(join(root, "artifacts/vendi/src/lib", file), "utf8");
  const keyRe = /"((?:\\.|[^"\\])+)"\s*:\s*\{\s*mk:/g;
  let km;
  while ((km = keyRe.exec(src)) !== null) {
    const name = km[1].replace(/\\"/g, '"');
    if (!catFr[name]) catFr[name] = categoryFrenchFromSq(name);
  }
}

let out = "/** French category labels — generated from Albanian (sq) */\n";
out += "export const CAT_FR_GENERATED: Record<string, string> = {\n";
for (const [key, value] of Object.entries(catFr).sort(([a], [b]) => a.localeCompare(b))) {
  const k = key.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const v = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  out += `  "${k}": "${v}",\n`;
}
out += "};\n";

writeFileSync(outPath, out, "utf8");
console.log(`Wrote ${Object.keys(catFr).length} entries to ${outPath}`);
