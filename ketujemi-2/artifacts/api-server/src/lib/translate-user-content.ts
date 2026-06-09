import { createHash } from "node:crypto";
import {
  claudeJsonCompletion,
  isClaudeConfigured,
  langLabel,
  type UiLang,
} from "./claude-client.js";

const cache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 5000;
const BATCH_SIZE = 15;

/** Always attempt translation when Claude is available — prompt keeps text unchanged if already in target language. */
export function contentTranslationTarget(_lang: UiLang): boolean {
  return true;
}

function cacheKey(lang: UiLang, text: string): string {
  const hash = createHash("sha256").update(text).digest("hex").slice(0, 20);
  return `${lang}:${hash}`;
}

function trimCache(): void {
  if (cache.size <= MAX_CACHE_ENTRIES) return;
  const drop = Math.floor(MAX_CACHE_ENTRIES / 2);
  let i = 0;
  for (const key of cache.keys()) {
    cache.delete(key);
    if (++i >= drop) break;
  }
}

function maxTokensForTexts(texts: string[]): number {
  const chars = texts.reduce((sum, t) => sum + t.length, 0);
  return Math.min(8192, 400 + Math.ceil(chars * 1.2));
}

async function translateChunk(texts: string[], targetLang: UiLang): Promise<string[]> {
  if (texts.length === 0) return [];

  const target = langLabel(targetLang);
  const payload = texts.map((text, id) => ({ id, text }));
  try {
    const result = await claudeJsonCompletion<{ translations: { id: number; text: string }[] }>({
      system: [
        `You translate user-written marketplace content into ${target}.`,
        "Source text may be Albanian or another language.",
        'Return ONLY valid JSON: {"translations":[{"id":0,"text":"..."},...]}.',
        "Preserve meaning, tone, and paragraph breaks (use \\n in JSON strings).",
        "Keep brand names, model numbers, URLs, phone numbers, and city names unchanged.",
        `If a string is already fully in ${target}, return it unchanged.`,
        "Do not add commentary or notes.",
      ].join(" "),
      user: JSON.stringify(payload),
      maxTokens: maxTokensForTexts(texts),
    });

    if (!result?.translations?.length) return texts;

    const byId = new Map(result.translations.map((row) => [row.id, row.text.trim()]));
    return texts.map((text, id) => byId.get(id) || text);
  } catch {
    return texts;
  }
}

/** Translate parallel user strings; empty strings are returned as-is without API calls. */
export async function translateUserTexts(
  texts: Array<string | null | undefined>,
  targetLang: UiLang,
): Promise<string[]> {
  const normalized = texts.map((t) => (typeof t === "string" ? t.trim() : ""));

  if (!contentTranslationTarget(targetLang) || !isClaudeConfigured()) {
    return normalized;
  }

  const results = [...normalized];
  const pending: { index: number; text: string }[] = [];

  for (let i = 0; i < normalized.length; i++) {
    const text = normalized[i];
    if (!text) continue;
    const cached = cache.get(cacheKey(targetLang, text));
    if (cached !== undefined) {
      results[i] = cached;
    } else {
      pending.push({ index: i, text });
    }
  }

  for (let offset = 0; offset < pending.length; offset += BATCH_SIZE) {
    const batch = pending.slice(offset, offset + BATCH_SIZE);
    const translated = await translateChunk(
      batch.map((row) => row.text),
      targetLang,
    );
    for (let j = 0; j < batch.length; j++) {
      const { index, text } = batch[j];
      const out = translated[j] || text;
      results[index] = out;
      cache.set(cacheKey(targetLang, text), out);
    }
  }

  trimCache();
  return results;
}
