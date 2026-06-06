import { claudeJsonCompletion, isClaudeConfigured, type UiLang } from "./claude-client";

const GENERATE_SYSTEM = `You write professional shop/business descriptions for KetuJemi.com shop directory.

Reply ONLY with JSON: {"description":"..."}

STRICT rules:
- Write in Albanian (standard Kosovo/Albania Albanian).
- 2–4 short paragraphs, professional and welcoming tone for a business directory profile.
- Base content ONLY on the business type and optional shop name/category provided — do NOT invent specific addresses, phone numbers, years in business, or brand names not given.
- Suitable for a shop application form (services, products, customer focus).
- No bullet lists, headings, or meta-commentary.
- Approximately 80–200 words.`;

function acceptableDescription(text: string): boolean {
  const p = text.trim();
  if (p.length < 40 || p.length > 2500) return false;
  if (/^[-*•]\s/m.test(p)) return false;
  return true;
}

export async function generateShopDescription(
  input: { business_type: string; shop_name?: string; category?: string },
  _lang: UiLang = "sq",
): Promise<string | null> {
  const businessType = input.business_type.trim();
  if (businessType.length < 3) return null;

  if (!isClaudeConfigured()) {
    return null;
  }

  try {
    const parsed = await claudeJsonCompletion<{ description?: string }>({
      system: GENERATE_SYSTEM,
      user: JSON.stringify({
        business_type: businessType,
        shop_name: input.shop_name?.trim() || null,
        category: input.category?.trim() || null,
      }),
      maxTokens: 768,
    });
    const description = parsed?.description?.trim();
    if (description && acceptableDescription(description)) return description;
    return null;
  } catch {
    return null;
  }
}
