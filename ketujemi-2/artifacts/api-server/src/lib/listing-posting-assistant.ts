import { claudeJsonCompletion, isClaudeConfigured, langLabel, type UiLang } from "./claude-client";
import { CATEGORY_CLASSIFY_GUIDE } from "./category-assistant-guide";
import { getHubCategoryMismatchHint } from "./hub-category-suggest-rules";
import { detectProhibitedListingContent } from "../../../../lib/listing-prohibited-content.js";

export type PostingSuggestion = { text: string };

/** Spec: suggestions only after title + description + price are filled. */
export function postingFieldsReady(input: {
  title: string;
  description: string;
  price: number;
  price_agreement?: boolean;
}): boolean {
  const title = input.title.trim();
  const desc = input.description.trim();
  if (title.length < 3 || desc.length < 10) return false;
  if (input.price_agreement) return true;
  return input.price > 0;
}

function ruleBasedSuggestions(input: {
  title: string;
  description: string;
  price: number;
  price_agreement?: boolean;
  image_count: number;
  category_name?: string | null;
  parent_category_name?: string | null;
}): PostingSuggestion[] {
  const out: PostingSuggestion[] = [];

  const prohibited = detectProhibitedListingContent(`${input.title} ${input.description}`);
  if (prohibited) {
    out.push({ text: `${prohibited.reason} Postimi do të refuzohet.` });
    return out.slice(0, 3);
  }

  if (input.image_count > 10) {
    out.push({ text: "Maksimumi është 10 foto për shpallje — hiqni foto shtesë." });
  }
  if (input.description.trim().length < 40) {
    out.push({ text: "Përshkrimi është shumë i shkurtër — shtoni më shumë detaje." });
  }
  if (input.image_count < 3) {
    out.push({ text: "Shtoni të paktën 3 foto për më shumë shikime." });
  }
  if (input.title.trim().length > 80) {
    out.push({ text: "Titulli është shumë i gjatë — shkurtësojeni." });
  }
  if (!input.price_agreement && input.price <= 0) {
    out.push({ text: "Vendosni një çmim real ose zgjidhni “me marrëveshje”." });
  }

  const text = `${input.title} ${input.description}`;
  const mismatch = getHubCategoryMismatchHint(
    text,
    input.parent_category_name,
    input.category_name,
  );
  if (mismatch) {
    out.push({ text: mismatch });
  }

  return out.slice(0, 3);
}

const ASSISTANT_SYSTEM = `You help users write classified ads on KetuJemi.com — a large marketplace with roughly 20 top-level categories (from phones and electronics to vehicles and more).

STYLE — keep every suggestion ONE short sentence. Max 3 suggestions total.

HARD RULES (enforce immediately in suggestions when violated):
• **Max 10 photos** per listing — if image_count > 10, tell user to remove extras.
• **Prohibited items** (weapons, drugs, alcohol, tobacco/vape, crypto, gambling, MLM, erotik, fake/replica) — posting WILL be blocked; tell user clearly and stop encouraging other tips until fixed.
• **One product per listing** in the **correct category only** — never mix unrelated items or wrong hub (phones ≠ TV, motorcycles ≠ Vetura, headphones ≠ Televizorë).
• **Duplicates:** same or nearly identical item cannot be reposted within 1 month — suggest Edito on the old listing or add a distinctive detail (color, model, serial).

CONTEXT — DUPLICATES:
The platform blocks reposting the same or very similar item within 1 month (active listing or posted in last 30 days). If the user's draft reads as almost copy-pasted, overly generic/template-like, or could be mistaken for something they likely already posted, include ONE friendly suggestion — only when it genuinely applies (not on every listing).

Use the user's reply language:
- Albanian (sq): use this wording or equivalent: "Nuk lejohet i njëjti send dy herë brenda 1 muaji. Nëse kjo është shpallja juaj e vjetër, përdorni Edito; përndryshe shtoni një detaj specifik (ngjyra, model, gjendje) që e dallon artikullin."
- Macedonian (mk) / Montenegrin (me): translate that same meaning naturally (serial, color, distinctive description).

YOUR JOB — CATEGORY ONLY (product type, not geography):
- Help users place the listing in the category that matches WHAT they sell (title + description vs selected category/parent_category in the JSON).
- If the selected category already fits the product → do NOT mention category at all. Let them post. No warnings about city, country, or "wrong place".
- Only when the product clearly belongs elsewhere → ONE short suggestion to switch category (e.g. headphones → "Audio & Pajisje Zëri", not "Televizorë & Projektorë"; phones → "Telefona → Smartphones").
- Never block, scare, or imply approval will fail because of location when category is correct.

CATEGORY ACCURACY (when product type is wrong):
${CATEGORY_CLASSIFY_GUIDE}
- When wrong: ONE short suggestion naming the correct parent → subcategory (nenkategori).

POSTING LOCATION (never mix with category):
- Category = product type only. "Vendndodhja" (city/country) is separate — Kosovo, Albania, North Macedonia, Montenegro are all allowed for any category.
- NEVER tell users they must sell only in a specific country/city because of the category.
- NEVER suggest changing location. NEVER imply geographic lock-in. NEVER say "you cannot post from here".

CONTACT — DO NOT INTERFERE (platform handles this):
- Seller fills their own phone field, email in specs, and location/country in the form. You must NOT comment on, criticize, or suggest changes to phone number, email, WhatsApp, Viber, Telegram, or where they live.
- Do NOT tell users to add/remove phone or email in title or description — the site has a dedicated phone field and masks contact for visitors automatically.
- Do NOT warn that posting will fail because of their phone or country. That is not your role.

TECHNICAL OUTPUT:
Reply ONLY with JSON: {"suggestions":["...","..."]}
- Maximum 3 short suggestions (one sentence each).
- Language = requested (sq / mk / me).
- Optional tips only: more photos (up to 10 max), realistic price — NEVER require model/year/size/reason for selling, serial number, or long title. NEVER about contact info or geography.`;

export async function getPostingSuggestions(
  input: {
    title: string;
    description: string;
    price: number;
    price_agreement?: boolean;
    category_name?: string | null;
    image_count: number;
    parent_category_name?: string | null;
  },
  lang: UiLang = "sq",
): Promise<PostingSuggestion[]> {
  if (!postingFieldsReady(input)) {
    return [];
  }

  const title = input.title.trim();
  const desc = input.description.trim();

  const fallback = ruleBasedSuggestions(input);

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
        price_agreement: !!input.price_agreement,
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
