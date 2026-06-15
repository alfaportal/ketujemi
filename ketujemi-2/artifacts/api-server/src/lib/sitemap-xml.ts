import { db } from "@workspace/db";
import { listingsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { getCanonicalOrigin } from "./canonical-host.js";
import { activeListingSqlCondition } from "./listing-visibility.js";
import {
  SITEMAP_CITY_SLUGS,
  SITEMAP_PARENT_HUB_SLUGS,
} from "../../../../lib/seo-sitemap-config.js";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(origin: string, path: string, lastmod?: string, priority?: string): string {
  const loc = `${origin}${path}`;
  const last = lastmod ? `<lastmod>${xmlEscape(lastmod)}</lastmod>` : "";
  const pri = priority ? `<priority>${priority}</priority>` : "";
  return `<url><loc>${xmlEscape(loc)}</loc>${last}${pri}</url>`;
}

/** Google allows at most 50_000 URLs per sitemap file. */
const MAX_SITEMAP_URLS = 50_000;

const STATIC_PATHS = [
  "/",
  "/listings",
  "/dyqanet",
  "/about",
  "/contact",
  "/faq",
  "/rules",
  "/privacy",
  "/terms",
  "/security",
];

export async function buildSitemapXml(): Promise<string> {
  const origin = getCanonicalOrigin().replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);
  const urls: string[] = [];

  const listingBudget = Math.max(0, MAX_SITEMAP_URLS - 500);
  const activeListings = await db
    .select({ id: listingsTable.id, listed_at: listingsTable.listed_at })
    .from(listingsTable)
    .where(activeListingSqlCondition())
    .orderBy(desc(listingsTable.listed_at))
    .limit(listingBudget);

  for (const row of activeListings) {
    const lastmod = row.listed_at
      ? new Date(row.listed_at).toISOString().slice(0, 10)
      : today;
    urls.push(urlEntry(origin, `/listings/${row.id}`, lastmod, "0.8"));
  }

  for (const p of STATIC_PATHS) {
    urls.push(urlEntry(origin, p, today, p === "/" ? "1.0" : "0.7"));
  }

  for (const slug of SITEMAP_PARENT_HUB_SLUGS) {
    const path = `/shpallje/${encodeURIComponent(slug)}`;
    urls.push(urlEntry(origin, path, today, "0.9"));
    for (const citySlug of SITEMAP_CITY_SLUGS) {
      urls.push(
        urlEntry(origin, `/shpallje/${encodeURIComponent(slug)}/${citySlug}`, today, "0.7"),
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}
