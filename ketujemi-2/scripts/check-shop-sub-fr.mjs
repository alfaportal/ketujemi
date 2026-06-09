import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { shopSubcategoryToEnglish } from "./shop-subcategory-sq-en.mjs";
import { shopSubcategoryToFrench } from "./shop-subcategory-en-fr.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const taxonomySrc = readFileSync(join(root, "lib/shop-directory-taxonomy.ts"), "utf8");
const subs = [...taxonomySrc.matchAll(/"nameSq":\s*"((?:\\.|[^"\\])*)"/g)].map((m) =>
  m[1].replace(/\\"/g, '"'),
);
const ALB = /[ëçËÇ]/;

const badAlb = subs.filter((sq) => {
  const en = shopSubcategoryToEnglish(sq);
  const fr = shopSubcategoryToFrench(en);
  return ALB.test(en) || ALB.test(fr) || en === sq;
});

const badEnInFr = subs.filter((sq) => {
  const en = shopSubcategoryToEnglish(sq);
  const fr = shopSubcategoryToFrench(en);
  return fr === en && /[A-Za-z]{4,}/.test(en);
});

console.log("total", subs.length, "albanian gaps", badAlb.length, "english in fr", badEnInFr.length);
for (const sq of badAlb.slice(0, 25)) {
  const en = shopSubcategoryToEnglish(sq);
  console.log(`[ALB] ${sq} -> ${en} -> ${shopSubcategoryToFrench(en)}`);
}
