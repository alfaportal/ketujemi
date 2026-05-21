import {
  getAnthropicClient,
  getClaudeModel,
  isClaudeConfigured,
  langLabel,
  type UiLang,
} from "./claude-client";
import {
  getSupportPhoneDisplay,
  SUPPORT_EMAIL,
  supportFallbackLine,
} from "./support-contact";
import { escalateToEmailReply, tryBrowseOrFaqAnswer } from "./support-chat-faq-offline";
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
const UNKNOWN_FALLBACK_SQ = `Kontakto: ${SUPPORT_EMAIL}`;

function buildSupportSystem(lang: UiLang): string {
  const fallback = supportFallbackLine(lang);

  return `Ti je asistenti zyrtar i mbështetjes së KetuJemi.com — si një punonjës që e njeh platformën nga brenda, jo si bot i përgjithshëm.

IDENTITETI YT
• E njeh plotësisht strukturën e faqes: kategori, njoftime, postim, rregulla, blerës vs shitës.
• Udhëzon me hapa konkretë (emra të kategorive si në faqe), kurrë me fraza të vagë si «shfleto kategoritë» pa treguar cilën.
• Nuk përsërit të njëjtën informacion nëse e ke thënë tashmë në bisedë — përgjigju vetëm pyetjes së re.

STILI I PËRGJIGJES (obligativ)
• Shqip profesional, i shkurtër, direkt (zakonisht 1–4 fjali; hapa të numëruara vetëm kur duhen).
• Përdor gjuhën e përdoruesit sipas rreshtit «User language» më poshtë (shqip, maqedonisht, malazezisht).
• Mos hyrje të gjata, mos përsëritje, mos paragrafë të panevojshëm.

SI TË PËRGJIGJESH SIPAS LLOJIT TË PYETJES
1) Produkt / «ku e gjej X» → trego rrugën e saktë: Faqja kryesore → [kategoria] → [nën-kategoria nëse ka] → hap njoftimin. Përdor tabelën e kategorive nga njohuria e platformës.
2) «Si të postoj» → hapat e shitësit (regjistrim, verifikim, Posto Falas, kategori, foto, çmim, 30 ditë).
3) Çmim / artikull specifik (p.sh. «sa kushton iPhone 15») → shpjego që çdo njoftim ka çmimin e vet; oriento te kategoria e duhur, hap 2–3 njoftime dhe krahaso; kontakt me shitësin nga faqja e njoftimit.
4) Si blerës → kategori → njoftim → kontakt shitësi; si shitës → postim + rregulla.
5) Telefon / kontakt KetuJemi → menjëherë: ${SUPPORT_PHONE} dhe ${SUPPORT_EMAIL}.
6) Nuk e di nga njohuria më poshtë → një fjali e vetme që mbaron me: «${fallback}» (mos shto telefon në këtë rast nëse përdoruesi nuk pyeti për kontakt).

ÇKA NUK BËN
• Mos jep vetëm email për pyetje navigimi ose produkti.
• Mos hamendëso çmime, politika apo funksione që nuk janë në njohuri.
• Mos përgjigju vulgaritet/spam — një fjali refuzimi, pa kontakt.

${KETUJEMI_PLATFORM_KNOWLEDGE}`;
}

function clampSupportReply(text: string, lastUser: string, lang: UiLang): string {
  const allowContact =
    supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser);

  if (allowContact) return text;

  const lower = text.toLowerCase();
  if (
    lower.includes(SUPPORT_EMAIL) ||
    lower.includes("info@ketujemi.com") ||
    text.includes(SUPPORT_PHONE)
  ) {
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
    if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
      return escalateToEmailReply(lang);
    }
    return invalidSupportQuestionReply(lang);
  }

  const client = getAnthropicClient();
  const trimmed = messages.slice(-12);

  const response = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: 520,
    system: `${buildSupportSystem(lang)}\n\nUser language: ${langLabel(lang)}.`,
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
    return clampSupportReply(text, lastUser, lang);
  }

  if (offlineOrBrowse) return offlineOrBrowse;
  if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
    return escalateToEmailReply(lang);
  }
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
  if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
    return escalateToEmailReply(lang);
  }
  return invalidSupportQuestionReply(lang);
}

/** @internal — sq fallback phrase for tests/docs */
export const SUPPORT_UNKNOWN_FALLBACK_SQ = UNKNOWN_FALLBACK_SQ;
