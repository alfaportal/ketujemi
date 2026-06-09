/** English shop-directory subcategory labels → French. */
import { applyFrenchPhrases } from "./french-phrases.mjs";
import { categoryToFrench } from "./category-en-fr.mjs";
import { shopSubcategoryToEnglish } from "./shop-subcategory-sq-en.mjs";
import { shopEnglishToFrench } from "./shop-phrases-fr.mjs";

function titleCaseEn(en) {
  return en.replace(/(^|[\s&(/])([a-z])/g, (_, pre, c) => pre + c.toUpperCase());
}

function resolveShopFr(en) {
  if (!en) return en;
  const direct = shopEnglishToFrench(en);
  if (direct !== en) return direct;
  const tc = titleCaseEn(en);
  const fromTc = shopEnglishToFrench(tc);
  if (fromTc !== tc) return fromTc;
  let fr = categoryToFrench(en);
  if (fr !== en) return fr;
  fr = categoryToFrench(tc);
  if (fr !== tc) return fr;
  fr = applyFrenchPhrases(en);
  if (fr !== en) return fr;
  fr = applyFrenchPhrases(tc);
  if (fr !== tc) return fr;
  return en;
}

export function shopSubcategoryToFrench(en) {
  return resolveShopFr(en);
}

/** sq → fr in one step (for validation). */
export function shopSubcategoryFrenchFromSq(sq) {
  return resolveShopFr(shopSubcategoryToEnglish(sq));
}
