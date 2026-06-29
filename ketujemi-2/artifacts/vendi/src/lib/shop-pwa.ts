import { BRAND_BLUE } from "@/lib/brand-colors";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const SHOP_PATH_RE = /^\/dyqani\/([^/?#]+)/i;
const SHOP_INSTALL_EVENT = "kj-shop-install-prompt";

let capturedInstallPrompt: BeforeInstallPromptEvent | null = null;
let shopInstallListenerAttached = false;

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

export function parseShopSlugFromPath(pathname?: string): string | null {
  const path = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const m = path.match(SHOP_PATH_RE);
  if (!m?.[1]) return null;
  try {
    return decodeURIComponent(m[1].replace(/\+/g, " "));
  } catch {
    return m[1];
  }
}

export function isShopStorefrontPath(pathname?: string): boolean {
  return parseShopSlugFromPath(pathname) != null;
}

export function shopManifestApiUrl(slugOrId: string): string {
  return `/api/shops/${encodeURIComponent(slugOrId)}/manifest.webmanifest`;
}

function attachShopInstallPromptCapture(): void {
  if (shopInstallListenerAttached || typeof window === "undefined") return;
  shopInstallListenerAttached = true;
  window.addEventListener(
    "beforeinstallprompt",
    (e) => {
      if (!isShopStorefrontPath()) return;
      e.preventDefault();
      capturedInstallPrompt = e as BeforeInstallPromptEvent;
      window.dispatchEvent(new CustomEvent(SHOP_INSTALL_EVENT));
    },
    { capture: true },
  );
}

function replaceManifestLink(slugOrId: string): void {
  document.querySelectorAll('link[rel="manifest"]').forEach((el) => el.remove());
  setLink("manifest", shopManifestApiUrl(slugOrId));
}

async function applyManifestDocumentMeta(slugOrId: string, shopName?: string, logoUrl?: string | null): Promise<void> {
  try {
    const res = await fetch(shopManifestApiUrl(slugOrId), { credentials: "same-origin", cache: "no-store" });
    if (res.ok) {
      const manifest = (await res.json()) as {
        name?: string;
        short_name?: string;
        icons?: Array<{ src?: string }>;
      };
      const name = manifest.name?.trim() || shopName?.trim() || "Dyqan";
      document.title = name;
      setMeta("name", "apple-mobile-web-app-title", manifest.short_name?.trim() || name);
      setMeta("name", "application-name", manifest.short_name?.trim() || name);
      const icon = manifest.icons?.[0]?.src?.trim();
      if (icon) setLink("apple-touch-icon", icon);
    } else if (shopName?.trim()) {
      document.title = shopName.trim();
      setMeta("name", "apple-mobile-web-app-title", shopName.trim());
      setMeta("name", "application-name", shopName.trim());
    }
  } catch {
    if (shopName?.trim()) {
      document.title = shopName.trim();
      setMeta("name", "apple-mobile-web-app-title", shopName.trim());
    }
  }

  const logo = logoUrl?.trim();
  if (logo && /^https?:\/\//i.test(logo)) {
    setLink("apple-touch-icon", logo);
  }
}

/** Swap to per-shop manifest immediately (also called from main.tsx after boot script). */
export function bootShopPwaFromPath(): void {
  if (typeof window === "undefined") return;
  const slugOrId = parseShopSlugFromPath();
  if (!slugOrId) return;

  attachShopInstallPromptCapture();
  replaceManifestLink(slugOrId);
  void applyManifestDocumentMeta(slugOrId);
}

export function getShopInstallPrompt(): BeforeInstallPromptEvent | null {
  return capturedInstallPrompt;
}

/** Per-shop PWA manifest + iOS home-screen meta while visitor is on the storefront. */
export function applyShopPwaMeta(input: {
  slugOrId: string;
  shopName: string;
  logoUrl?: string | null;
}): () => void {
  attachShopInstallPromptCapture();

  const slugOrId = input.slugOrId.trim();
  const manifestLink = document.querySelector('link[rel="manifest"]');
  const prevManifest = manifestLink?.getAttribute("href") ?? null;
  const prevAppTitle =
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute("content") ?? null;
  const prevAppName =
    document.querySelector('meta[name="application-name"]')?.getAttribute("content") ?? null;
  const prevTheme =
    document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null;
  const prevTitle = document.title;
  const logo = input.logoUrl?.trim();
  let prevAppleIcon: string | null = null;
  const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
  if (appleIcon) prevAppleIcon = appleIcon.getAttribute("href");

  replaceManifestLink(slugOrId);
  setMeta("name", "apple-mobile-web-app-title", input.shopName.trim() || "Dyqan");
  setMeta("name", "application-name", input.shopName.trim() || "Dyqan");
  setMeta("name", "mobile-web-app-capable", "yes");
  setMeta("name", "apple-mobile-web-app-capable", "yes");
  setMeta("name", "theme-color", BRAND_BLUE);
  if (logo && /^https?:\/\//i.test(logo)) {
    setLink("apple-touch-icon", logo);
  }
  document.title = input.shopName.trim() || "Dyqan";
  void applyManifestDocumentMeta(slugOrId, input.shopName, input.logoUrl);

  return () => {
    capturedInstallPrompt = null;
    if (prevManifest) setLink("manifest", prevManifest);
    else manifestLink?.remove();
    if (prevAppTitle) setMeta("name", "apple-mobile-web-app-title", prevAppTitle);
    if (prevAppName) setMeta("name", "application-name", prevAppName);
    if (prevTheme) setMeta("name", "theme-color", prevTheme);
    if (prevTitle) document.title = prevTitle;
    if (prevAppleIcon) setLink("apple-touch-icon", prevAppleIcon);
  };
}

export function isShopPwaStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (!standalone) return false;
  return isShopStorefrontPath();
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
  if (capturedInstallPrompt) onPrompt(capturedInstallPrompt);

  const onCaptured = () => {
    if (capturedInstallPrompt) onPrompt(capturedInstallPrompt);
  };

  const handler = (e: Event) => {
    if (!isShopStorefrontPath()) return;
    e.preventDefault();
    capturedInstallPrompt = e as BeforeInstallPromptEvent;
    onPrompt(capturedInstallPrompt);
  };

  window.addEventListener(SHOP_INSTALL_EVENT, onCaptured);
  window.addEventListener("beforeinstallprompt", handler);
  return () => {
    window.removeEventListener(SHOP_INSTALL_EVENT, onCaptured);
    window.removeEventListener("beforeinstallprompt", handler);
  };
}

export async function triggerPwaInstallPrompt(event: BeforeInstallPromptEvent): Promise<boolean> {
  await event.prompt();
  const choice = await event.userChoice;
  if (choice.outcome === "accepted") capturedInstallPrompt = null;
  return choice.outcome === "accepted";
}
