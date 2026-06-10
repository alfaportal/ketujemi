import { Router } from "express";
import { shopMapEmbedSrc } from "../../../../lib/google-maps-embed-url.js";

const router = Router();

/** Public embed URL for shop maps — uses server GOOGLE_MAPS_API_KEY (runtime, not Vite build). */
router.get("/maps/embed", (req, res) => {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_EMBED_API_KEY?.trim() ||
    process.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ||
    "";

  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const q = typeof req.query.q === "string" ? req.query.q : "";

  const url = shopMapEmbedSrc(
    {
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
      address: q || undefined,
    },
    apiKey,
  );

  res.setHeader("Cache-Control", "public, max-age=3600");
  res.json({ url, has_api_key: apiKey.length > 0 });
});

export default router;
