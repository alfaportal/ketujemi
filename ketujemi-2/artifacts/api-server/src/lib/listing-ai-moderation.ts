import {
  claudeJsonCompletion,
  isClaudeConfigured,
  langLabel,
  type UiLang,
} from "./claude-client";
import {
  countListingImages,
  isDhurataFalasSlug,
  isKerkojTeBlejSlug,
} from "../../../../lib/special-listing-categories.js";
import { detectProhibitedListingContent } from "../../../../lib/listing-prohibited-content.js";

export type ModerationResult = {
  approved: boolean;
  reason: string;
};

const SPAM_BLOCK_PATTERNS: { re: RegExp; reason: string }[] = [
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
  video_url?: string | null;
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

  // Foto (video-only listings are allowed)
  const imageCount = countListingImages(input.image_url);
  const hasVideo = Boolean(input.video_url?.trim());
  if (imageCount < 1 && !hasVideo)
    return { approved: false, reason: "Ju lutem ngarkoni të paktën një foto." };
  // Produktet e ndaluara (armë, duhan, alkool, drogë — pa përjashtime)
  const prohibited = detectProhibitedListingContent(title, desc);
  if (prohibited) {
    return { approved: false, reason: prohibited.reason };
  }

  for (const { re, reason } of SPAM_BLOCK_PATTERNS) {
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
    video_url?: string | null;
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
