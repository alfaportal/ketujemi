/** Partner assets on B2 — never auto-deleted. */
export const B2_PARTNERS_PREFIX = "partners";

/** Static site assets on B2 — never auto-deleted. */
export const B2_SITE_ASSETS_PREFIX = "site-assets";

export const B2_PROTECTED_PREFIXES = [B2_PARTNERS_PREFIX, B2_SITE_ASSETS_PREFIX] as const;

export function b2ListingsKeyPrefix(): string {
  const raw = (typeof process !== "undefined" ? process.env.B2_KEY_PREFIX?.trim() : "") || "listings";
  return raw.replace(/^\/+|\/+$/g, "");
}

/** Object key from a public B2 download URL (`B2_PUBLIC_URL_BASE`). */
export function parseB2ObjectKeyFromPublicUrl(url: string, publicBase?: string): string | null {
  const trimmed = url.trim();
  const base =
    publicBase?.trim() ||
    (typeof process !== "undefined" ? process.env.B2_PUBLIC_URL_BASE?.trim() : "") ||
    "";
  if (!trimmed || !base) return null;

  try {
    const u = new URL(trimmed);
    const b = new URL(base.replace(/\/$/, ""));
    if (u.hostname.toLowerCase() !== b.hostname.toLowerCase()) return null;

    const basePath = b.pathname.replace(/\/$/, "");
    let path = u.pathname;
    if (basePath && path.startsWith(basePath)) {
      path = path.slice(basePath.length);
    }
    const key = decodeURIComponent(path.replace(/^\//, ""));
    return key || null;
  } catch {
    return null;
  }
}

function isUnderB2Prefix(key: string, prefix: string): boolean {
  const k = key.replace(/^\/+/, "");
  return k === prefix || k.startsWith(`${prefix}/`);
}

/** `partners/` and `site-assets/` — protected from listing cleanup. */
export function isProtectedB2ObjectKey(key: string): boolean {
  const k = key.replace(/^\/+/, "");
  return B2_PROTECTED_PREFIXES.some((prefix) => isUnderB2Prefix(k, prefix));
}

/** @deprecated Use {@link isProtectedB2ObjectKey} */
export const isPermanentB2ObjectKey = isProtectedB2ObjectKey;

export function isDeletableListingB2ObjectKey(key: string): boolean {
  const k = key.replace(/^\/+/, "");
  if (isProtectedB2ObjectKey(k)) return false;
  const listingsPrefix = `${b2ListingsKeyPrefix()}/`;
  return k.startsWith(listingsPrefix);
}
