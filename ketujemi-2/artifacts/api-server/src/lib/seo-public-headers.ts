import type { Response } from "express";

/** Response headers for crawler-facing SEO endpoints (sitemap, robots). */
export function applySitemapHeaders(res: Response, byteLength?: number): void {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.setHeader("X-Robots-Tag", "noarchive");
  if (byteLength != null) {
    res.setHeader("Content-Length", String(byteLength));
  }
}

export function applyRobotsTxtHeaders(res: Response): void {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("X-Robots-Tag", "noarchive");
}

export const ROBOTS_TXT_BODY = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-secret-panel
Disallow: /api/
Disallow: /login
Disallow: /profili
Disallow: /profile
Disallow: /shpalljet-e-mia
Disallow: /wallet/
Disallow: /listings/new
Disallow: /listings/*/edit
Disallow: /listings?
Disallow: /categories/
Disallow: /category/

Sitemap: https://ketujemi.com/sitemap.xml
`;
