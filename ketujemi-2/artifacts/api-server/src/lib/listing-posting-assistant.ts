import { claudeJsonCompletion, isClaudeConfigured, langLabel, type UiLang } from "./claude-client";

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
  parent_category_name?: string | null;
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
  if (!input.price_agreement && input.price <= 0) {
    out.push({ text: "Vendosni një çmim real ose zgjidhni “me marrëveshje”." });
  }
  return out.slice(0, 3);
}

const ASSISTANT_SYSTEM = `You help users write classified ads on KetuJemi.com — a large marketplace with roughly 20 top-level categories (from phones and electronics to vehicles and more).

CONTEXT — DUPLICATES:
The platform blocks duplicate listings while another with the same title is still active. If the user's draft reads as almost copy-pasted, overly generic/template-like, or could be mistaken for something they likely already posted unchanged, include ONE friendly suggestion that matches this humane guidance — only when it genuinely applies (not on every listing).

Use the user's reply language:
- Albanian (sq): use this wording or equivalent: "Për të shmangur postimet e dyfishta dhe që njoftimi juaj të aprovohet më shpejt, ju lutem shtoni një detaj specifik (p.sh. numrin serial, ngjyrën ose një përshkrim të veçantë) që e dallon këtë artikull nga të tjerët."
- Macedonian (mk) / Montenegrin (me): translate that same meaning naturally (serial, color, distinctive description).

YOUR JOB — CATEGORY ONLY (product type, not geography):
- Help users place the listing in the category that matches WHAT they sell (title + description vs selected category/parent_category in the JSON).
- If the selected category already fits the product → do NOT mention category at all. Let them post. No warnings about city, country, or "wrong place".
- Only when the product clearly belongs elsewhere → ONE short suggestion to switch category (e.g. headphones → "Audio & Pajisje Zëri", not "Televizorë & Projektorë").
- Never block, scare, or imply approval will fail because of location when category is correct.

CATEGORY ACCURACY (when product type is wrong):
- Speakers/headphones/JBL/Bose → "Audio & Pajisje Zëri", NEVER "Televizorë & Projektorë".
- TVs/projectors → "Televizorë & Projektorë"; consoles → "Konzola & Gaming".
- Fëmijë subcategories: strollers → Karroca & Transport; toys → Lodra; etc. — pick the leaf/group that matches the item name.

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
- Optional tips only: more photos, realistic price — NEVER require model/year/size/reason for selling, serial number, or long title. NEVER about contact info or geography.`;

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
