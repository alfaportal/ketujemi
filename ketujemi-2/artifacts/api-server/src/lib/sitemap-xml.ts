import { db } from "@workspace/db";
import { categoriesTable, listingsTable } from "@workspace/db";
import { and, eq, gt, isNotNull, sql } from "drizzle-orm";
import { getCanonicalOrigin } from "./canonical-host.js";
import { SEO_CITY_SLUGS } from "../../../../lib/seo-city-slugs.js";

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

  for (const p of STATIC_PATHS) {
    urls.push(urlEntry(origin, p, today, p === "/" ? "1.0" : "0.7"));
  }

  const categories = await db
    .select({ slug: categoriesTable.slug })
    .from(categoriesTable)
    .where(isNotNull(categoriesTable.slug));

  const slugs = [
    ...new Set(
      categories
        .map((c) => c.slug?.trim())
        .filter((s): s is string => !!s && s.length > 0),
    ),
  ].sort();

  for (const slug of slugs) {
    const path = `/shpallje/${encodeURIComponent(slug)}`;
    urls.push(urlEntry(origin, path, today, "0.8"));
    for (const citySlug of SEO_CITY_SLUGS) {
      urls.push(
        urlEntry(origin, `/shpallje/${encodeURIComponent(slug)}/${citySlug}`, today, "0.6"),
      );
    }
  }

  const listingBudget = Math.max(0, MAX_SITEMAP_URLS - urls.length);
  const activeListings =
    listingBudget > 0
      ? await db
          .select({ id: listingsTable.id, listed_at: listingsTable.listed_at })
          .from(listingsTable)
          .where(
            and(
              eq(listingsTable.status, "active"),
              eq(listingsTable.moderation_status, "approved"),
              gt(listingsTable.expires_at, sql`now()`),
            ),
          )
          .orderBy(listingsTable.listed_at)
          .limit(listingBudget)
      : [];

  for (const row of activeListings) {
    const lastmod = row.listed_at
      ? new Date(row.listed_at).toISOString().slice(0, 10)
      : today;
    urls.push(urlEntry(origin, `/listings/${row.id}`, lastmod, "0.5"));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}
