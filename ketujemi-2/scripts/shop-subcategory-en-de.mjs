/** English shop-directory subcategory labels → German. */
import { applyGermanPhrases } from "./german-phrases.mjs";
import { categoryToGerman } from "./category-en-de.mjs";
import { shopSubcategoryToEnglish } from "./shop-subcategory-sq-en.mjs";
import { shopEnglishToGerman } from "./shop-phrases-de.mjs";

function titleCaseEn(en) {
  return en.replace(/(^|[\s&(/])([a-z])/g, (_, pre, c) => pre + c.toUpperCase());
}

function resolveShopDe(en) {
  if (!en) return en;
  const direct = shopEnglishToGerman(en);
  if (direct !== en) return direct;
  const tc = titleCaseEn(en);
  const fromTc = shopEnglishToGerman(tc);
  if (fromTc !== tc) return fromTc;
  let de = categoryToGerman(en);
  if (de !== en) return de;
  de = categoryToGerman(tc);
  if (de !== tc) return de;
  de = applyGermanPhrases(en);
  if (de !== en) return de;
  de = applyGermanPhrases(tc);
  if (de !== tc) return de;
  return en;
}

export function shopSubcategoryToGerman(en) {
  return resolveShopDe(en);
}

/** sq → de in one step (for validation). */
export function shopSubcategoryGermanFromSq(sq) {
  return resolveShopDe(shopSubcategoryToEnglish(sq));
}
