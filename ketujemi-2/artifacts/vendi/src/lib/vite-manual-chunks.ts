/** Rollup manualChunks — keep each output chunk under Vite's 500 kB warning threshold. */

export function viteManualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    if (id.includes("/src/lib/app-extra-i18n")) return "i18n-extra";
    return;
  }

  if (id.includes("react-dom") || /[/\\]react[/\\]/.test(id)) return "react-vendor";
  if (id.includes("@tanstack")) return "tanstack";
  if (id.includes("lucide-react")) return "lucide";
  if (id.includes("@radix-ui")) return "radix-ui";
  if (id.includes("cmdk")) return "cmdk";
  if (id.includes("recharts") || id.includes("d3-")) return "charts";
  if (id.includes("workbox") || id.includes("vite-plugin-pwa")) return "workbox";
  if (id.includes("wouter")) return "router";
  if (id.includes("react-hook-form") || id.includes("@hookform")) return "forms";
  if (id.includes("date-fns")) return "date-fns";
  if (id.includes("react-icons")) return "react-icons";
  if (id.includes("zod")) return "zod";
  if (id.includes("@stripe")) return "stripe";

  return "vendor";
}
