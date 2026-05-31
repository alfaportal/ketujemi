/** True for absolute http(s), mailto, tel links — must use <a>, not SPA router. */
export function isExternalHref(href: string): boolean {
  const t = href.trim();
  if (!t) return false;
  return /^https?:\/\//i.test(t) || /^mailto:/i.test(t) || /^tel:/i.test(t);
}

/** In-app routes: leading slash, not protocol-relative (//host). */
export function isInternalAppHref(href: string): boolean {
  const t = href.trim();
  if (!t || isExternalHref(t)) return false;
  return t.startsWith("/") && !t.startsWith("//");
}

/** Bare domains (www.example.com/path) → https://… for safe <a href>. */
export function normalizeBareDomainHref(href: string): string {
  const t = href.trim();
  if (!t || isExternalHref(t) || isInternalAppHref(t)) return t;
  if (/^www\./i.test(t) || /^[a-z0-9][-a-z0-9]*\.[a-z]{2,}/i.test(t)) {
    return `https://${t}`;
  }
  return t;
}
