import { claudeJsonCompletion, isClaudeConfigured, langLabel, type UiLang } from "./claude-client";

const POLISH_SYSTEM = `You polish classified ad descriptions for KetuJemi.com.

Reply ONLY with JSON: {"description":"..."}

STRICT rules:
- Output is ONLY the rewritten description — never tips, bullet lists, headings, or meta-commentary.
- Keep the SAME language as the input (Albanian, Macedonian, or Montenegrin).
- Preserve every fact the user stated; do NOT invent color, storage, battery, accessories, year, mileage, or condition they did not write.
- Do NOT tell the user to add more details. Do NOT suggest what to include.
- Fix spelling, grammar, and punctuation; make it read naturally for buyers.
- Stay roughly the same length (at most ~30% longer than the input).
- Do not add phone, email, links, or prices unless already present.`;

const ADVICE_MARKERS = [
  /shtoni\s+më\s+shumë/i,
  /shtoni\s+të\s+paktën/i,
  /përshkrimi\s+(juaj\s+)?është\s+shumë/i,
  /ju\s+lutem/i,
  /ngjyrën,\s*kapacitetin/i,
  /gjendjen\s+e\s+baterisë/i,
  /aksesorë\s+të\s+përfshirë/i,
  /•\s/,
  /^\s*[-*]\s/m,
];

function looksLikeAdvice(text: string): boolean {
  return ADVICE_MARKERS.some((re) => re.test(text));
}

function acceptablePolish(original: string, polished: string): boolean {
  const o = original.trim();
  const p = polished.trim();
  if (p.length < 3 || looksLikeAdvice(p)) return false;
  if (p.length > Math.max(o.length * 1.35 + 40, o.length + 120)) return false;
  return true;
}

export async function polishListingDescription(
  input: { description: string },
  lang: UiLang = "sq",
): Promise<string | null> {
  const description = input.description.trim();
  if (description.length < 3) return null;

  if (!isClaudeConfigured()) {
    return description;
  }

  try {
    const parsed = await claudeJsonCompletion<{ description?: string }>({
      system: `${POLISH_SYSTEM}\n\nLanguage hint: ${langLabel(lang)}.`,
      user: JSON.stringify({ description }),
      maxTokens: 512,
    });
    const polished = parsed?.description?.trim();
    if (polished && acceptablePolish(description, polished)) return polished;
    return description;
  } catch {
    return null;
  }
}
