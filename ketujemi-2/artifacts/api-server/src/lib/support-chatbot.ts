import {
  getAnthropicClient,
  getClaudeModel,
  isClaudeConfigured,
  langLabel,
  type UiLang,
} from "./claude-client";
import { inferSupportLang } from "./infer-support-lang";
import {
  getSupportPhoneDisplay,
  SUPPORT_EMAIL,
  supportFallbackLine,
} from "./support-contact";
import {
  escalateToEmailReply,
  tryBrowseOrFaqAnswer,
  tryPrioritySupportAnswer,
} from "./support-chat-faq-offline";
import { KETUJEMI_PLATFORM_KNOWLEDGE } from "./support-platform-knowledge";
import {
  getLastUserMessage,
  invalidSupportQuestionReply,
  isSupportContactQuestion,
  screenSupportUserMessage,
  supportsEmailEscalation,
} from "./support-chat-screening";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const SUPPORT_PHONE = getSupportPhoneDisplay();

function buildSupportSystem(replyLang: UiLang): string {
  const fallback = supportFallbackLine(replyLang);

  return `Ti je eksperti zyrtar i mbështetjes së KetuJemi.com — enciklopedi e plotë e platformës (kategoritë, tregjet, regjistrimi, postimi, pagesat, siguria).

GJUHËT (obligativ)
• Mbështet: shqip (sq), maqedonisht (mk), malazezisht (me).
• Përgjigju GJITHMONË në të njëjtën gjuhë si mesazhi i fundit të përdoruesit.
• Emrat e UI si në faqe: «Posto Falas», «Njoftimet», «Hyr», «Muzikë & Hobby», «Profili».

STILI (obligativ)
• Profesional, i detajuar, saktë — përdor hapa të numëruara për regjistrim/postim/rregulla.
• Jep përgjigje SPECIFIKE: emër kategorie + nën-kategori + veprim (kliko X → pastaj Y).
• MOS thuaj «shiko faqen kryesore», «kontrollo homepage», «zgjidh kategorinë që përshtatet» pa emër kategorie.
• «Regjistrohu» → dalloni llogari (Hyr→Regjistrohu, email/SMS) nga postim (Posto Falas + kategori).
• «Muzikë» → **Muzikë & Hobby** (kategori #17), JO Sport & Outdoor; listoni nën-kategoritë kur pyetja është e hollë.
• Përdor vetëm fakte nga enciklopedia më poshtë; mos shpik API keys, kode interne, ose politika që nuk ekzistojnë.

SI TË PËRGJIGJESH (prioritet)
1) Produkt / ku ta gjej → kategoria e saktë nga 18 kategoritë + nën-kategori + si të hapet njoftimi.
2) Regjistrim → hapat e plotë (email ose SMS; diaspora me email).
3) Postim → hapat e plotë (Posto Falas, foto, 30 ditë, 10/kategori, 10 total).
4) Tregje → 4 Ballkan + 7 diaspora (11 tregje).
5) Pagesa → Stripe/kartë për partner, TOP, paketa; JO për blerjen e produktit te shitësi.
6) Biznes / partner → llogari biznesi vs /partner Standard €30 / VIP €50.
7) Siguria → këshilla takimi, mos para avans, Raporto, support@ketujemi.com.
8) Kontakt platforme → ${SUPPORT_EMAIL}, ${SUPPORT_PHONE} (vetëm pyetje mbështetje/raportim).
9) Nuk e di → «${fallback}»

NDALON
• Përgjigje të vagë pa kategori dhe pa hapa.
• Email/telefon për navigim produkti (vetëm për mbështetje platforme).
• Zbulim i sekreteve teknike (API keys, env, kode serveri).

${KETUJEMI_PLATFORM_KNOWLEDGE}`;
}

const GENERIC_BROWSE_MARKERS =
  /zgjidh\s+kategorinë\s+që\s+përshtatet|shih\s+telefona,\s*vetura|hap\s+faqen\s+kryesore\s*→\s*zgjidh\s+kategorinë|shiko\s+faqen\s+kryesore|kontrollo\s+homepage|check\s+the\s+homepage/i;

function clampSupportReply(
  text: string,
  lastUser: string,
  replyLang: UiLang,
  messages: ChatMessage[],
  langHint: UiLang,
): string {
  const allowContact =
    supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser);

  if (allowContact) return text;

  const lower = text.toLowerCase();
  if (
    lower.includes(SUPPORT_EMAIL) ||
    lower.includes("support@ketujemi.com") ||
    lower.includes("info@ketujemi.com") ||
    text.includes(SUPPORT_PHONE)
  ) {
    return invalidSupportQuestionReply(replyLang);
  }

  if (GENERIC_BROWSE_MARKERS.test(text)) {
    const priority = tryPrioritySupportAnswer(
      [{ role: "user", content: lastUser }],
      langHint,
    );
    if (priority) return priority;
  }

  return text;
}

function resolveReplyLang(messages: ChatMessage[], hint: UiLang): UiLang {
  return inferSupportLang(getLastUserMessage(messages), hint);
}

export async function runSupportChat(
  messages: ChatMessage[],
  langHint: UiLang = "sq",
): Promise<string> {
  const lastUser = getLastUserMessage(messages);
  const replyLang = resolveReplyLang(messages, langHint);

  if (screenSupportUserMessage(lastUser) === "invalid") {
    return invalidSupportQuestionReply(replyLang);
  }

  const priorityAnswer = tryPrioritySupportAnswer(messages, langHint);
  if (priorityAnswer) {
    return priorityAnswer;
  }

  const offlineOrBrowse = tryBrowseOrFaqAnswer(messages, langHint);

  if (!isClaudeConfigured()) {
    if (offlineOrBrowse) return offlineOrBrowse;
    if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
      return escalateToEmailReply(replyLang);
    }
    return invalidSupportQuestionReply(replyLang);
  }

  const client = getAnthropicClient();
  const trimmed = messages.slice(-12);

  const response = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: 768,
    system: `${buildSupportSystem(replyLang)}\n\nGjuha e mesazhit të fundit të përdoruesit (përgjigju në këtë gjuhë): ${langLabel(replyLang)}.`,
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
    return clampSupportReply(text, lastUser, replyLang, messages, langHint);
  }

  if (offlineOrBrowse) return offlineOrBrowse;
  if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
    return escalateToEmailReply(replyLang);
  }
  return invalidSupportQuestionReply(replyLang);
}

export function supportChatFallbackReply(
  messages: ChatMessage[],
  langHint: UiLang = "sq",
): string {
  const lastUser = getLastUserMessage(messages);
  const replyLang = resolveReplyLang(messages, langHint);

  if (screenSupportUserMessage(lastUser) === "invalid") {
    return invalidSupportQuestionReply(replyLang);
  }

  const priorityAnswer = tryPrioritySupportAnswer(messages, langHint);
  if (priorityAnswer) return priorityAnswer;

  const offlineOrBrowse = tryBrowseOrFaqAnswer(messages, langHint);
  if (offlineOrBrowse) return offlineOrBrowse;
  if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
    return escalateToEmailReply(replyLang);
  }
  return invalidSupportQuestionReply(replyLang);
}
