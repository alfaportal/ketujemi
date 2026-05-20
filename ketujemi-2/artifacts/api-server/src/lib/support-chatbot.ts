import {
  getAnthropicClient,
  getClaudeModel,
  isClaudeConfigured,
  langLabel,
  type UiLang,
} from "./claude-client";
import { escalateToEmailReply, tryBrowseOrFaqAnswer } from "./support-chat-faq-offline";
import {
  getLastUserMessage,
  invalidSupportQuestionReply,
  screenSupportUserMessage,
  supportsEmailEscalation,
} from "./support-chat-screening";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const SUPPORT_EMAIL = "info.info@ketujemi.com";

const SUPPORT_SYSTEM = `You are the KetuJemi.com support assistant (classifieds: Kosovo, Albania, North Macedonia, Montenegro).

TOXIC / GIBBERISH / OFF-TOPIC:
- If the user's last message is vulgar, harassing, meaningless noise, or unrelated spam, reply with EXACTLY ONE sentence and nothing else — the same refusal your system uses (in the user's language Albanian / Macedonian / Montenegrin). Do NOT mention any email or support address in that case.

NORMAL QUESTIONS — HOW TO RESPOND (strict order):
1. Answer platform questions yourself — clearly, 2–5 short sentences, steps when helpful.
2. Use ONLY the knowledge below. Do not guess prices, phone numbers, or policies not listed.
3. Do NOT mention ${SUPPORT_EMAIL} for topics you can cover (posting, expiry, repost, delete, TOP, business, verification, duplicates, limits, prohibited items).
4. ONLY when the user writes a serious, coherent question clearly about KetuJemi (account, billing, legal, hacked account, undisclosed bug, partnership, media) that you cannot resolve from the list below — briefly say the team can help and give: ${SUPPORT_EMAIL}
5. Never suggest email for insults, nonsense, or unrelated chat. Never use email as the first/default line when you can answer from the knowledge.

PLATFORM KNOWLEDGE:
• Post: register → verify email + SMS → "Posto Falas" → title, description, photos, price → publish. Active 30 days.
• Expiry: 30 days; email reminders if verified; after expiry "Rifillo njoftimin" for 30 days more.
• Delete / edit: from listing page while logged in.
• Duplicates: one same active ad at a time; delete old first.
• Max 10 active listings per user.
• TOP: €1 when enabled; +7 / +5 / +3 / +1 day tiers; TOP above normal.
• Business Standard: 10 free per category then €1 extra; VIP €20/mo unlimited.
• Verification: email + SMS (Vonage).
• Prohibited: weapons, drugs, alcohol, tobacco, vapes, fakes, MLM, erotic, crypto/gambling scams.
• Report button on listings.

BROWSING / FINDING PRODUCTS (very common):
• KetuJemi is a classifieds site — sellers post individual listings; buyers browse categories or «Njoftimet» / all listings.
• To find books, cars, phones, etc.: open the homepage → pick the closest category (e.g. Muzikë → Libra for books/records, Elektronikë for phones, Vetura for cars) → open listings.
• Never reply with only an email address for «where can I find X» / «ku mund ta gjej» — always explain categories + listings first.

Respond in the user's language (Albanian, Macedonian, or Montenegrin — see user language line below).`;

function clampEmailInReply(text: string, lastUser: string, lang: UiLang): string {
  const allowEmail = supportsEmailEscalation(lastUser);

  if (allowEmail) return text;

  if (text.includes(SUPPORT_EMAIL) || text.toLowerCase().includes("info.info@")) {
    return invalidSupportQuestionReply(lang);
  }

  return text;
}

export async function runSupportChat(
  messages: ChatMessage[],
  lang: UiLang = "sq",
): Promise<string> {
  const lastUser = getLastUserMessage(messages);

  if (screenSupportUserMessage(lastUser) === "invalid") {
    return invalidSupportQuestionReply(lang);
  }

  const offlineOrBrowse = tryBrowseOrFaqAnswer(messages, lang);

  if (!isClaudeConfigured()) {
    if (offlineOrBrowse) return offlineOrBrowse;
    if (supportsEmailEscalation(lastUser)) return escalateToEmailReply(lang);
    return invalidSupportQuestionReply(lang);
  }

  const client = getAnthropicClient();
  const trimmed = messages.slice(-12);

  const response = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: 800,
    system: `${SUPPORT_SYSTEM}\n\nUser language: ${langLabel(lang)}.`,
    messages: trimmed.map((m) => ({
      role: m.role,
      content: m.content.slice(0, 2000),
    })),
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();

  if (text) {
    return clampEmailInReply(text, lastUser, lang);
  }

  if (offlineOrBrowse) return offlineOrBrowse;
  if (supportsEmailEscalation(lastUser)) return escalateToEmailReply(lang);
  return invalidSupportQuestionReply(lang);
}

/** When API fails entirely — try FAQ before email. */
export function supportChatFallbackReply(messages: ChatMessage[], lang: UiLang): string {
  const lastUser = getLastUserMessage(messages);

  if (screenSupportUserMessage(lastUser) === "invalid") {
    return invalidSupportQuestionReply(lang);
  }

  const offlineOrBrowse = tryBrowseOrFaqAnswer(messages, lang);
  if (offlineOrBrowse) return offlineOrBrowse;
  if (supportsEmailEscalation(lastUser)) return escalateToEmailReply(lang);
  return invalidSupportQuestionReply(lang);
}
