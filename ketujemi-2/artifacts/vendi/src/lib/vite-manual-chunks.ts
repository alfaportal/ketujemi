/** Rollup manualChunks — split only isolated libs; no catch-all "vendor" (causes circular chunks). */

export function viteManualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    if (id.includes("/src/lib/app-extra-i18n")) return "i18n-extra";
    if (id.includes("/src/lib/market-context")) return "market-context";
    if (id.includes("/src/lib/category-translations")) return "category-translations";
    if (
      id.includes("shop-directory-i18n")
      || id.includes("shop-directory-subcategory-i18n")
    ) {
      return "shop-directory-i18n";
    }
    return;
  }

  if (id.includes("workbox") || id.includes("vite-plugin-pwa")) return "workbox";
  if (id.includes("@tanstack/react-query")) return "query";
  if (id.includes("wouter")) return "router";
  if (id.includes("fuse.js")) return "fuse";
  if (id.includes("lucide-react")) return "lucide";
  if (id.includes("date-fns")) return "date-fns";
  if (id.includes("react-icons")) return "react-icons";
  if (id.includes("zod")) return "zod";
  if (id.includes("@stripe")) return "stripe";
  if (id.includes("recharts") || id.includes("d3-")) return "charts";
  if (id.includes("embla-carousel")) return "carousel";
  if (id.includes("/react-dom/") || id.includes("/react/")) return "react-vendor";

  return;
}
