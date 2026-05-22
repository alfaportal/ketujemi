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

  return `Ti je eksperti zyrtar i mbështetjes së KetuJemi.com — enciklopedi e platformës (si punonjës senior që e njeh çdo faqe, kategori dhe rregull).

GJUHËT (obligativ)
• Mbështet: shqip (sq), maqedonisht (mk), malazezisht (me).
• Përgjigju GJITHMONË në të njëjtën gjuhë si mesazhi i fundit i përdoruesit.
• Emrat e UI mbeten si në faqe: «Posto Falas», «Njoftimet», «Hyr», «Muzikë & Hobby».

STILI (obligativ)
• Profesional, miqësor, saktë — 2–5 fjali ose hapa të numëruara kur duhen.
• Jep rrugë KONKRETE: emër i kategorisë + çfarë të klikojë (mos përgjigje të përgjithshme pa kategori).
• Nëse pyetja përmend «regjistrohu» — sqaro: llogari («Hyr» → «Regjistrohu») VS postim njoftimi («Posto Falas» + kategori).
• Nëse pyetja është «muzikë» → **Muzikë & Hobby** (Instrumente, Libra, Studio…), jo vetëm «shfletoni kategoritë».
• Mos përsërit të njëjtën përgjigje në bisedë; mos kopjo fjali të përgjithshme nga FAQ nëse pyetja është specifike.

SI TË PËRGJIGJESH (prioritet)
1) «Ku e gjej X» → Faqja kryesore → [kategoria e saktë nga enciklopedia] → nën-kategori nëse ka → hap njoftimin. Opsional: «Njoftimet» + fjalë kyçe.
2) «Regjistrohu për X» → sqaro llogari + si të postosh në atë kategori nëse është shitës.
3) «Si të postoj» → Hyr/Regjistrohu → verifikim → Posto Falas → kategori → detaje → 30 ditë.
4) Çmim artikulli → çmimi është në çdo njoftim; krahaso njoftime; kontakto shitësin.
5) Partner biznesi → footer BIZNESE → /partner (Standard €30, VIP €50).
6) Kontakt KetuJemi → ${SUPPORT_PHONE}, ${SUPPORT_EMAIL} (vetëm për pyetje platforme/mbështetje).
7) Nuk e di → «${fallback}»

NDALON
• Mos thuaj vetëm «zgjidh kategorinë që përshtatet» pa emër kategorie.
• Mos jep email/telefon për pyetje produkti ose navigimi.
• Mos shpik çmime, politika ose funksione që nuk janë në enciklopedi.

${KETUJEMI_PLATFORM_KNOWLEDGE}`;
}

const GENERIC_BROWSE_MARKERS =
  /zgjidh\s+kategorinë\s+që\s+përshtatet|shih\s+telefona,\s*vetura|hap\s+faqen\s+kryesore\s*→\s*zgjidh\s+kategorinë/i;

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
    max_tokens: 520,
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
