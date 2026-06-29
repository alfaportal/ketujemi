import { BRAND_BLUE } from "@/lib/brand-colors";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
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

export function shopManifestApiUrl(slugOrId: string): string {
  return `/api/shops/${encodeURIComponent(slugOrId)}/manifest.webmanifest`;
}

/** Per-shop PWA manifest + iOS home-screen meta while visitor is on the storefront. */
export function applyShopPwaMeta(input: {
  slugOrId: string;
  shopName: string;
  logoUrl?: string | null;
}): () => void {
  const manifestUrl = shopManifestApiUrl(input.slugOrId);
  const manifestLink = document.querySelector('link[rel="manifest"]');
  const prevManifest = manifestLink?.getAttribute("href") ?? null;
  const prevAppTitle =
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute("content") ?? null;
  const prevAppName =
    document.querySelector('meta[name="application-name"]')?.getAttribute("content") ?? null;
  const prevTheme =
    document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null;
  const logo = input.logoUrl?.trim();
  let prevAppleIcon: string | null = null;
  const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
  if (appleIcon) prevAppleIcon = appleIcon.getAttribute("href");

  setLink("manifest", manifestUrl);
  setMeta("name", "apple-mobile-web-app-title", input.shopName.trim() || "Dyqan");
  setMeta("name", "application-name", input.shopName.trim() || "Dyqan");
  setMeta("name", "mobile-web-app-capable", "yes");
  setMeta("name", "apple-mobile-web-app-capable", "yes");
  setMeta("name", "theme-color", BRAND_BLUE);
  if (logo && /^https?:\/\//i.test(logo)) {
    setLink("apple-touch-icon", logo);
  }

  return () => {
    if (prevManifest) setLink("manifest", prevManifest);
    else manifestLink?.remove();
    if (prevAppTitle) setMeta("name", "apple-mobile-web-app-title", prevAppTitle);
    if (prevAppName) setMeta("name", "application-name", prevAppName);
    if (prevTheme) setMeta("name", "theme-color", prevTheme);
    if (prevAppleIcon) setLink("apple-touch-icon", prevAppleIcon);
  };
}

export function isShopPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIos && isSafari;
}

export function listenForPwaInstallPrompt(
  onPrompt: (event: BeforeInstallPromptEvent) => void,
): () => void {
  const handler = (e: Event) => {
    e.preventDefault();
    onPrompt(e as BeforeInstallPromptEvent);
  };
  window.addEventListener("beforeinstallprompt", handler);
  return () => window.removeEventListener("beforeinstallprompt", handler);
}

export async function triggerPwaInstallPrompt(event: BeforeInstallPromptEvent): Promise<boolean> {
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome === "accepted";
}
