/** Cloudinary folder for partner logos/banners — never auto-deleted. */
export const CLOUDINARY_PARTNERS_FOLDER = "partners";

/** Cloudinary folder for listing photos — deleted with listing / after lifetime. */
export const CLOUDINARY_LISTINGS_FOLDER = "listings";

const TRANSFORMATION_SEGMENT = /^[a-z0-9]{1,4}_[a-z0-9]/i;

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

/** Partner assets in `partners/` or tagged permanent must not be removed by listing cleanup. */
export function isPermanentCloudinaryPublicId(publicId: string): boolean {
  const id = publicId.trim();
  return id === CLOUDINARY_PARTNERS_FOLDER || id.startsWith(`${CLOUDINARY_PARTNERS_FOLDER}/`);
}

export function isPermanentCloudinaryUrl(url: string): boolean {
  const publicId = parseCloudinaryPublicIdFromUrl(url);
  return publicId != null && isPermanentCloudinaryPublicId(publicId);
}
