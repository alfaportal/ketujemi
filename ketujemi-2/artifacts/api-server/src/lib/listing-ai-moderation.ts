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
  // Armë
  { re: /\b(armë|arme|pistol|rifle|kalashnikov|bomba|granata|thikë luftarake|municion)\b/i, reason: "Shitja e armëve nuk lejohet." },
  // Drogë
  { re: /\b(droga|kokain|heroin|kanabis|marijuana|ekstazi|amfetamin|metadon|lsd|kep)\b/i, reason: "Shitja e drogës nuk lejohet." },
  // Alkool
  { re: /\b(alkool|verë|rakija|birrë|beer|whisky|vodka|raki|konjak|liquor)\b/i, reason: "Alkooli dhe pijet alkoolike nuk lejohen." },
  // Duhan
  { re: /\b(duhan|duhani|cigare|tobacco|cigar|tytyn)\b/i, reason: "Duhani dhe cigaret nuk lejohen." },
  // Vape
  { re: /\b(vape|e-cig|ecig|puff|juul|iqos|heets)\b/i, reason: "Cigaret elektronike nuk lejohen." },
  // Crypto
  { re: /\b(crypto|bitcoin|ethereum|nft|binance|usdt|dogecoin|blockchain|token|coin)\b/i, reason: "Kriptomonedhat nuk lejohen." },
  // MLM
  { re: /\b(mlm|piramid|ponzi|skemë piramidale|network marketing|passive income|fitim pasiv)\b/i, reason: "Skemat piramidale / MLM nuk lejohen." },
  // Erotik
  { re: /\b(escort|prostitut|takime intime|seks|porno|strip|onlyfans|fetish)\b/i, reason: "Përmbajtja erotike nuk lejohet." },
  // Kazino
  { re: /\b(kazino|casino|baste|lojëra fati|gambling|poker|slot|bet|1xbet|betsson)\b/i, reason: "Llogaritë e lojërave / baste nuk lejohen." },
  // Replika
  { re: /\b(replika|kopje|fake|counterfeit|imitation|1:1|superfake|aaa grade)\b/i, reason: "Produktet e falsifikuara / replika nuk lejohen." },
  // Kontakt në titull
  { re: /(\+3[0-9]{11}|00[0-9]{10}|\b(viber|whatsapp|telegram|signal)\b)/i, reason: "Mos vendos kontakt në titull ose përshkrim." },
  // Spam fjalë
  { re: /\b(klikoni|kliko|shko te|vizito|instagram|facebook\.com|tiktok|youtube\.com)\b/i, reason: "Linqet dhe rrjetet sociale nuk lejohen në shpallje." },
  // Fjalë mashtruese
  { re: /\b(fitoni|fitonni|bëhu i pasur|mundësi e artë|invest|investim i sigurt|garanci 100%)\b/i, reason: "Oferta mashtruese nuk lejohen." },
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

  // Gjatësia e titullit
  if (title.length < 5)
    return { approved: false, reason: "Titulli është shumë i shkurtër." };
  if (title.length > 120)
    return { approved: false, reason: "Titulli është shumë i gjatë (max 120 karaktere)." };

  // Gjatësia e përshkrimit
  if (desc.length < 20)
    return { approved: false, reason: "Përshkrimi është shumë i shkurtër (min 20 karaktere)." };

  // Titull vetëm me numra
  if (/^\d+$/.test(title))
    return { approved: false, reason: "Titulli nuk mund të jetë vetëm numra." };

  // ALL CAPS spam
  if (title.length > 10 && title === title.toUpperCase())
    return { approved: false, reason: "Mos shkruaj titullin me shkronja të mëdha (ALL CAPS)." };

  // Çmim
  if (!input.price_agreement && input.price <= 0)
    return { approved: false, reason: "Vendosni një çmim real (jo 0 €)." };
  if (!input.price_agreement && input.price > 10000000)
    return { approved: false, reason: "Çmimi duket jorealiste — kontrolloje." };

  // Foto
  if (!input.image_url)
    return { approved: false, reason: "Ju lutem ngarkoni të paktën një foto." };

  // Fjalë të ndaluara
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
- Duplicate-looking spam or off-platform-only ads with no real product
- Listings with 0 images
- Titles under 3 words or descriptions under 10 words
- Contact info (phone/email/WhatsApp) in title or description
- External links or social media handles in description
- All-caps titles that look like spam
- Misleading category (car listed under electronics, etc.)

APPROVE if:
- Real product with honest title and description
- Realistic price for category
- At least 1 image
- No prohibited content

Be strict but fair. When in doubt, approve.`;

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
