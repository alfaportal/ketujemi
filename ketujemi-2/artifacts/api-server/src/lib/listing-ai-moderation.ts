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
  { re: /\b(armë|arme|pistol|rifle|kalashnikov|bomba)\b/i, reason: "Shitja e armëve nuk lejohet." },
  { re: /\b(droga|kokain|heroin|kanabis|marijuana|ekstazi)\b/i, reason: "Shitja e drogës nuk lejohet." },
  { re: /\b(alkool|verë|rakija|birrë|beer|whisky|vodka)\b/i, reason: "Alkooli dhe pijet alkoolike nuk lejohen." },
  { re: /\b(duhan|duhani|cigare|tobacco|cigar)\b/i, reason: "Duhani dhe cigaret nuk lejohen." },
  { re: /\b(vape|e-cig|ecig|puff)\b/i, reason: "Cigaret elektronike nuk lejohen." },
  { re: /\b(crypto|bitcoin|ethereum|nft|binance)\b/i, reason: "Kriptomonedhat nuk lejohen." },
  { re: /\b(mlm|piramid|ponzi|skemë piramidale)\b/i, reason: "Skemat piramidale / MLM nuk lejohen." },
  { re: /\b(escort|prostitut|takime intime|seks|porno)\b/i, reason: "Përmbajtja erotike nuk lejohet." },
  { re: /\b(kazino|casino|baste|lojëra fati|gambling)\b/i, reason: "Llogaritë e lojërave / baste nuk lejohen." },
  { re: /\b(replika|kopje|fake|counterfeit|imitation|1:1)\b/i, reason: "Produktet e falsifikuara / replika nuk lejohen." },
];

function ruleBasedModeration(input: {
  title: string;
  description: string;
  price: number;
  price_agreement?: boolean;
  image_url?: string | null;
}): ModerationResult {
  const title = input.title.trim();
  const desc = input.description.trim();
  const combined = `${title}\n${desc}`;

  if (title.length < 3) {
    return { approved: false, reason: "Titulli është shumë i shkurtër ose bosh." };
  }
  if (desc.length < 10) {
    return { approved: false, reason: "Përshkrimi është shumë i shkurtër." };
  }
  if (title.length > 120) {
    return { approved: false, reason: "Titulli është shumë i gjatë." };
  }

  if (!input.price_agreement && input.price <= 0) {
    return { approved: false, reason: "Vendosni një çmim real (jo 0 €)." };
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
- reason in the user's language (Albanian, Macedonian, or Montenegrin). Empty if approved.

BLOCK (approved false):
- Counterfeit / replica / fake branded goods
- Weapons, drugs, alcohol, tobacco, e-cigarettes
- Pyramid schemes / MLM recruitment
- Erotic or dating ads
- Crypto / gambling account sales
- Empty, spam, or meaningless title/description
- Price 0 or clearly unrealistic for the category (unless price_agreement is true)
- Duplicate-looking spam or off-platform-only ads with no real product`;

export async function moderateListingContent(
  input: {
    title: string;
    description: string;
    price: number;
    price_agreement?: boolean;
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
        price_agreement: !!input.price_agreement,
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
