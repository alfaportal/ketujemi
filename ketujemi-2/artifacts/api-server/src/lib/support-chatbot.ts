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
  supportUnknownQueryReply,
  tryBrowseOrFaqAnswer,
  tryPrioritySupportAnswer,
} from "./support-chat-faq-offline";
import { buildSupportBrowseLink } from "./support-chat-browse-link";
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

function buildSupportSystem(siteLang: UiLang, replyLang: UiLang): string {
  const fallback = supportFallbackLine(replyLang);

  return `You are the official KetuJemi.com support assistant — full encyclopedia of the platform (categories, markets, registration, posting, payments, security).

LANGUAGE (mandatory)
• You are an assistant for KetuJemi.com. Always respond in the same language the user writes in.
• If the user's message is short or ambiguous, respond in the site language.
• Current site language: ${langLabel(siteLang)} (locale: ${siteLang}).
• Reply language for this turn: ${langLabel(replyLang)} (locale: ${replyLang}).
• Supported locales: Albanian (sq), Macedonian (mk), Montenegrin (me), English (en), French (fr).
• Match the user's language from their latest message (including voice input).
• Emrat e UI si në faqe: «Posto Falas», «Njoftimet», «Hyr», «Muzikë & Hobby», «Profili».

STILI (obligativ — bisedë chat, JO artikull)
• Përgjigje **të shkurtra**: max **2–3 fjali** ose max **3 hapa** (një rresht secili).
• Mos përdor titull markdown (#, ##), emoji të shumta, ose listë të gjatë kategorish.
• Mos listo të gjitha nën-kategoritë — vetëm ajo që pyet përdoruesi.
• Lexo mesazhin E FUNDIT dhe përgjigju vetëm atij.
• Mos thuaj «shiko faqen kryesore» pa emër kategori ose pa link.
• «Regjistrohu» ≠ «Posto Falas» — shpjego shkurt kur nevojitet.
• Përdor vetëm fakte nga enciklopedia; mos shpik politika/API.

LINKA DIREKTE (prioritet i lartë — kur pyet «ku ta gjej / ku janë mobilet / telefon»)
• Përgjigju **vetëm me path-in** e kategorisë (një rresht), p.sh. `/shpallje/telefona` — bëhet klikueshëm në chat.
• Mos shto tekst të gjatë para/pas linkut kur pyetja është «ku ta gjej X».
• Për model specifik (iPhone 15): `/listings?search=iPhone+15`
• Regjistrim: `/login` · Postim: `/listings/new` · Dyqane: `/dyqanet`

RREGULLA PLATFORMË (duhet t’i dish dhe t’i përmendësh kur ka lidhje)
• **Max 10 foto** për shpallje — jo më shumë.
• **Duplikate:** i njëjti send **jo 2 herë brenda 1 muaji** — Edito njoftimin e vjetër.
• **Kategoria e saktë:** çdo shpallje vetëm në kategorinë ku i përket — mos i përziej produktet.
• **Ndaluar menjëherë:** armë, droga, alkool, duhan/vape, kripto, baste, MLM, erotik, fake — postimi refuzohet automatikisht.
• **Kategoria ≠ vendndodhja** — mos u ngatërro me qytetin/shtetin e postimit.

SI TË PËRGJIGJESH (prioritet — gjithmonë shkurt)
1) Produkt / ku ta gjej → **link direkt** `/shpallje/{slug}` ose kërkim `/listings?search=…`
2) Regjistrim → `/login` → Regjistrohu (email, Google, Facebook ose TikTok), max 2 hapa.
3) Postim → `/listings/new` → kategori e saktë → max 10 foto → publiko, max 2 hapa.
4) Tregje → emri i tregut (11 total), 1 fjali.
5) Pagesa / partner / siguri → 2–3 fjali, pa listë të gjatë.
6) Kontakt platforme → ${SUPPORT_EMAIL}, ${SUPPORT_PHONE}.
7) Nuk e di → «${fallback}»

NDALON
• Përgjigje të vagë pa kategori dhe pa link/hap.
• Email/telefon për navigim produkti (vetëm për mbështetje platforme).
• Zbulim i sekreteve teknike (API keys, env, kode serveri).
• Të thuash «foto të pakufizuara» — limiti është **10 foto**.

${KETUJEMI_PLATFORM_KNOWLEDGE}`;
}

const GENERIC_BROWSE_MARKERS =
  /zgjidh\s+kategorinë\s+që\s+përshtatet|shih\s+telefona,\s*vetura|hap\s+faqen\s+kryesore\s*→\s*zgjidh\s+kategorinë|shiko\s+faqen\s+kryesore|kontrollo\s+homepage|check\s+the\s+homepage/i;

function hasSubstantiveSupportContent(text: string): boolean {
  return /posto\s*falas|kategori|njoftim|→|regjistro|vetur|telefon|muzik|auto\s*pjes|goma|felne|rrot|profil|bler|shit|\d\)|hapni|faqja\s+kryesore/i.test(
    text,
  );
}

