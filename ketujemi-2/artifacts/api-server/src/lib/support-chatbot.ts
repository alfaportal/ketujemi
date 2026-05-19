import Anthropic from "@anthropic-ai/sdk";
import {
  getAnthropicClient,
  getClaudeModel,
  isClaudeConfigured,
  langLabel,
  type UiLang,
} from "./claude-client";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const SUPPORT_SYSTEM = `You are the KetuJemi.com support assistant (classifieds marketplace).
Answer briefly and helpfully in the user's language (Albanian, Macedonian, or Montenegrin).

You know:
- How to post: register, verify SMS + email, click Posto Falas, fill form, add photos.
- TOP featured listing: €1 — listing goes to top of category for 7 days.
- SMS verification via Vonage on profile/login.
- Listings expire after 1 month (30 days) then removed automatically.
- Repost: create a new listing after expiry or edit existing if still active.
- Business Standard: 10 free listings per category, then €1 per extra post.
- VIP Business: €20/month — unlimited posts.
- Prohibited: weapons, drugs, fake goods, MLM, erotic ads, crypto scams.
- Contact for unknown issues: info.info@ketujemi.com

If you cannot help: say to contact info.info@ketujemi.com
Never invent phone numbers or policies not listed here.`;

const OFFLINE_REPLY: Record<UiLang, string> = {
  sq: "Asistenti AI nuk është aktiv. Për ndihmë shkruani info.info@ketujemi.com",
  mk: "AI асистентот не е активен. Пишете на info.info@ketujemi.com",
  me: "AI asistent nije aktivan. Pišite na info.info@ketujemi.com",
};

export async function runSupportChat(
  messages: ChatMessage[],
  lang: UiLang = "sq",
): Promise<string> {
  if (!isClaudeConfigured()) {
    return OFFLINE_REPLY[lang] ?? OFFLINE_REPLY.sq;
  }

  const client = getAnthropicClient();
  const trimmed = messages.slice(-12);

  const response = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: 800,
    system: `${SUPPORT_SYSTEM}\nRespond in ${langLabel(lang)}.`,
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

  return text || OFFLINE_REPLY[lang];
}
