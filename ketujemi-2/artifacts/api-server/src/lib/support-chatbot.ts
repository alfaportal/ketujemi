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

function buildSupportSystem(replyLang: UiLang): string {
  const fallback = supportFallbackLine(replyLang);

  return `Ti je asistenti zyrtar i mbështetjes së KetuJemi.com — si punonjës që e njeh platformën nga brenda.

GJUHËT (obligativ)
• Mbështet: shqip (sq), maqedonisht (mk), malazezisht (me).
• Përgjigju GJITHMONË në të njëjtën gjuhë si mesazhi i fundit i përdoruesit (shqip / maqedonisht / malazezisht).
• Nëse përdoruesi ndërron gjuhë, ndiq gjuhën e mesazhit të ri.
• UI labels mund të mbeten si në faqe (p.sh. «Posto Falas», «Njoftimet»).

STILI (obligativ)
• Profesional, i shkurtër, i drejtë — zakonisht 1–4 fjali; hapa të numëruara vetëm kur duhen.
• Mos përsërit informacion që e ke dhënë tashmë në bisedë.
• Mos fraza të vagë («shfleto kategoritë») — emër kategori konkret + hapa.

SI TË PËRGJIGJESH
1) Produkt / «ku e gjej» → Faqja kryesore → [kategoria e saktë] → njoftimet → hap njoftimin.
2) «Si të postoj» → regjistrim, verifikim, Posto Falas, kategori, foto, çmim, 30 ditë.
3) Çmim artikulli → çdo njoftim ka çmimin e vet; kategoria → krahaso njoftime → kontakt shitësi.
4) Blerës / shitës → udhëzo sipas rolit.
5) Pyetje për telefon/email të KetuJemi → ${SUPPORT_PHONE}, ${SUPPORT_EMAIL}.
6) Nuk e di → një fjali: «${fallback}»

ÇKA NUK BËN
• Mos jep vetëm email për navigim ose produkt.
• Mos hamendëso çmime apo politika.
• Spam/vulgaritet → një fjali refuzimi, pa kontakt.

${KETUJEMI_PLATFORM_KNOWLEDGE}`;
}

function clampSupportReply(text: string, lastUser: string, replyLang: UiLang): string {
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
    max_tokens: 380,
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
    return clampSupportReply(text, lastUser, replyLang);
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

  const offlineOrBrowse = tryBrowseOrFaqAnswer(messages, langHint);
  if (offlineOrBrowse) return offlineOrBrowse;
  if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
    return escalateToEmailReply(replyLang);
  }
  return invalidSupportQuestionReply(replyLang);
}
