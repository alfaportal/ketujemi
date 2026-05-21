import type { UiLang } from "./claude-client";

/**
 * Picks reply language from the user's last message (sq / mk / me).
 * Market hint (ks/al/mk/mne) is fallback when text is ambiguous.
 */
export function inferSupportLang(userText: string, hint: UiLang = "sq"): UiLang {
  const t = userText.trim();
  if (!t) return hint;

  if (/[\u0400-\u04FF]/.test(t)) return "mk";

  const lower = t
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

  const meScore = countMatches(
    lower,
    /\b(pitajte|pitam|objavu|objavite|molim|hvala|kako|gdje|gde|želite|zelite|ćete|cete|što|sto|treba|prije|poslije|trebam|možete|mozete|kupujem|prodajem|oglasi|oglas|kontaktirajte|pomoc|pomoć)\b/giu,
  );
  const mkLatinScore = countMatches(
    lower,
    /\b(kako|objava|prasanje|prashanje|oglas|oglasite|kupuvam|prodavam|kontakt|pomos|pomosh|kade|najdete)\b/giu,
  );
  const sqScore = countMatches(
    lower,
    /\b(si\s+mund|ku\s+mund|posto|postim|njoftim|faleminderit|pershendetje|përshëndetje|dua|blej|shit|kategori|telefononi|kontaktoni)\b/giu,
  );

  if (meScore > sqScore && meScore >= mkLatinScore && meScore > 0) return "me";
  if (mkLatinScore > sqScore && mkLatinScore > 0) return "mk";
  if (sqScore > 0) return "sq";

  return hint;
}

function countMatches(text: string, re: RegExp): number {
  return [...text.matchAll(re)].length;
}
