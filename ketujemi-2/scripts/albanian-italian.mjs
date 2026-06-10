/**
 * Albanian (sq) → Italian — source is always Albanian UI text.
 * Pipeline: direct sq→it phrases, then sq→en→it (phrase + word level).
 */
import { applyEnglishPhrases, EN_PHRASES } from "./english-phrases.mjs";
import { applyItalianPhrases, SQ_IT_EXTRA, IT_KEY_FROM_SQ } from "./italian-phrases.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

export function englishToItalian(en) {
  return applyItalianPhrases(en);
}

/** sq phrase → it phrase (from EN_PHRASES pipeline). */
export const SQ_IT_PHRASES = EN_PHRASES.map(([sq, en]) => [sq, englishToItalian(en)]);

const ALL_SQ_IT = [...SQ_IT_PHRASES, ...SQ_IT_EXTRA];

export { IT_KEY_FROM_SQ };

const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;

export function applyAlbanianItalianPhrases(text) {
  if (!text || typeof text !== "string") return text;
  let s = text;
  const sorted = [...ALL_SQ_IT].sort((a, b) => b[0].length - a[0].length);
  for (const [sq, it] of sorted) {
    if (sq.includes("\\b")) {
      s = s.replace(new RegExp(sq, "gi"), it);
    } else if (s.includes(sq)) {
      s = s.split(sq).join(it);
    }
  }
  return s;
}

function sqToEnglish(text) {
  return applyEnglishPhrases(text);
}

export function albanianToItalian(key, sqText) {
  if (IT_KEY_FROM_SQ[key]) return IT_KEY_FROM_SQ[key];

  const tokens = [];
  const masked = sqText.replace(PLACEHOLDER_RE, (m) => {
    const id = `__PH${tokens.length}__`;
    tokens.push(m);
    return id;
  });

  let out = applyAlbanianItalianPhrases(masked);

  if (ALBANIAN_CHARS.test(out)) {
    out = englishToItalian(sqToEnglish(masked));
  }

  if (ALBANIAN_CHARS.test(out)) {
    out = applyAlbanianItalianPhrases(englishToItalian(sqToEnglish(out)));
  }

  tokens.forEach((ph, i) => {
    out = out.split(`__PH${i}__`).join(ph);
  });
  return out;
}
