import type { UiLang } from "./claude-client";
import { MARKETPLACE_CATEGORY_HINT } from "./support-category-catalog";

/** Fixed reply — never escalate to email. */
export const INVALID_SUPPORT_REPLY: Record<UiLang, string> = {
  sq: "Ju lutemi shkruani një pyetje të vlefshme për të marrë ndihmë.",
  mk: "Ве молиме напишете валидно прашање за да добиете помош.",
  me: "Molimo vas napišite valjano pitanje da dobijete pomoć.",
  en: "Please write a valid question to get help.",
  fr: "Veuillez poser une question valide pour obtenir de l'aide.",
};

export function invalidSupportQuestionReply(lang: UiLang): string {
  return INVALID_SUPPORT_REPLY[lang] ?? INVALID_SUPPORT_REPLY.sq;
}

export const MAX_SUPPORT_USER_QUESTIONS = 3;

const QUESTION_LIMIT_REPLY: Record<UiLang, string> = {
  sq: "Keni arritur limitin prej 3 pyetjesh në këtë bisedë. Për më shumë ndihmë, na shkruani në support@ketujemi.com ose telefononi +383 43 555 294.",
  mk: "Достигнавте лимит од 3 прашања. За повеќе помош: support@ketujemi.com или +383 43 555 294.",
  me: "Dostigli ste limit od 3 pitanja. Za više pomoći: support@ketujemi.com ili +383 43 555 294.",
  en: "You have reached the limit of 3 questions in this chat. For more help: support@ketujemi.com or +383 43 555 294.",
  fr: "Vous avez atteint la limite de 3 questions. Pour plus d'aide : support@ketujemi.com ou +383 43 555 294.",
};

export function supportChatQuestionLimitReply(lang: UiLang): string {
  return QUESTION_LIMIT_REPLY[lang] ?? QUESTION_LIMIT_REPLY.sq;
}

export function countSupportUserMessages(messages: { role: string }[]): number {
  return messages.filter((m) => m.role === "user").length;
}

/** Vulgar / abusive / violent phrasing (SQ/AL + EN). Word boundaries to limit false positives. */
const ABUSIVE_PATTERNS: RegExp[] = [
  /\bqifsha\b/i,
  /\bqifshe\b/i,
  /\bthi\s*h(e|ën|en)\b/i,
  /\bqume(r|rë|re)\b/i,
  /\b(mut|idiot|prostitut|cuck)\b/i,
  /\bkurv(e|ën|a|at)\b/i,
  /\b(go\s*fu|f\s*u\s*c\s*k|sh[i1]t|cunt)\b/i,
  /\b(dick|cock|suck\s+my|kill\s*(yo)?u)\b/i,
  /\b(rracist|nacist|teror|terror)\b/i,
  /\b(vras|vrasë|mbyt|mbytë|go\s*(die|vde|vdek))\b/i,
];

/**
 * Only coherent questions that look related to KetuJemi / marketplace may get the email handoff.
 */
export function supportsEmailEscalation(content: string): boolean {
  const t = content.trim().normalize("NFD").replace(/\p{M}/gu, "");
  if (t.length < 15) return false;

  const letters = t.match(/\p{L}/gu)?.length ?? 0;
  if (letters < 10) return false;

  const noSpaces = t.replace(/\s/g, "");
  if (noSpaces.length >= 8 && /^(.)\1{7,}$/u.test(noSpaces)) return false;

  const punctRatio =
    noSpaces.replace(/[\p{L}]/gu, "").length / Math.max(1, noSpaces.length);
  if (punctRatio > 0.42) return false;

  return (
    /ketujemi|ketu\s*jemi|njoftim|njoftime|list(a|e)\b|postim|posto|hyr|hyrje|dal|logout|profil|rifill|rifillo|sms|vonage|llogari|llogaria|fjalkalim|fjalekalim|verifik|regjistr|rregjistr|email|vip|biznes|top\b|stripe|moderat|moderim|spam|raport|ankes|njoft|shpall|çmim|cmim|blerje|rimburs|telefon|kontakt|ketu\b|faqe|website|platform/i.test(
      t,
    ) || isMarketplaceBrowseQuestion(t)
  );
}

/** Phone / call / contact channel — always give support phone + email in chat. */
export function isSupportContactQuestion(content: string): boolean {
  const t = content.trim().normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  if (t.length < 4) return false;

  return /telefon|numër|numer|numri|phone|kontakt|thirr|call|whatsapp|viber|instagram|adres|email\s*juaj|si\s+ju\s+(kontaktoj|telefonoj)|broj\s+telefona|телефон|контакт/i.test(
    t,
  );
}

