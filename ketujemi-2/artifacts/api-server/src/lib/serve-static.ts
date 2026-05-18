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
      maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
    }),
  );

  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const indexPath = path.join(resolved, "index.html");
    if (!fs.existsSync(indexPath)) return next();
    res.sendFile(indexPath);
  });
}
