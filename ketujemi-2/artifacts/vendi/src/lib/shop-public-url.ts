export function normalizeShopSlug(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "");
}

/** Nxjerr slug nga URL e KetuJemi /dyqani/... (p.sh. nga fusha Website). */
export function parseKetujemiShopSlugFromUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = s.includes("://") ? new URL(s) : new URL(s.startsWith("/") ? s : `/${s}`, "https://ketujemi.com");
    const host = u.hostname.replace(/^www\./i, "");
    if (!host.endsWith("ketujemi.com")) return null;
    const m = u.pathname.match(/^\/dyqani\/([^/?#]+)/i);
    if (!m?.[1]) return null;
    const slug = normalizeShopSlug(decodeURIComponent(m[1].replace(/\+/g, " ")));
    return slug || null;
  } catch {
    const m = s.match(/\/dyqani\/([^/?#\s]+)/i);
    if (!m?.[1]) return null;
    const slug = normalizeShopSlug(decodeURIComponent(m[1]));
    return slug || null;
  }
}

/** Public path for a shop storefront, e.g. `/dyqani/mobileria-rinia`. */
export function shopPublicPath(input: {
  slug?: string | null;
  shopId?: number | null;
  publicPath?: string | null;
}): string | null {
  const stored = input.publicPath?.trim();
  if (stored) return stored.startsWith("/") ? stored : `/${stored}`;

  const slug = normalizeShopSlug(input.slug ?? "");
  if (slug) return `/dyqani/${slug}`;

  if (input.shopId != null && input.shopId > 0) return `/dyqani/${input.shopId}`;
  return null;
}

export function shopPublicAbsoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${normalized}`;
  }
  return `https://ketujemi.com${normalized}`;
}

/** Copy text — clipboard API with textarea fallback (mobile Safari). */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
