import { Router } from "express";
import { buildSitemapXml } from "../lib/sitemap-xml.js";

const router = Router();

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const xml = await buildSitemapXml();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(xml);
  } catch (err) {
    console.error("[sitemap]", err);
    res.status(500).type("text/plain").send("Sitemap generation failed");
  }
});

export default router;
