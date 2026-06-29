import type { Shop } from "@workspace/db";
import { shopPublicPath } from "./shop-slug.js";

const DEFAULT_THEME = "#15488C";
const FALLBACK_ICON = "/icons/pwa-512x512.png";

export type ShopWebManifest = {
  id: string;
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: "standalone";
  orientation: "portrait-primary";
  theme_color: string;
  background_color: string;
  lang: string;
  dir: "ltr";
  categories: string[];
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }>;
};

function absoluteIconUrl(origin: string, logoUrl: string | null | undefined): string {
  const logo = logoUrl?.trim();
  if (logo && /^https?:\/\//i.test(logo)) return logo;
  const base = origin.replace(/\/$/, "");
  return `${base}${FALLBACK_ICON}`;
}

function shortAppName(name: string): string {
  const t = name.trim();
  if (t.length <= 14) return t;
  return `${t.slice(0, 13).trim()}…`;
}

export function buildShopWebManifest(
  shop: Pick<Shop, "id" | "slug" | "shop_name" | "logo_url" | "description">,
  siteOrigin: string,
): ShopWebManifest | null {
  const path = shopPublicPath(shop.slug, shop.id);
  if (!path) return null;

  const origin = siteOrigin.replace(/\/$/, "");
  const startPath = path.endsWith("/") ? path : `${path}/`;
  const scopePath = startPath;
  const name = shop.shop_name.trim() || "Dyqan";
  const icon = absoluteIconUrl(origin, shop.logo_url);
  const startUrl = `${origin}${startPath}`;
  const scopeUrl = `${origin}${scopePath}`;
  const appId = `${origin}${path.replace(/\/$/, "")}`;

  return {
    id: appId,
    name,
    short_name: shortAppName(name),
    description: (shop.description?.trim() || `${name} — webfaqe zyrtare në KetuJemi.`).slice(0, 240),
    start_url: startUrl,
    scope: scopeUrl,
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: DEFAULT_THEME,
    background_color: "#ffffff",
    lang: "sq",
    dir: "ltr",
    categories: ["shopping", "business"],
    icons: [
      { src: icon, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: icon, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: icon, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
