import type { UiLang } from "./claude-client";

/**
 * Picks reply language from the user's last message (sq / mk / me).
 * Market hint (ks/al/mk/mne) is fallback when text is ambiguous.
 */
/** Minimum keyword hits before overriding the site-language hint. */
const MIN_SCORE_TO_OVERRIDE_SITE = 2;

export function inferSupportLang(
  userText: string,
  hint: UiLang = "sq",
  minScoreToOverride = MIN_SCORE_TO_OVERRIDE_SITE,
): UiLang {
  const t = userText.trim();
  if (!t) return hint;

  if (/[\u0400-\u04FF]/.test(t)) return "mk";

  const lower = t
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

  const meScore = countMatches(
    lower,
    /\b(pitajte|pitam|objavu|objavite|molim|hvala|kako|gdje|gde|želite|zelite|ćete|cete|što|treba|prije|poslije|trebam|možete|mozete|kupujem|prodajem|oglasi|oglas|kontaktirajte|pomoc|pomoć)\b/giu,
  );
  const mkLatinScore = countMatches(
    lower,
    /\b(kako|objava|prasanje|prashanje|oglas|oglasite|kupuvam|prodavam|kontakt|pomos|pomosh|kade|najdete)\b/giu,
  );
  const sqScore = countMatches(
    lower,
    /\b(si\s+mund|ku\s+mund|posto|postim|njoftim|faleminderit|pershendetje|përshëndetje|dua|blej|shit|kategori|telefononi|kontaktoni)\b/giu,
  );
  const enScore = countMatches(
    lower,
    /\b(hello|hi|how|where|what|help|please|thanks|thank\s+you|buy|sell|post|listing|category|contact|phone|register|account)\b/giu,
  );
  const frScore = countMatches(
    lower,
    /\b(bonjour|salut|comment|où|aide|merci|acheter|vendre|annonce|compte|inscription)\b/giu,
  );

  const scores: Record<UiLang, number> = {
    sq: sqScore,
    mk: mkLatinScore,
    me: meScore,
    en: enScore,
    fr: frScore,
  };

  const best = Math.max(sqScore, mkLatinScore, meScore, enScore, frScore);
  if (best < minScoreToOverride) return hint;

  const hintScore = scores[hint] ?? 0;
  if (hintScore === best) return hint;

  if (enScore === best) return "en";
  if (frScore === best) return "fr";
  if (meScore === best) return "me";
  if (mkLatinScore === best) return "mk";
  if (sqScore === best) return "sq";

  return hint;
}

function countMatches(text: string, re: RegExp): number {
  return [...text.matchAll(re)].length;
}
