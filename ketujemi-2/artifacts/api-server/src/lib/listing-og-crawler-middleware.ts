import type { Express } from "express";
import { db, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getCanonicalOrigin } from "./canonical-host.js";
import { isListingPubliclyVisible } from "./listing-visibility.js";

const FB_APP_ID = "2196983604470561";
const LISTING_PATH = /^\/listings\/(\d+)\/?$/;

export type ListingOgMeta = {
  id: number;
  title: string;
  ogDescription: string;
  description: string;
  imageUrl: string | null;
  pageUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isSocialCrawlerUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("facebookexternalhit") ||
    ua.includes("twitterbot") ||
    ua.includes("linkedinbot")
  );
}

export function isSearchEngineCrawlerUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("duckduckbot") ||
    ua.includes("yandexbot") ||
    ua.includes("slurp") ||
    ua.includes("applebot")
  );
}

function listingOgImageUrl(imageUrlField: string | null | undefined): string | null {
  if (!imageUrlField?.trim()) return null;
  const stored = imageUrlField.split(",")[0]?.trim();
  if (!stored) return null;
  if (!stored.includes("/upload/")) return stored;
  return stored.replace("/upload/", "/upload/w_1200,h_1200,c_limit/");
}

function buildOgDescription(priceRaw: string, location: string): string {
  const priceNum = Number(priceRaw);
  const priceBit =
    !Number.isFinite(priceNum) || priceNum === 0
      ? "Me marrëveshje"
      : `${priceNum.toLocaleString("en-US")} EUR`;
  const loc = location.trim();
  return loc ? `${priceBit} — ${loc}` : priceBit;
}

export async function fetchListingOgMeta(listingId: number): Promise<ListingOgMeta | null> {
  if (!Number.isFinite(listingId) || listingId <= 0) return null;

  const [row] = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      location: listingsTable.location,
      image_url: listingsTable.image_url,
      expires_at: listingsTable.expires_at,
      status: listingsTable.status,
      moderation_status: listingsTable.moderation_status,
    })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row || !isListingPubliclyVisible(row)) return null;

  const origin = getCanonicalOrigin().replace(/\/$/, "");
  const pageUrl = `${origin}/listings/${row.id}`;
  const ogDescription = buildOgDescription(String(row.price), row.location);
  const description = row.description.trim().slice(0, 160) || ogDescription;

  return {
    id: row.id,
    title: row.title,
    ogDescription,
    description,
    imageUrl: listingOgImageUrl(row.image_url),
    pageUrl,
  };
}

export function buildListingOgHtml(meta: ListingOgMeta, opts?: { forSearchEngine?: boolean }): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(opts?.forSearchEngine ? meta.description : meta.ogDescription);
  const url = escapeHtml(meta.pageUrl);
  const image = meta.imageUrl ? escapeHtml(meta.imageUrl) : "";

  const imageTags = image
    ? `  <meta property="og:image" content="${image}" />\n  <meta name="twitter:image" content="${image}" />\n`
    : "";

  const robotsTag = opts?.forSearchEngine
    ? `  <meta name="robots" content="index, follow" />\n`
    : "";

  return `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8" />
  <title>${title} | KetuJemi</title>
  <meta name="description" content="${description}" />
${robotsTag}  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
${imageTags}  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="KetuJemi" />
  <meta property="fb:app_id" content="${FB_APP_ID}" />
  <link rel="canonical" href="${url}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p><a href="${url}">Shiko shpalljen në KetuJemi</a></p>
</body>
</html>`;
}

/** Search/social crawlers on /listings/:id get server-rendered HTML; others fall through to SPA. */
export function attachListingOgCrawlerMiddleware(app: Express): void {
  app.use(async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const match = LISTING_PATH.exec(req.path);
    if (!match) return next();

    const ua = req.get("user-agent") ?? "";
    const forSearchEngine = isSearchEngineCrawlerUserAgent(ua);
    const forSocial = isSocialCrawlerUserAgent(ua);
    if (!forSearchEngine && !forSocial) return next();

    const listingId = Number(match[1]);
    try {
      const meta = await fetchListingOgMeta(listingId);
      if (!meta) {
        res.status(404).type("text/plain").send("Not Found");
        return;
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300");
      if (req.method === "HEAD") {
        res.status(200).end();
        return;
      }
      res.status(200).send(buildListingOgHtml(meta, { forSearchEngine }));
    } catch (err) {
      next(err);
    }
  });
}
