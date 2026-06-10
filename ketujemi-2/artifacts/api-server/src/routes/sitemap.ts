import { Router } from "express";
import { buildSitemapXml } from "../lib/sitemap-xml.js";
import {
  ROBOTS_TXT_BODY,
  applyRobotsTxtHeaders,
  applySitemapHeaders,
} from "../lib/seo-public-headers.js";

const router = Router();

const CACHE_MS = 60 * 60 * 1000;
let cached: { xml: string; at: number } | null = null;

async function getSitemapXml(): Promise<string> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached.xml;
  const xml = await buildSitemapXml();
  cached = { xml, at: now };
  return xml;
}

async function sendSitemap(res: Parameters<typeof applySitemapHeaders>[0], headOnly: boolean): Promise<void> {
  const xml = await getSitemapXml();
  const bytes = Buffer.byteLength(xml, "utf8");
  applySitemapHeaders(res, bytes);
  if (headOnly) {
    res.status(200).end();
    return;
  }
  res.status(200).send(xml);
}

router.get("/robots.txt", (_req, res) => {
  applyRobotsTxtHeaders(res);
  res.status(200).send(ROBOTS_TXT_BODY);
});

router.head("/sitemap.xml", async (_req, res) => {
  try {
    await sendSitemap(res, true);
  } catch (err) {
    console.error("[sitemap] HEAD", err);
    res.status(500).type("text/plain").send("Sitemap generation failed");
  }
});

router.get("/sitemap.xml", async (_req, res) => {
  try {
    await sendSitemap(res, false);
  } catch (err) {
    console.error("[sitemap]", err);
    res.status(500).type("text/plain").send("Sitemap generation failed");
  }
});

export default router;
