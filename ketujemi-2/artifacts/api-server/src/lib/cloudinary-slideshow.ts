import { createHash } from "node:crypto";
import { parseCloudinaryPublicIdFromUrl } from "../../../../lib/cloudinary-asset.js";
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
const EMPTY_REEL_BASE_PUBLIC_ID = "site-assets/empty-reel-base";
const DEMO_EMPTY_VIDEO_URL = "https://res.cloudinary.com/demo/video/upload/docs/empty.mp4";

export type ReelSlideInput = {
  imageUrl: string;
  title: string;
  priceLabel: string;
};

function signCloudinaryParams(params: Record<string, string>): string {
  const apiSecret = cloudinaryApiSecret();
  const sorted = Object.keys(params).sort();
  const toSign = `${sorted.map((k) => `${k}=${params[k]}`).join("&")}${apiSecret}`;
  return createHash("sha1").update(toSign).digest("hex");
}

function reelEmptyBasePublicId(): string {
  return process.env.CLOUDINARY_REEL_EMPTY_BASE?.trim() || EMPTY_REEL_BASE_PUBLIC_ID;
}

function layerPublicId(publicId: string): string {
  return publicId.replace(/\//g, ":");
}

async function fetchCloudinaryVideoResource(
  publicId: string,
): Promise<{ bytes?: number } | null> {
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

async function ensureEmptyReelBaseVideo(): Promise<boolean> {
  const publicId = reelEmptyBasePublicId();
  const existing = await fetchCloudinaryVideoResource(publicId);
  if (existing?.bytes && existing.bytes > 100) {
    return true;
  }

  const cloud = cloudinaryCloudName();
  const uploadPreset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
  if (uploadPreset) {
    const unsignedBody = new URLSearchParams({
      file: DEMO_EMPTY_VIDEO_URL,
      upload_preset: uploadPreset,
      public_id: publicId,
    });
    const unsignedRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/video/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: unsignedBody,
    });
    if (unsignedRes.ok) {
      return true;
    }
  }

  const timestamp = String(Math.round(Date.now() / 1000));
  const signParams: Record<string, string> = {
    public_id: publicId,
    overwrite: "true",
    timestamp,
  };
  const signature = signCloudinaryParams(signParams);
  const body = new URLSearchParams({
    ...signParams,
    file: DEMO_EMPTY_VIDEO_URL,
    api_key: cloudinaryApiKey(),
    signature,
  });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/video/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    logger.error({ status: res.status, body: err.slice(0, 300) }, "empty reel base upload failed");
    return false;
  }
  return true;
}

function buildSpliceReelDeliveryUrl(slides: ReelSlideInput[]): string | { error: string } {
  const cloud = cloudinaryCloudName();
  const emptyBase = reelEmptyBasePublicId();
  const slideSec = (SLIDE_DURATION_MS / 1000).toFixed(1);
  const transSec = (TRANSITION_DURATION_MS / 1000).toFixed(1);
  const baseTx = `c_fill,w_${REEL_WIDTH},h_${REEL_HEIGHT}`;

  let path = `du_1.0/${baseTx}/`;

  for (const slide of slides) {
    const publicId = reelSlidePublicId(slide.imageUrl);
    if (!publicId) {
      return { error: "image_not_on_cloudinary" };
    }
    const layer = layerPublicId(publicId);
    path += `fl_splice:transition_(name_fade;du_${transSec}),l_${layer}/du_${slideSec}/${baseTx}/fl_layer_apply/`;
  }

  return `https://res.cloudinary.com/${cloud}/video/upload/${path}${emptyBase}.mp4`;
}

async function warmupReelDeliveryUrl(videoUrl: string): Promise<boolean> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const res = await fetch(videoUrl, { method: "GET", redirect: "follow" });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.includes("video")) {
        const len = Number(res.headers.get("content-length") ?? "0");
        if (len > 10_000 || attempt >= 3) {
          return true;
        }
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

export function reelSlidePublicId(imageUrl: string): string | null {
  return parseCloudinaryPublicIdFromUrl(imageUrl);
}

/**
 * Build a vertical Reel MP4 from 4–5 listing photos via Cloudinary fl_splice delivery URL.
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

  const emptyReady = await ensureEmptyReelBaseVideo();
  if (!emptyReady) {
    logger.warn("empty reel base upload failed; trying fl_splice delivery anyway");
  }

  const built = buildSpliceReelDeliveryUrl(slides);
  if (typeof built !== "string") {
    return built;
  }

  const ready = await warmupReelDeliveryUrl(built);
  if (!ready) {
    logger.warn({ videoUrl: built }, "listing reel delivery URL not ready after warmup");
    return { error: "slideshow_processing_timeout" };
  }

  const publicId = `social-reels/batch-${batchKey}`;
  logger.info({ publicId, videoUrl: built }, "listing reel video ready (fl_splice delivery)");
  return { videoUrl: built, publicId };
}