/** Product/category terms — short messages like «goma», «vetura» are valid marketplace questions. */
export const MARKETPLACE_PRODUCT_HINT =
  /goma|gomat|felne|fellne|rrot|disk|amortiz|fren|karoseri|akumulator|vajra|filtra|auto\s*pjes|auto-pjes|pjese\s+aut|pjese\s+vet|iphone|samsung|mobile|mobil|regjistr|posto|njoftim|partner|biznes|stripe|top\b|kategori|dyqan|dyqani|shitore|shop\b|store\b/i;

/** Shop directory browse — dyqanet në të gjitha kategoritë. */
export function isShopBrowseQuestion(content: string): boolean {
  const t = content.trim().normalize("NFD").replace(/\p{M}/gu, "");
  if (t.length < 3) return false;
  return /\b(dyqan|dyqani|dyqane|dyqanet|shitore|shitoret|shop|shops|store|stores|prodavnic|radnj|ducan)\b/i.test(
    t,
  );
}

export function isRecognizedMarketplaceQuery(content: string): boolean {
  const t = content.trim().normalize("NFD").replace(/\p{M}/gu, "");
  if (t.length < 2) return false;
  const stripped = t.replace(/^po\s+/i, "").trim();
  if (stripped.length < 2) return false;
  return (
    MARKETPLACE_PRODUCT_HINT.test(stripped) ||
    MARKETPLACE_PRODUCT_HINT.test(t) ||
    MARKETPLACE_CATEGORY_HINT.test(stripped) ||
    MARKETPLACE_CATEGORY_HINT.test(t)
  );
}

/** Finding/buying on the site (not account/legal) — answer in chat, do not default to email. */
export function isMarketplaceBrowseQuestion(content: string): boolean {
  const t = content.trim().normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  if (t.length < 4) return false;

  if (isRecognizedMarketplaceQuery(t)) return true;

  return /ku\s+(mund|e\s+gjej|ta\s+gjej|gjen|jan|jane|jane\s+)?|si\s+(mund|ta\s+gjej|gjen)|a\s+mund\s+ta\s+gjej|where\s+(can|do)\s+i\s+find|how\s+to\s+find|kërko|kerko|pretra|pronađ|gjej|blej|bler|shit|shpall|liber|libra|libër|knig|book|auto|makina|telefon|mobile|mobil|banes|shtëpi|shtepi|kategori|categori|elektronik|mobilje|rroba|sport|punë|pune|muzik|kafsh|njoftimet|listimet|shfleton|browse|dyqan|dyqani|shitore|shop|store/i.test(
    t,
  );
}

/**
 * Block harassment, vulgarity, and obvious nonsense (no Claude, no inbox).
 */
export function screenSupportUserMessage(raw: string): "ok" | "invalid" {
  const content = typeof raw !== "string" ? "" : raw;
  const t = content.trim();

  if (t.length < 2) return "invalid";

  const folded = t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

  if (folded.startsWith("[image") || /\b(write\s+me\s+an\s+essay|bitcoin|generate\s+code)\b/i.test(t)) {
    return "invalid";
  }

  for (const re of ABUSIVE_PATTERNS) {
    if (re.test(folded) || re.test(t)) return "invalid";
  }

  if (!/\p{L}/u.test(t) && t.replace(/\s/g, "").length >= 10) return "invalid";

  const lettersJoined = t.match(/\p{L}+/gu)?.join("") ?? "";
  if (lettersJoined.length >= 35) {
    const vowels = [...lettersJoined.normalize("NFD").replace(/\p{M}/gu, "")].filter((ch) =>
      /[aeiouyëêèéöüóòíìàáăâãąåæøœ]/i.test(ch),
    ).length;
    const vowRatio = vowels / Math.max(1, lettersJoined.length);
    const latinLen = [...lettersJoined].filter((c) => /\p{Script=Latin}/u.test(c)).length;
    if (latinLen > 15 && vowRatio < 0.06) return "invalid";
  }

  const noWS = folded.replace(/\s/g, "");
  if (noWS.length >= 9 && /^(.)\1+$/.test(noWS)) return "invalid";

  return "ok";
}

export function getLastUserMessage(messages: { role: string; content: string }[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user" && typeof messages[i].content === "string") {
      return messages[i].content;
    }
  }
  return "";
}
