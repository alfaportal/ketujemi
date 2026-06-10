/**
 * Albanian (sq) → German — source is always Albanian UI text.
 * Pipeline: direct sq→de phrases, then sq→en→de (phrase + word level).
 */
import { applyEnglishPhrases, EN_PHRASES } from "./english-phrases.mjs";
import { applyGermanPhrases, SQ_DE_EXTRA, DE_KEY_FROM_SQ } from "./german-phrases.mjs";
import { STATIC_PAGE_DE } from "./static-page-de-phrases.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

export function englishToGerman(en) {
  if (STATIC_PAGE_DE[en]) return STATIC_PAGE_DE[en];
  return applyGermanPhrases(en);
}

/** sq phrase → de phrase (from EN_PHRASES pipeline). */
export const SQ_DE_PHRASES = EN_PHRASES.map(([sq, en]) => [sq, englishToGerman(en)]);

const ALL_SQ_DE = [...SQ_DE_PHRASES, ...SQ_DE_EXTRA];

export { DE_KEY_FROM_SQ };

const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;

export function applyAlbanianGermanPhrases(text) {
  if (!text || typeof text !== "string") return text;
  let s = text;
  const sorted = [...ALL_SQ_DE].sort((a, b) => b[0].length - a[0].length);
  for (const [sq, de] of sorted) {
    if (sq.includes("\\b")) {
      s = s.replace(new RegExp(sq, "gi"), de);
    } else if (s.includes(sq)) {
      s = s.split(sq).join(de);
    }
  }
  return s;
}

function sqToEnglish(text) {
  return applyEnglishPhrases(text);
}

export function albanianToGerman(key, sqText) {
  if (DE_KEY_FROM_SQ[key]) return DE_KEY_FROM_SQ[key];

  const tokens = [];
  const masked = sqText.replace(PLACEHOLDER_RE, (m) => {
    const id = `__PH${tokens.length}__`;
    tokens.push(m);
    return id;
  });

  let out = applyAlbanianGermanPhrases(masked);

  if (ALBANIAN_CHARS.test(out)) {
    out = englishToGerman(sqToEnglish(masked));
  }

  if (ALBANIAN_CHARS.test(out)) {
    out = applyAlbanianGermanPhrases(englishToGerman(sqToEnglish(out)));
  }

  tokens.forEach((ph, i) => {
    out = out.split(`__PH${i}__`).join(ph);
  });
  return out;
}
