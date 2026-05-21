import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "node:url";
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, "..", "..");
loadEnv({ path: path.join(repoRoot, ".env") });

export default defineConfig(async ({ command }) => {
  const basePath = process.env.BASE_PATH?.trim() || "/";
  const apiProxyTarget =
    process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8080";
  const buildId =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.GITHUB_SHA?.slice(0, 7) ??
    "dev";

  const pwaScope = basePath.endsWith("/") ? basePath : `${basePath}/`;

  const buildStampPlugin = (): PluginOption => ({
    name: "ketujemi-build-stamp",
    transformIndexHtml(html) {
      return html.replace(
        "</head>",
        `    <!-- ketujemi-build:${buildId} -->\n  </head>`,
      );
    },
  });

  const plugins: PluginOption[] = [
    react(),
    tailwindcss(),
    buildStampPlugin(),
    VitePWA({
      injectRegister: null,
      registerType: "autoUpdate",
      includeAssets: ["logo.png", "logo-header.png", "icons/pwa-192x192.png", "icons/pwa-512x512.png"],
      manifest: {
        name: "KetuJemi — Bli & Shit",
        short_name: "KetuJemi",
        description:
          "KetuJemi — Bli & Shit. Kosovë, Shqipëri, Maqedoni, Mal i Zi dhe diaspora shqiptare.",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        scope: pwaScope,
        start_url: pwaScope,
        lang: "sq",
        dir: "ltr",
        categories: ["shopping", "business"],
        icons: [
          {
            src: `${pwaScope}icons/pwa-192x192.png`.replace(/\/+/g, "/"),
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${pwaScope}icons/pwa-512x512.png`.replace(/\/+/g, "/"),
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${pwaScope}icons/pwa-512x512.png`.replace(/\/+/g, "/"),
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Do not precache HTML — always prefer network for navigations.
        globPatterns: ["**/*.{js,css,ico,png,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkOnly",
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ];

  if (command === "serve") {
    const { default: runtimeErrorOverlay } = await import(
      "@replit/vite-plugin-runtime-error-modal"
    );
    plugins.push(runtimeErrorOverlay());

    if (process.env.REPL_ID !== undefined) {
      const cartographer = await import("@replit/vite-plugin-cartographer");
      const devBanner = await import("@replit/vite-plugin-dev-banner");
      plugins.push(
        cartographer.cartographer({
          root: path.resolve(configDir, ".."),
        }),
        devBanner.devBanner(),
      );
    }
  }

  const rawPort = process.env.WEB_PORT ?? process.env.PORT ?? "5173";
  const port = Number(rawPort);
  if (command === "serve" && (Number.isNaN(port) || port <= 0)) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  return {
    envDir: repoRoot,
    base: basePath,
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildId),
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(configDir, "src"),
        "@assets": path.resolve(repoRoot, "attached_assets"),
        "@workspace/category-images": path.resolve(repoRoot, "lib/db/src/category-pexels-urls.ts"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: configDir,
    build: {
      outDir: path.resolve(configDir, "dist/public"),
      emptyOutDir: true,
      sourcemap: false,
      target: "es2022",
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
