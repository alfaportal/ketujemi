import {
  claudeJsonCompletion,
  isClaudeConfigured,
  langLabel,
  type UiLang,
} from "./claude-client";

export type ModerationResult = {
  approved: boolean;
  reason: string;
};

const BLOCK_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /\b(armë|arme|pistol|rifle|kalashnikov)\b/i, reason: "Shitja e armëve nuk lejohet." },
  { re: /\b(droga|kokain|heroin|kanabis|marijuana)\b/i, reason: "Shitja e drogës nuk lejohet." },
  { re: /\b(crypto|bitcoin|ethereum|nft)\b/i, reason: "Kriptomonedhat nuk lejohen." },
  { re: /\b(mlm|piramid|ponzi)\b/i, reason: "Skemat piramidale nuk lejohen." },
  { re: /\b(escort|prostitut|takime intime|seks)\b/i, reason: "Përmbajtja erotike nuk lejohet." },
];

function ruleBasedModeration(input: {
  title: string;
  description: string;
  price: number;
  image_url?: string | null;
}): ModerationResult {
  const title = input.title.trim();
  const desc = input.description.trim();
  const combined = `${title}\n${desc}`;

  if (title.length < 3) {
    return { approved: false, reason: "Titulli është shumë i shkurtër." };
  }
  if (desc.length < 10) {
    return { approved: false, reason: "Përshkrimi është shumë i shkurtër." };
  }
  if (title.length > 120) {
    return { approved: false, reason: "Titulli është shumë i gjatë." };
  }

  for (const { re, reason } of BLOCK_PATTERNS) {
    if (re.test(combined)) {
      return { approved: false, reason };
    }
  }

  return { approved: true, reason: "" };
}

const MODERATION_SYSTEM = `You are the automatic content moderator for KetuJemi.com (classifieds: Kosovo, Albania, North Macedonia, Montenegro).
Reply with ONLY valid JSON: {"approved":boolean,"reason":"string"}
- reason must be in the user's language (Albanian, Macedonian, or Montenegrin) and explain clearly if approved is false.
- reason empty string if approved is true.

BLOCK (approved false):
- Counterfeit / replica / fake branded goods
- Weapons, drugs, alcohol, tobacco, e-cigarettes
- Pyramid schemes / MLM recruitment
- Erotic or dating ads
- Crypto / gambling account sales
- Empty or meaningless title/description
- Price 0 or clearly unrealistic for category
- Spam, scams, off-platform-only ads with no real product`;

export async function moderateListingContent(
  input: {
    title: string;
    description: string;
    price: number;
    category_name?: string | null;
    image_url?: string | null;
    condition?: string | null;
  },
  lang: UiLang = "sq",
): Promise<ModerationResult> {
  const rules = ruleBasedModeration(input);
  if (!rules.approved) return rules;

  if (!isClaudeConfigured()) {
    return rules;
  }

  try {
    const imageCount = input.image_url
      ? input.image_url.split(",").filter(Boolean).length
      : 0;

    const parsed = await claudeJsonCompletion<{ approved: boolean; reason: string }>({
      system: MODERATION_SYSTEM,
      user: JSON.stringify({
        language: langLabel(lang),
        title: input.title,
        description: input.description.slice(0, 4000),
        price_eur: input.price,
        category: input.category_name ?? "unknown",
        condition: input.condition ?? "unknown",
        image_count: imageCount,
      }),
      maxTokens: 512,
    });

    if (!parsed || typeof parsed.approved !== "boolean") {
      return rules;
    }

    return {
      approved: parsed.approved,
      reason: typeof parsed.reason === "string" ? parsed.reason.trim() : "",
    };
  } catch {
    return rules;
  }
}
