import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { shopSubcategoryToEnglish } from "./shop-subcategory-sq-en.mjs";
import { SHOP_SQ_FR } from "./shop-phrases-fr.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const taxonomySrc = readFileSync(join(root, "lib/shop-directory-taxonomy.ts"), "utf8");
const subs = [];
const re = /\{\s*"slug":\s*"([^"]+)",\s*"nameSq":\s*"((?:\\.|[^"\\])*)"\s*\}/g;
let m;
while ((m = re.exec(taxonomySrc)) !== null) {
  subs.push({ slug: m[1], nameSq: m[2].replace(/\\"/g, '"') });
}

const gaps = [];
for (const { slug, nameSq } of subs) {
  const en = shopSubcategoryToEnglish(nameSq);
  const fr = SHOP_SQ_FR[nameSq] ?? en;
  if (fr === en || /[ëË]/.test(fr)) {
    gaps.push({ slug, nameSq, en, fr });
  }
}
writeFileSync(join(root, "scripts/shop-fr-gaps.json"), JSON.stringify(gaps, null, 2), "utf8");
console.log("gaps", gaps.length);
