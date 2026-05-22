/** Rollup manualChunks — split only isolated libs; no catch-all "vendor" (causes circular chunks). */

export function viteManualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    if (id.includes("/src/lib/app-extra-i18n")) return "i18n-extra";
    return;
  }

  if (id.includes("workbox") || id.includes("vite-plugin-pwa")) return "workbox";
  if (id.includes("lucide-react")) return "lucide";
  if (id.includes("date-fns")) return "date-fns";
  if (id.includes("react-icons")) return "react-icons";
  if (id.includes("zod")) return "zod";
  if (id.includes("@stripe")) return "stripe";
  if (id.includes("recharts") || id.includes("d3-")) return "charts";

  return "react-vendor";
}
