import type { Express } from "express";
import { db, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
const LISTING_ORIGIN = "https://ketujemi.com";
const FB_APP_ID = "2196983604470561";
const LISTING_PATH = /^\/listings\/(\d+)\/?$/;

export type ListingOgMeta = {
  id: number;
  title: string;
  ogDescription: string;
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

/** First image URL from DB with Cloudinary OG resize (w_1200,h_630,c_pad,b_white). */
function listingOgImageUrl(imageUrlField: string | null | undefined): string | null {
  if (!imageUrlField?.trim()) return null;
  const stored = imageUrlField.split(",")[0]?.trim();
  if (!stored) return null;
  if (!stored.includes("/upload/")) return stored;
  return stored.replace("/upload/", "/upload/w_1200,h_630,c_pad,b_white/");
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
      price: listingsTable.price,
      location: listingsTable.location,
      image_url: listingsTable.image_url,
      expires_at: listingsTable.expires_at,
      status: listingsTable.status,
    })
    .from(listingsTable)
    .where(eq(listingsTable.id, listingId))
    .limit(1);

  if (!row) return null;

  const expired = !!(row.expires_at && new Date(row.expires_at) < new Date());
  if (expired || row.status !== "active") return null;

  const pageUrl = `${LISTING_ORIGIN}/listings/${row.id}`;
  return {
    id: row.id,
    title: row.title,
    ogDescription: buildOgDescription(String(row.price), row.location),
    imageUrl: listingOgImageUrl(row.image_url),
    pageUrl,
  };
}

export function buildListingOgHtml(meta: ListingOgMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.ogDescription);
  const url = escapeHtml(meta.pageUrl);
  const image = meta.imageUrl ? escapeHtml(meta.imageUrl) : "";

  const imageTags = image
    ? `  <meta property="og:image" content="${image}" />\n`
    : "";

  return `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8" />
  <title>${title} | KetuJemi</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
${imageTags}  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="KetuJemi" />
  <meta property="fb:app_id" content="${FB_APP_ID}" />
  <link rel="canonical" href="${url}" />
</head>
<body>
  <p><a href="${url}">${title}</a></p>
</body>
</html>`;
}

/** Social crawlers on /listings/:id get server-rendered OG HTML; others fall through to SPA. */
export function attachListingOgCrawlerMiddleware(app: Express): void {
  app.use(async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const match = LISTING_PATH.exec(req.path);
    if (!match) return next();

    const ua = req.get("user-agent") ?? "";
    if (!isSocialCrawlerUserAgent(ua)) return next();

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
      res.status(200).send(buildListingOgHtml(meta));
    } catch (err) {
      next(err);
    }
  });
}