function stripContactLines(text: string): string {
  const phoneEsc = SUPPORT_PHONE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .split("\n")
    .filter(
      (line) =>
        !new RegExp(SUPPORT_EMAIL, "i").test(line) &&
        !/support@ketujemi\.com|info@ketujemi\.com/i.test(line) &&
        !new RegExp(phoneEsc).test(line),
    )
    .join("\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function compactSupportReply(text: string): string {
  let t = text
    .replace(/^#{1,6}\s*.+$/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const sentences = t.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (sentences.length > 4) {
    t = sentences.slice(0, 3).join(" ");
  }
  if (t.length > 380) {
    const cut = t.slice(0, 377);
    t = `${cut.replace(/\s+\S*$/, "").trim()}…`;
  }
  return t;
}

function clampSupportReply(
  text: string,
  lastUser: string,
  replyLang: UiLang,
  messages: ChatMessage[],
  langHint: UiLang,
): string {
  const allowContact =
    supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser);

  if (allowContact) return compactSupportReply(text);

  const lower = text.toLowerCase();
  const hasContact =
    lower.includes(SUPPORT_EMAIL) ||
    lower.includes("support@ketujemi.com") ||
    lower.includes("info@ketujemi.com") ||
    text.includes(SUPPORT_PHONE);

  if (hasContact) {
    if (hasSubstantiveSupportContent(text)) {
      const stripped = stripContactLines(text);
      if (stripped.length >= 40) return compactSupportReply(stripped);
    } else {
      return invalidSupportQuestionReply(replyLang);
    }
  }

  if (GENERIC_BROWSE_MARKERS.test(text)) {
    const priority = tryPrioritySupportAnswer(
      [{ role: "user", content: lastUser }],
      langHint,
    );
    if (priority) return compactSupportReply(priority);
  }

  return compactSupportReply(text);
}

function resolveReplyLang(messages: ChatMessage[], siteLang: UiLang): UiLang {
  return inferSupportLang(getLastUserMessage(messages), siteLang);
}

export async function runSupportChat(
  messages: ChatMessage[],
  siteLang: UiLang = "sq",
): Promise<string> {
  const lastUser = getLastUserMessage(messages);
  const replyLang = resolveReplyLang(messages, siteLang);

  if (screenSupportUserMessage(lastUser) === "invalid") {
    return invalidSupportQuestionReply(replyLang);
  }

  if (isSupportContactQuestion(lastUser)) {
    const contactReply = tryPrioritySupportAnswer(
      [{ role: "user", content: lastUser }],
      siteLang,
    );
    if (contactReply) return compactSupportReply(contactReply);
  }

  const browseLink = buildSupportBrowseLink(messages);
  if (browseLink) return browseLink;

  if (!isClaudeConfigured()) {
    const offlineOrBrowse = tryBrowseOrFaqAnswer(messages, siteLang);
    if (offlineOrBrowse) return compactSupportReply(offlineOrBrowse);
    if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
      return escalateToEmailReply(replyLang);
    }
    return supportUnknownQueryReply(messages, siteLang);
  }

  const client = getAnthropicClient();
  const trimmed = messages.slice(-12);

  const response = await client.messages.create({
    model: getClaudeModel(),
    max_tokens: 256,
    system: `${buildSupportSystem(siteLang, replyLang)}\n\nKeep the reply short (max 3 sentences). User question: «${lastUser.slice(0, 500)}»`,
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
    return clampSupportReply(text, lastUser, replyLang, messages, siteLang);
  }

  const offlineOrBrowse = tryBrowseOrFaqAnswer(messages, siteLang);
  if (offlineOrBrowse) return compactSupportReply(offlineOrBrowse);
  if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
    return escalateToEmailReply(replyLang);
  }
  return supportUnknownQueryReply(messages, siteLang);
}

export function supportChatFallbackReply(
  messages: ChatMessage[],
  siteLang: UiLang = "sq",
): string {
  const lastUser = getLastUserMessage(messages);
  const replyLang = resolveReplyLang(messages, siteLang);

  if (screenSupportUserMessage(lastUser) === "invalid") {
    return invalidSupportQuestionReply(replyLang);
  }

  const browseLink = buildSupportBrowseLink(messages);
  if (browseLink) return browseLink;

  const priorityAnswer = tryPrioritySupportAnswer(messages, siteLang);
  if (priorityAnswer) return compactSupportReply(priorityAnswer);

  const offlineOrBrowse = tryBrowseOrFaqAnswer(messages, siteLang);
  if (offlineOrBrowse) return compactSupportReply(offlineOrBrowse);
  if (supportsEmailEscalation(lastUser) || isSupportContactQuestion(lastUser)) {
    return escalateToEmailReply(replyLang);
  }
  return supportUnknownQueryReply(messages, siteLang);
}
