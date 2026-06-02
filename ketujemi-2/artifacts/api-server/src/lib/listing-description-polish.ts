import { claudeJsonCompletion, isClaudeConfigured, langLabel, type UiLang } from "./claude-client";

const POLISH_SYSTEM = `You polish classified ad descriptions for KetuJemi.com marketplace listings.

Reply ONLY with JSON: {"description":"..."}

Rules:
- Keep the SAME language as the user's description (Albanian, Macedonian, or Montenegrin — match input).
- Preserve meaning, facts, and intent; do not invent specs or accessories.
- Fix grammar, spelling, and punctuation; make the text clearer and more attractive for buyers.
- Do not add phone numbers, emails, links, or prices unless they were already in the text.
- Return a single polished description string (no bullet lists unless the original used them).`;

export async function polishListingDescription(
  input: { title: string; description: string },
  lang: UiLang = "sq",
): Promise<string | null> {
  const description = input.description.trim();
  const title = input.title.trim();
  if (description.length < 10) return null;

  if (!isClaudeConfigured()) {
    return description;
  }

  try {
    const parsed = await claudeJsonCompletion<{ description?: string }>({
      system: `${POLISH_SYSTEM}\n\nTarget language hint: ${langLabel(lang)}.`,
      user: JSON.stringify({ title, description }),
      maxTokens: 1024,
    });
    const polished = parsed?.description?.trim();
    if (polished && polished.length >= 10) return polished;
    return description;
  } catch {
    return null;
  }
}
