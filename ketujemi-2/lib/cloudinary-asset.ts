/** Listing photos — auto-deleted when listing is removed or after 90 days. */
export const CLOUDINARY_LISTINGS_FOLDER = "listings";

/** Partner logos/banners — never auto-deleted. */
export const CLOUDINARY_PARTNERS_FOLDER = "partners";

/** Shop logos from /hap-shitore applications — permanent. */
export const CLOUDINARY_SHOPS_FOLDER = "shops";

/** Static site UI (banners, categories, icons) — never auto-deleted. */
export const CLOUDINARY_SITE_ASSETS_FOLDER = "site-assets";

/** Folders excluded from listing cleanup / Cloudinary destroy. */
export const CLOUDINARY_PROTECTED_FOLDERS = [
  CLOUDINARY_PARTNERS_FOLDER,
  CLOUDINARY_SHOPS_FOLDER,
  CLOUDINARY_SITE_ASSETS_FOLDER,
] as const;

const TRANSFORMATION_SEGMENT = /^[a-z0-9]{1,4}_[a-z0-9]/i;

function isUnderCloudinaryFolder(publicId: string, folder: string): boolean {
  const id = publicId.trim();
  return id === folder || id.startsWith(`${folder}/`);
}

/** Extract public_id from a Cloudinary delivery URL (no file extension). */
export function parseCloudinaryPublicIdFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (!u.hostname.includes("cloudinary.com")) return null;
    const marker = "/upload/";
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;

    const segments = u.pathname
      .slice(idx + marker.length)
      .split("/")
      .filter(Boolean);

    const assetParts: string[] = [];
    for (const seg of segments) {
      if (/^v\d+$/.test(seg)) continue;
      if (TRANSFORMATION_SEGMENT.test(seg) && !seg.includes(".")) continue;
      assetParts.push(seg);
    }

    if (assetParts.length === 0) return null;
    const last = assetParts[assetParts.length - 1]!;
    assetParts[assetParts.length - 1] = last.replace(/\.[a-z0-9]+$/i, "");
    return assetParts.join("/");
  } catch {
    return null;
  }
}

/** `partners/` and `site-assets/` — protected from any automatic deletion. */
export function isProtectedCloudinaryPublicId(publicId: string): boolean {
  const id = publicId.trim();
  return CLOUDINARY_PROTECTED_FOLDERS.some((folder) => isUnderCloudinaryFolder(id, folder));
}

export function isProtectedCloudinaryUrl(url: string): boolean {
  const publicId = parseCloudinaryPublicIdFromUrl(url);
  return publicId != null && isProtectedCloudinaryPublicId(publicId);
}

/** @deprecated Use {@link isProtectedCloudinaryPublicId} */
export const isPermanentCloudinaryPublicId = isProtectedCloudinaryPublicId;

/** @deprecated Use {@link isProtectedCloudinaryUrl} */
export const isPermanentCloudinaryUrl = isProtectedCloudinaryUrl;
