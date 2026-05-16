import { Router } from "express";

const router = Router();

let _cache: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

router.get("/exchange-rates", async (req, res) => {
  try {
    if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
      res.json(_cache.rates);
      return;
    }

    const response = await fetch("https://api.frankfurter.app/latest?from=EUR&to=ALL,MKD");
    if (!response.ok) throw new Error("Upstream error");
    const data = await response.json() as { rates: Record<string, number> };

    const rates = { EUR: 1, ...data.rates };
    _cache = { rates, fetchedAt: Date.now() };
    res.json(rates);
  } catch (err) {
    req.log.warn({ err }, "Exchange rate fetch failed, returning fallback");
    res.json({ EUR: 1, ALL: 109.5, MKD: 61.5 });
  }
});

export default router;
