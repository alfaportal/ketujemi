import { createHash } from "node:crypto";
import {
  isProtectedCloudinaryPublicId,
  parseCloudinaryPublicIdFromUrl,
} from "../../../../lib/cloudinary-asset.js";
import { logger } from "./logger";

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

export function isCloudinaryDestroyConfigured(): boolean {
  const cloud = trimEnv("CLOUDINARY_CLOUD_NAME") || trimEnv("VITE_CLOUDINARY_CLOUD_NAME");
  return !!(cloud && trimEnv("CLOUDINARY_API_KEY") && trimEnv("CLOUDINARY_API_SECRET"));
}

function cloudName(): string {
  return trimEnv("CLOUDINARY_CLOUD_NAME") || trimEnv("VITE_CLOUDINARY_CLOUD_NAME");
}

/** Delete one image from Cloudinary. Skips protected folders (`partners/`, `site-assets/`). */
export async function destroyCloudinaryUrl(url: string): Promise<boolean> {
  if (!isCloudinaryDestroyConfigured()) return false;

  const publicId = parseCloudinaryPublicIdFromUrl(url);
  if (!publicId) return false;
  if (isProtectedCloudinaryPublicId(publicId)) {
    logger.debug({ publicId }, "skip Cloudinary destroy (protected folder)");
    return false;
  }

  const apiKey = trimEnv("CLOUDINARY_API_KEY");
  const apiSecret = trimEnv("CLOUDINARY_API_SECRET");
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName()}/image/destroy`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.warn({ publicId, status: res.status, text }, "Cloudinary destroy failed");
    return false;
  }

  return true;
}
