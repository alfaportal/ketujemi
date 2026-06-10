import { CANONICAL_SITE_ORIGIN } from "@/lib/category-seo";

export type PageMeta = {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalPath?: string;
  ogType?: string;
  robots?: string;
};

function setMeta(attr: "name" | "property", key: string, content: string | undefined) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string | undefined) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function applyPageMeta(meta: PageMeta) {
  document.title = meta.title;
  setMeta("name", "description", meta.description);
  setMeta("property", "og:title", meta.ogTitle ?? meta.title);
  setMeta("property", "og:description", meta.ogDescription ?? meta.description);
  setMeta("property", "og:image", meta.ogImage);
  setMeta("property", "og:type", meta.ogType ?? "website");
  if (meta.canonicalPath) {
    const url = meta.canonicalPath.startsWith("http")
      ? meta.canonicalPath
      : `${CANONICAL_SITE_ORIGIN}${meta.canonicalPath}`;
    setLink("canonical", url);
    setMeta("property", "og:url", url);
  }
  if (meta.robots) setMeta("name", "robots", meta.robots);
}

export function truncateMetaDescription(text: string, max = 150): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}
