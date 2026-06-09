/** Albanian shop-directory subcategory labels → English. */
import { categoryEnglishFromKs } from "./category-en-from-ks.mjs";
import { applyEnglishPhrases } from "./english-phrases.mjs";
import { SHOP_PHRASES_EN } from "./shop-phrases-en.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

export function shopSubcategoryToEnglish(nameSq) {
  const exactPhrase = SHOP_PHRASES_EN.find(([k]) => k === nameSq);
  if (exactPhrase) return exactPhrase[1];

  let s = nameSq;
  const sorted = [...SHOP_PHRASES_EN].sort((a, b) => b[0].length - a[0].length);
  for (const [sq, en] of sorted) {
    if (s.includes(sq)) s = s.split(sq).join(en);
  }
  if (s !== nameSq && !ALBANIAN_CHARS.test(s)) return s;

  let fromCat = categoryEnglishFromKs(nameSq);
  if (fromCat === nameSq || ALBANIAN_CHARS.test(fromCat)) {
    fromCat = applyEnglishPhrases(nameSq);
  }
  if (fromCat !== nameSq && !ALBANIAN_CHARS.test(fromCat)) return fromCat;

  return s;
}
