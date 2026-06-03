import {
  claudeJsonCompletion,
  isClaudeConfigured,
  langLabel,
  type UiLang,
} from "./claude-client";
import {
  countListingImages,
  DHURATA_MAX_PHOTOS,
  isDhurataFalasSlug,
  isKerkojTeBlejSlug,
  KERKOJ_MAX_PHOTOS,
} from "../../../../lib/special-listing-categories.js";

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
  categoryRootSlug?: string | null;
}): ModerationResult {
  const title = input.title.trim();
  const desc = input.description.trim();
  const combined = `${title}\n${desc}`;
  const isKerkoj = isKerkojTeBlejSlug(input.categoryRootSlug);
  const isDhurata = isDhurataFalasSlug(input.categoryRootSlug);

  // Gjatësia e titullit
  if (title.length < 5)
    return { approved: false, reason: "Titulli është shumë i shkurtër." };
  if (title.length > 120)
    return { approved: false, reason: "Titulli është shumë i gjatë (max 120 karaktere)." };

  // Gjatësia e përshkrimit (e thjeshtë — jo fjalë të gjata)
  if (desc.length < 15)
    return { approved: false, reason: "Përshkrimi është shumë i shkurtër (min 15 karaktere)." };

  // Titull vetëm me numra
  if (/^\d+$/.test(title))
    return { approved: false, reason: "Titulli nuk mund të jetë vetëm numra." };

  // ALL CAPS spam
  if (title.length > 10 && title === title.toUpperCase())
    return { approved: false, reason: "Mos shkruaj titullin me shkronja të mëdha (ALL CAPS)." };

  // Çmim
  if (!isKerkoj && !isDhurata && !input.price_agreement && input.price <= 0)
    return { approved: false, reason: "Vendosni një çmim real (jo 0 €)." };
  if (!isKerkoj && !isDhurata && !input.price_agreement && input.price > 10000000)
    return { approved: false, reason: "Çmimi duket jorealiste — kontrolloje." };

  // Foto
  const imageCount = countListingImages(input.image_url);
  if (imageCount < 1)
    return { approved: false, reason: "Ju lutem ngarkoni të paktën një foto." };
  if (isKerkoj && imageCount > KERKOJ_MAX_PHOTOS)
    return { approved: false, reason: `Maksimumi ${KERKOJ_MAX_PHOTOS} foto për kërkesa.` };
  if (isDhurata && imageCount > DHURATA_MAX_PHOTOS)
    return { approved: false, reason: `Maksimumi ${DHURATA_MAX_PHOTOS} foto për dhurata.` };

  // Fjalë të ndaluara
  for (const { re, reason } of BLOCK_PATTERNS) {
    if (re.test(combined)) {
      return { approved: false, reason };
    }
  }

  return { approved: true, reason: "" };
}

/** @deprecated Quality gate moved to ruleBasedModeration only; AI must not reject for missing model/year/reason. */
const MODERATION_SYSTEM_PROHIBITED_ONLY = `You check ONLY for prohibited or illegal content on KetuJemi.com classifieds.
Reply with ONLY valid JSON: {"approved":boolean,"reason":"string"}
- reason in the user's language. Empty if approved.

BLOCK (approved false) ONLY for:
- Weapons, drugs, alcohol, tobacco, e-cigarettes, counterfeit/replica goods
- Pyramid schemes, erotic ads, crypto/gambling sales
- Obvious scam or illegal content

NEVER block because:
- Title is short (e.g. "Tablet", "Telefon") or has fewer than 3 words
- Description lacks model, year, size, specs, serial number, or "reason for selling"
- Seller did not explain why they are selling
- Listing is brief but honest (min length already checked server-side)

When in doubt, approve.`;

export async function moderateListingContent(
  input: {
    title: string;
    description: string;
    price: number;
    price_agreement?: boolean;
    category_name?: string | null;
    categoryRootSlug?: string | null;
    image_url?: string | null;
    condition?: string | null;
  },
  lang: UiLang = "sq",
): Promise<ModerationResult> {
  const rules = ruleBasedModeration(input);
  if (!rules.approved) return rules;

  // Do not run AI "quality" moderation — it wrongly rejected simple ads (model/year/reason demands).
  if (!isClaudeConfigured()) {
    return rules;
  }

  try {
    const parsed = await claudeJsonCompletion<{ approved: boolean; reason: string }>({
      system: MODERATION_SYSTEM_PROHIBITED_ONLY,
      user: JSON.stringify({
        language: langLabel(lang),
        title: input.title,
        description: input.description.slice(0, 4000),
      }),
      maxTokens: 256,
    });

    if (!parsed || typeof parsed.approved !== "boolean" || parsed.approved) {
      return rules;
    }

    const reason = typeof parsed.reason === "string" ? parsed.reason.trim() : "";
    if (!reason) return rules;

    return { approved: false, reason };
  } catch {
    return rules;
  }
}
