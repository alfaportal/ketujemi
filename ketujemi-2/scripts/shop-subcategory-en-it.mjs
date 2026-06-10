/** English shop-directory subcategory labels → Italian. */
import { applyItalianPhrases } from "./italian-phrases.mjs";
import { categoryToItalian } from "./category-en-it.mjs";
import { shopSubcategoryToEnglish } from "./shop-subcategory-sq-en.mjs";
import { shopEnglishToItalian } from "./shop-phrases-it.mjs";

function titleCaseEn(en) {
  return en.replace(/(^|[\s&(/])([a-z])/g, (_, pre, c) => pre + c.toUpperCase());
}

function resolveShopIt(en) {
  if (!en) return en;
  const direct = shopEnglishToItalian(en);
  if (direct !== en) return direct;
  const tc = titleCaseEn(en);
  const fromTc = shopEnglishToItalian(tc);
  if (fromTc !== tc) return fromTc;
  let it = categoryToItalian(en);
  if (it !== en) return it;
  it = categoryToItalian(tc);
  if (it !== tc) return it;
  it = applyItalianPhrases(en);
  if (it !== en) return it;
  it = applyItalianPhrases(tc);
  if (it !== tc) return it;
  return en;
}

export function shopSubcategoryToItalian(en) {
  return resolveShopIt(en);
}

/** sq → it in one step (for validation). */
export function shopSubcategoryItalianFromSq(sq) {
  return resolveShopIt(shopSubcategoryToEnglish(sq));
}
