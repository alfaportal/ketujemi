import fs from "node:fs";
import path from "node:path";
import type { Express } from "express";
import express from "express";
import { logger } from "./logger";

/**
 * Requests for built files (or other paths with a file extension) must not
 * receive index.html when the file is missing — the browser would try to run
 * HTML as JavaScript and the app shows "Diçka shkoi keq".
 */
function isStaticAssetRequest(urlPath: string): boolean {
  if (urlPath.startsWith("/assets/") || urlPath.startsWith("/icons/")) return true;
  const last = urlPath.split("/").pop() ?? "";
  return /\.[a-z0-9]{1,8}$/i.test(last);
}

/** Serve Vite build output when STATIC_ROOT is set (production / single-port deploy). */
export function attachStaticFrontend(app: Express): void {
  const staticRoot = process.env.STATIC_ROOT?.trim();
  if (!staticRoot) return;

  const resolved = path.resolve(staticRoot);
  if (!fs.existsSync(resolved)) {
    logger.warn({ staticRoot: resolved }, "STATIC_ROOT missing; skipping static files");
    return;
  }

  logger.info({ staticRoot: resolved }, "Serving frontend static files");

  app.use(
    express.static(resolved, {
      index: false,
      maxAge: 0,
      setHeaders(res, filePath) {
        const base = path.basename(filePath);
        const isHashedAsset = filePath.includes(`${path.sep}assets${path.sep}`);
        const isShell =
          base === "index.html" ||
          base.endsWith(".webmanifest") ||
          base === "sw.js" ||
          base.startsWith("workbox-") ||
          base === "registerSW.js";

        if (isShell) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          return;
        }
        if (isHashedAsset && process.env.NODE_ENV === "production") {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (isStaticAssetRequest(req.path)) {
      res.status(404).type("text/plain").send("Not Found");
      return;
    }
    const indexPath = path.join(resolved, "index.html");
    if (!fs.existsSync(indexPath)) return next();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.sendFile(indexPath);
  });
}
