import { createHash } from "node:crypto";
import {
  cloudinaryApiKey,
  cloudinaryApiSecret,
  cloudinaryCloudName,
  isCloudinaryAdminConfigured,
} from "./cloudinary-config.js";
import { logger } from "./logger.js";

/** Upload a remote image URL into Cloudinary (signed server upload). */
export async function uploadRemoteImageToCloudinary(
  remoteUrl: string,
  folder: string,
  publicId: string,
): Promise<string | null> {
  if (!isCloudinaryAdminConfigured()) return null;

  const cloud = cloudinaryCloudName();
  const apiKey = cloudinaryApiKey();
  const apiSecret = cloudinaryApiSecret();
  const timestamp = Math.round(Date.now() / 1000);
  const safePublicId = publicId.replace(/[^a-zA-Z0-9/_-]/g, "_").slice(0, 180);

  const signParams = `folder=${folder}&public_id=${safePublicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signParams).digest("hex");

  const body = new URLSearchParams({
    file: remoteUrl,
    folder,
    public_id: safePublicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { secure_url?: string; error?: { message?: string } };
    if (!res.ok || !json.secure_url) {
      logger.warn({ status: res.status, err: json.error?.message }, "cloudinary remote upload failed");
      return null;
    }
    return json.secure_url;
  } catch (err) {
    logger.warn({ err }, "cloudinary remote upload error");
    return null;
  }
}
