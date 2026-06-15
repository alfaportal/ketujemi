import type { Express } from "express";
import { isParentHubCategorySlug } from "../../../../lib/seo-sitemap-config.js";

const SHPALLJE_CITY_PATH = /^\/shpallje\/([^/]+)\/([^/]+)\/?$/;

/**
 * Leaf/brand category + city URLs stay usable for users but must not be indexed
 * (old sitemap exposed thousands of these to Google).
 */
export function attachSeoCategoryCityMiddleware(app: Express): void {
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const match = SHPALLJE_CITY_PATH.exec(req.path);
    if (!match) return next();

    let categorySlug = match[1] ?? "";
    try {
      categorySlug = decodeURIComponent(categorySlug);
    } catch {
      /* keep raw */
    }

    if (!isParentHubCategorySlug(categorySlug)) {
      res.setHeader("X-Robots-Tag", "noindex, follow");
    }

    next();
  });
}
