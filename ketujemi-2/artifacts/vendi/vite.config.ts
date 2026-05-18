import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "node:url";
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, "..", "..");
loadEnv({ path: path.join(repoRoot, ".env") });

export default defineConfig(async ({ command }) => {
  const basePath = process.env.BASE_PATH?.trim() || "/";
  const apiProxyTarget =
    process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8080";

  const plugins: PluginOption[] = [react(), tailwindcss()];

  if (command === "serve") {
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
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(configDir, "src"),
        "@assets": path.resolve(repoRoot, "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: configDir,
    build: {
      outDir: path.resolve(configDir, "dist/public"),
      emptyOutDir: true,
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
