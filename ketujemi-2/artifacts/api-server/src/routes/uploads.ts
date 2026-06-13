import { Router } from "express";
import { createB2ListingImagePresignedPut, isB2UploadConfigured } from "../lib/b2-upload-presign";
import { getPlatformAdminUser } from "../lib/admin-listing-on-behalf.js";
import { resolveSessionOrAdminAuth } from "../lib/session-or-admin.js";
import { logger } from "../lib/logger";
import { randomUUID } from "node:crypto";

const router = Router();

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
]);

function safeImageFilename(raw: unknown): string {
  const s = typeof raw === "string" ? raw : "";
  const base = s.replace(/^.*[/\\]/, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base || "photo.jpg";
}

function normalizeContentType(ct: unknown): string | null {
  if (typeof ct !== "string" || !ct.trim()) return null;
  const lower = ct.trim().split(";")[0]!.toLowerCase();
  if (ALLOWED_IMAGE_TYPES.has(lower)) return lower;
  if (lower.startsWith("image/")) return lower;
  return null;
}

/** Authenticated clients receive a short-lived PUT URL + final public URL for listing photos. */
router.post("/uploads/b2-presign", async (req, res) => {
  if (!isB2UploadConfigured()) {
    res.status(503).json({
      error: "B2_NOT_CONFIGURED",
      message: "Ngarkimi i fotove nuk është konfiguruar.",
    });
    return;
  }

  const auth = await resolveSessionOrAdminAuth(req);
  if (!auth) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const contentType = normalizeContentType(req.body?.contentType);
  if (!contentType) {
    res.status(400).json({
      error: "INVALID_CONTENT_TYPE",
      message: "Lejohen vetëm foto (image/jpeg, png, webp, gif, …).",
    });
    return;
  }

  const prefix = (process.env.B2_KEY_PREFIX?.trim() || "listings").replace(/^\/+|\/+$/g, "");
  const safeName = safeImageFilename(req.body?.filename);
  let ownerId: number;
  if (auth.kind === "user") {
    ownerId = auth.user.id;
  } else {
    const adminUser = await getPlatformAdminUser();
    if (!adminUser) {
      res.status(503).json({ error: "PLATFORM_ADMIN_USER_NOT_FOUND" });
      return;
    }
    ownerId = adminUser.id;
  }
  const objectKey = `${prefix}/${ownerId}/${randomUUID()}-${safeName}`;

  try {
    const { uploadUrl, publicUrl } = await createB2ListingImagePresignedPut({
      objectKey,
      contentType,
      expiresInSeconds: 900,
    });
    res.json({ uploadUrl, publicUrl, contentType });
  } catch (err: unknown) {
    logger.error({ err }, "b2 presign failed");
    res.status(500).json({
      error: "PRESIGN_FAILED",
      message: "Gabim gjatë përgatitjes së ngarkimit. Provoni përsëri.",
    });
  }
});

export default router;
