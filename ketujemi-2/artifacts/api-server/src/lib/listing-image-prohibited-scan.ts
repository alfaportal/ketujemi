import {
  detectProhibitedFromVisionText,
  type ProhibitedListingHit,
} from "../../../../lib/listing-prohibited-content.js";
import { splitListingImageUrls } from "../../../../lib/special-listing-categories.js";
import { claudeVisionJsonCompletion, claudeVisionJsonCompletionFromBase64, isClaudeConfigured } from "./claude-client.js";
import {
  detectImageLabels,
  formatVisionDetectResult,
  isGoogleVisionConfigured,
  type GoogleVisionDetectResult,
} from "./google-vision-client.js";
import { logger } from "./logger.js";

const IMAGE_FETCH_TIMEOUT_MS = 12_000;
const MAX_IMAGE_BYTES = 5_000_000;
const MAX_PHOTOS_TO_SCAN = 5;

const PROHIBITED_IMAGE_VISION_SYSTEM = `You are a strict safety moderator for KetuJemi.com marketplace.
Reply with ONLY JSON: {"prohibited":boolean,"label":"weapons|ammunition|tobacco|alcohol|drugs|vape|gambling|erotic|counterfeit|none","reason":"string"}
- prohibited true when the photo clearly shows: weapons, guns, ammunition, drugs, cigarettes, tobacco, vape/nicotine products, alcohol bottles/cans, beer, wine, spirits.
- prohibited false for normal legal used goods (phones, furniture, cars, clothes, tools, kitchen knives, etc.).
- reason in Albanian when prohibited; empty string when not prohibited.`;

function visionTextFromDetect(result: GoogleVisionDetectResult): string {
  const labels = result.labels.map((l) => l.description).join(" ");
  const objects = result.objects.map((o) => o.name).join(" ");
  return `${labels} ${objects} ${formatVisionDetectResult(result)}`.trim();
}

function hitFromVisionDetect(result: GoogleVisionDetectResult): ProhibitedListingHit | null {
  return detectProhibitedFromVisionText(visionTextFromDetect(result));
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100 || buf.length > MAX_IMAGE_BYTES) return null;
    return buf.toString("base64");
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function scanWithClaudeUrls(urls: string[]): Promise<ProhibitedListingHit | null> {
  if (!isClaudeConfigured() || urls.length === 0) return null;
  const parsed = await claudeVisionJsonCompletion<{
    prohibited?: boolean;
    label?: string;
    reason?: string;
  }>({
    system: PROHIBITED_IMAGE_VISION_SYSTEM,
    userText: "Does this listing photo show prohibited goods (weapons, tobacco, alcohol, drugs)?",
    imageUrls: urls.slice(0, MAX_PHOTOS_TO_SCAN),
    maxTokens: 256,
  });
  if (!parsed?.prohibited) return null;
  const label = typeof parsed.label === "string" && parsed.label !== "none" ? parsed.label : "vision";
  const reason =
    typeof parsed.reason === "string" && parsed.reason.trim()
      ? parsed.reason.trim()
      : "Ky lloj produkti nuk lejohet në KetuJemi.";
  return { code: "PROHIBITED_CONTENT", reason, label };
}

async function scanWithClaudeBase64(
  imageBase64: string,
  mediaType: string,
): Promise<ProhibitedListingHit | null> {
  if (!isClaudeConfigured()) return null;
  const parsed = await claudeVisionJsonCompletionFromBase64<{
    prohibited?: boolean;
    label?: string;
    reason?: string;
  }>({
    system: PROHIBITED_IMAGE_VISION_SYSTEM,
    userText: "Does this listing photo show prohibited goods (weapons, tobacco, alcohol, drugs)?",
    imageBase64,
    mediaType,
    maxTokens: 256,
  });
  if (!parsed?.prohibited) return null;
  const label = typeof parsed.label === "string" && parsed.label !== "none" ? parsed.label : "vision";
  const reason =
    typeof parsed.reason === "string" && parsed.reason.trim()
      ? parsed.reason.trim()
      : "Ky lloj produkti nuk lejohet në KetuJemi.";
  return { code: "PROHIBITED_CONTENT", reason, label };
}

/** Scan one base64 image — Google labels first, Claude fallback. */
export async function scanImageBase64ForProhibitedContent(
  imageBase64: string,
  mediaType = "image/jpeg",
): Promise<ProhibitedListingHit | null> {
  const data = imageBase64.trim();
  if (data.length < 100) return null;

  if (isGoogleVisionConfigured()) {
    try {
      const vision = await detectImageLabels(data);
      if (vision) {
        const hit = hitFromVisionDetect(vision);
        if (hit) return hit;
      }
    } catch (err) {
      logger.warn({ err }, "prohibited-image-scan google vision failed");
    }
  }

  return scanWithClaudeBase64(data, mediaType);
}

/** Scan listing photo URLs (comma-separated) before publish. */
export async function scanListingImagesForProhibitedContent(
  imageUrl: string | null | undefined,
): Promise<ProhibitedListingHit | null> {
  const urls = splitListingImageUrls(imageUrl).slice(0, MAX_PHOTOS_TO_SCAN);
  if (urls.length === 0) return null;

  if (isGoogleVisionConfigured()) {
    for (const url of urls) {
      const base64 = await fetchImageAsBase64(url);
      if (!base64) continue;
      try {
        const vision = await detectImageLabels(base64);
        if (vision) {
          const hit = hitFromVisionDetect(vision);
          if (hit) return hit;
        }
      } catch (err) {
        logger.warn({ err, url: url.slice(0, 80) }, "prohibited-image-scan google vision url failed");
      }
    }
  }

  return scanWithClaudeUrls(urls);
}

export function isListingImageProhibitedScanConfigured(): boolean {
  return isGoogleVisionConfigured() || isClaudeConfigured();
}
