import { claudeJsonCompletion, isClaudeConfigured, langLabel, type UiLang } from "./claude-client";

export type PostingSuggestion = { text: string };

function ruleBasedSuggestions(input: {
  title: string;
  description: string;
  price: number;
  image_count: number;
}): PostingSuggestion[] {
  const out: PostingSuggestion[] = [];
  if (input.description.trim().length < 40) {
    out.push({ text: "Përshkrimi është shumë i shkurtër — shtoni më shumë detaje." });
  }
  if (input.image_count < 3) {
    out.push({ text: "Shtoni të paktën 3 foto për më shumë shikime." });
  }
  if (input.title.trim().length > 80) {
    out.push({ text: "Titulli është shumë i gjatë — shkurtësojeni." });
  }
  if (input.price <= 0) {
    out.push({ text: "Vendosni një çmim real ose zgjidhni “me marrëveshje”." });
  }
  return out.slice(0, 3);
}

const ASSISTANT_SYSTEM = `You help users write better classified ads on KetuJemi.com.
Reply ONLY with JSON: {"suggestions":["...","..."]}
- Maximum 3 short suggestions (one sentence each).
- Same language as requested (Albanian, Macedonian, or Montenegrin).
- Practical tips: photos, year, mileage, price, title length, description detail.
- Do not repeat obvious empty fields if already good.`;

export async function getPostingSuggestions(
  input: {
    title: string;
    description: string;
    price: number;
    category_name?: string | null;
    image_count: number;
    parent_category_name?: string | null;
  },
  lang: UiLang = "sq",
): Promise<PostingSuggestion[]> {
  const title = input.title.trim();
  const desc = input.description.trim();
  if (title.length < 3 && desc.length < 10) {
    return [];
  }

  const fallback = ruleBasedSuggestions({
    title,
    description: desc,
    price: input.price,
    image_count: input.image_count,
  });

  if (!isClaudeConfigured()) {
    return fallback;
  }

  try {
    const parsed = await claudeJsonCompletion<{ suggestions: string[] }>({
      system: ASSISTANT_SYSTEM,
      user: JSON.stringify({
        language: langLabel(lang),
        title,
        description: desc.slice(0, 2000),
        price_eur: input.price,
        category: input.category_name,
        parent_category: input.parent_category_name,
        image_count: input.image_count,
      }),
      maxTokens: 512,
    });

    if (!parsed?.suggestions?.length) return fallback;

    return parsed.suggestions
      .filter((s) => typeof s === "string" && s.trim().length > 0)
      .slice(0, 3)
      .map((text) => ({ text: text.trim() }));
  } catch {
    return fallback;
  }
}
