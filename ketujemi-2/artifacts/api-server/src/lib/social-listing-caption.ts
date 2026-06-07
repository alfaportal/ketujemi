import {
  claudeJsonCompletion,
  claudeVisionJsonCompletion,
  isClaudeConfigured,
} from "./claude-client.js";
import { logger } from "./logger.js";
import {
  listingFlairLine,
  resolveListingTheme,
  sellerDisplayName,
} from "./social-post-captions.js";

export type SocialListingCaptionInput = {
  title: string;
  description: string;
  categoryName?: string | null;
  categorySlug?: string | null;
  rootCategorySlug?: string | null;
  propertySubtype?: string | null;
  propertyTxn?: string | null;
  sellerName?: string | null;
  shopName?: string | null;
  imageUrl?: string | null;
  market: string;
};

function captionLang(market: string): string {
  if (market === "mk") return "Macedonian";
  if (market === "mne") return "Montenegrin";
  if (["de", "ch", "at", "fr", "it", "gb", "us"].includes(market)) return "English";
  return "Albanian";
}

function templateFlair(input: SocialListingCaptionInput): { fb: string; ig: string } {
  const ctx = {
    title: input.title,
    description: input.description,
    categoryName: input.categoryName ?? null,
    categorySlug: input.categorySlug ?? null,
    rootCategorySlug: input.rootCategorySlug ?? null,
    propertySubtype: input.propertySubtype ?? null,
    propertyTxn: input.propertyTxn ?? null,
    sellerName: input.sellerName ?? null,
    shopName: input.shopName ?? null,
  };
  return {
    fb: listingFlairLine("facebook", input.market, ctx),
    ig: listingFlairLine("instagram", input.market, ctx),
  };
}

async function tryAiFlair(
  input: SocialListingCaptionInput,
): Promise<{ fb: string; ig: string } | null> {
  if (!isClaudeConfigured()) return null;
  if (process.env.SOCIAL_CAPTION_AI_ENABLED === "false") return null;

  const seller = sellerDisplayName(input.shopName, input.sellerName) ?? "shitësi";
  const theme = resolveListingTheme({
    title: input.title,
    description: input.description,
    categoryName: input.categoryName,
    categorySlug: input.categorySlug,
    rootCategorySlug: input.rootCategorySlug,
    propertySubtype: input.propertySubtype,
    propertyTxn: input.propertyTxn,
  });
  const lang = captionLang(input.market);

  const system = `You write premium Facebook and Instagram promo lines for KetuJemi.com classified listings.
Return ONLY JSON: {"fb":"...","ig":"..."}
Rules:
- fb and ig MUST be different (2-3 short sentences each, engaging, with 1-2 emojis max)
- MUST mention the seller/firm by name: ${seller}
- Match THIS exact listing (title, description, category, photo) — not generic copy
- For celebration décor: identify the event (dasmë, fejesë, ditëlindje, festë tjetër) from content
- For real estate: name the exact type (banesë, shtëpi, tokë/truall, garazh, lokal, qira…) from content
- Never invent features not in the listing
- No phone numbers, emails, or external links
- Write in ${lang}`;

  const userText = JSON.stringify(
    {
      theme,
      title: input.title,
      description: input.description.slice(0, 1200),
      category: input.categoryName,
      category_slug: input.categorySlug,
      root_category: input.rootCategorySlug,
      property_subtype: input.propertySubtype,
      property_txn: input.propertyTxn,
      seller_firm: seller,
    },
    null,
    2,
  );

  try {
    const imageUrl = input.imageUrl?.trim();
    const parsed = imageUrl
      ? await claudeVisionJsonCompletion<{ fb?: string; ig?: string }>({
          system,
          userText: `Listing data:\n${userText}\n\nAlso study the photo and tailor the copy to what is shown.`,
          imageUrls: [imageUrl],
          maxTokens: 600,
        })
      : await claudeJsonCompletion<{ fb?: string; ig?: string }>({
          system,
          user: `Listing data:\n${userText}`,
          maxTokens: 600,
        });

    const fb = parsed?.fb?.trim();
    const ig = parsed?.ig?.trim();
    if (!fb || !ig || fb === ig) return null;
    if (fb.length > 500 || ig.length > 500) return null;
    const sellerToken = seller.toLowerCase().split(/\s+/)[0] ?? "";
    const mentionsSeller =
      !sellerToken ||
      fb.toLowerCase().includes(seller.toLowerCase()) ||
      ig.toLowerCase().includes(seller.toLowerCase()) ||
      fb.toLowerCase().includes(sellerToken) ||
      ig.toLowerCase().includes(sellerToken);
    if (!mentionsSeller) return null;
    return { fb, ig };
  } catch (err) {
    logger.warn({ err }, "social caption AI failed — using templates");
    return null;
  }
}

/** Tailored FB + IG flair for one listing (AI when available, else templates). */
export async function resolveSocialFlairLines(
  input: SocialListingCaptionInput,
): Promise<{ fb: string; ig: string; source: "ai" | "template"; theme: string }> {
  const theme = resolveListingTheme({
    title: input.title,
    description: input.description,
    categoryName: input.categoryName,
    categorySlug: input.categorySlug,
    rootCategorySlug: input.rootCategorySlug,
    propertySubtype: input.propertySubtype,
    propertyTxn: input.propertyTxn,
  });

  const ai = await tryAiFlair(input);
  if (ai) {
    return { ...ai, source: "ai", theme };
  }

  const tpl = templateFlair(input);
  return { ...tpl, source: "template", theme };
}
