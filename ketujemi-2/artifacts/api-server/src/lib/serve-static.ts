import fs from "node:fs";
import path from "node:path";
import type { Express } from "express";
import express from "express";
import { logger } from "./logger";

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
    const indexPath = path.join(resolved, "index.html");
    if (!fs.existsSync(indexPath)) return next();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.sendFile(indexPath);
  });
}
