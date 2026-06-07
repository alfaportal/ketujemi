import { createHash } from "node:crypto";
import { parseCloudinaryPublicIdFromUrl } from "../../../../lib/cloudinary-asset.js";
/** KëtuJemi brand — matches vendi `brand-colors.ts` */
const BRAND_BLUE = "#1A56A0";
const BRAND_ORANGE = "#EA580C";
import {
  cloudinaryApiKey,
  cloudinaryApiSecret,
  cloudinaryCloudName,
  isCloudinaryAdminConfigured,
} from "./cloudinary-config";
import { logger } from "./logger";

const REEL_WIDTH = 1080;
const REEL_HEIGHT = 1920;
const SLIDE_DURATION_MS = 2500;
const TRANSITION_DURATION_MS = 400;

export type ReelSlideInput = {
  imageUrl: string;
  title: string;
  priceLabel: string;
};

function rgbHex(hex: string): string {
  return hex.replace("#", "").toUpperCase();
}

/** Cloudinary l_text safe string (max length, no special layer chars). */
function cloudinaryCaptionText(text: string, maxLen = 44): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s€.\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen) || "Shpallje";
}

function slideTransformation(title: string, priceLabel: string): string {
  const titleEnc = encodeURIComponent(cloudinaryCaptionText(title));
  const priceEnc = encodeURIComponent(cloudinaryCaptionText(priceLabel, 24));
  const blue = rgbHex(BRAND_BLUE);
  const orange = rgbHex(BRAND_ORANGE);
  return [
    `c_fill,w_${REEL_WIDTH},h_${REEL_HEIGHT}`,
    `l_text:Arial_44_bold:${titleEnc},co_rgb:${blue},bo_5px_solid_rgb:${orange},g_south,y_200`,
    `l_text:Arial_36_bold:${priceEnc},co_rgb:${orange},bo_3px_solid_rgb:${blue},g_south,y_110`,
    `l_text:Arial_28_bold:KetuJemi.com,co_rgb:${blue},g_north,y_48`,
    "fl_layer_apply",
  ].join("/");
}

function signCloudinaryParams(params: Record<string, string>): string {
  const apiSecret = cloudinaryApiSecret();
  const sorted = Object.keys(params).sort();
  const toSign = `${sorted.map((k) => `${k}=${params[k]}`).join("&")}${apiSecret}`;
  return createHash("sha1").update(toSign).digest("hex");
}

async function fetchCloudinaryResource(publicId: string): Promise<{ bytes?: number } | null> {
  const cloud = cloudinaryCloudName();
  const apiKey = cloudinaryApiKey();
  const timestamp = String(Math.round(Date.now() / 1000));
  const params: Record<string, string> = { public_id: publicId, timestamp };
  const signature = signCloudinaryParams(params);
  const qs = new URLSearchParams({ ...params, api_key: apiKey, signature });
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/resources/video/upload/${encodeURIComponent(publicId)}?${qs}`,
  );
  if (!res.ok) return null;
  const json = (await res.json().catch(() => ({}))) as { bytes?: number };
  return json;
}

export function reelSlidePublicId(imageUrl: string): string | null {
  return parseCloudinaryPublicIdFromUrl(imageUrl);
}

/**
 * Build a vertical Reel MP4 from 4–5 listing photos with title + price overlays.
 * Returns HTTPS URL suitable for Instagram Reels and TikTok pull-from-URL.
 */
export async function createListingReelVideo(
  slides: ReelSlideInput[],
  batchKey: string,
): Promise<{ videoUrl: string; publicId: string } | { error: string }> {
  if (!isCloudinaryAdminConfigured()) {
    return { error: "cloudinary_not_configured" };
  }
  if (slides.length < 4 || slides.length > 5) {
    return { error: "invalid_slide_count" };
  }

  const manifestSlides: Array<{ media: string; transformation?: string }> = [];
  for (const slide of slides) {
    const publicId = reelSlidePublicId(slide.imageUrl);
    if (!publicId) {
      return { error: "image_not_on_cloudinary" };
    }
    manifestSlides.push({
      media: `i:${publicId}`,
      transformation: slideTransformation(slide.title, slide.priceLabel),
    });
  }

  const manifest = {
    w: REEL_WIDTH,
    h: REEL_HEIGHT,
    fps: 30,
    vars: { sdur: SLIDE_DURATION_MS, tdur: TRANSITION_DURATION_MS },
    slides: manifestSlides,
  };

  const cloud = cloudinaryCloudName();
  const publicId = `social-reels/batch-${batchKey}`;
  const timestamp = String(Math.round(Date.now() / 1000));
  const manifestStr = JSON.stringify(manifest);
  const params: Record<string, string> = {
    manifest_json: manifestStr,
    overwrite: "true",
    public_id: publicId,
    timestamp,
  };
  const signature = signCloudinaryParams(params);
  const body = new URLSearchParams({
    ...params,
    api_key: cloudinaryApiKey(),
    signature,
  });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/video/create_slideshow`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    secure_url?: string;
    public_id?: string;
  };

  if (!res.ok) {
    const msg = json?.error?.message ?? `HTTP ${res.status}`;
    logger.error({ status: res.status, cloudinary: json }, "listing reel slideshow create failed");
    return { error: msg };
  }

  const resolvedPublicId = json.public_id ?? publicId;
  const directUrl = `https://res.cloudinary.com/${cloud}/video/upload/${resolvedPublicId}.mp4`;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const resource = await fetchCloudinaryResource(resolvedPublicId);
    if (resource?.bytes && resource.bytes > 10_000) {
      const videoUrl = json.secure_url ?? directUrl;
      logger.info({ publicId: resolvedPublicId, bytes: resource.bytes }, "listing reel video ready");
      return { videoUrl, publicId: resolvedPublicId };
    }
    await new Promise((r) => setTimeout(r, 2500));
  }

  if (json.secure_url) {
    return { videoUrl: json.secure_url, publicId: resolvedPublicId };
  }

  return { error: "slideshow_processing_timeout" };
}
