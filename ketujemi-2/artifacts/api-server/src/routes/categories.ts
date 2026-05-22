import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, listingsTable, carModelsTable, truckModelsTable, motorModelsTable } from "@workspace/db";
import { resolveParentCategoryThumb } from "../../../../lib/db/src/parent-category-images.js";
import { asc, sql } from "drizzle-orm";

const router = Router();

router.get("/car-models", async (_req, res) => {
  try {
    const rows = await db
      .select({ brand_slug: carModelsTable.brand_slug, name: carModelsTable.name })
      .from(carModelsTable)
      .orderBy(asc(carModelsTable.brand_slug), asc(carModelsTable.name));
    res.json(rows);
  } catch (err) {
    (_req as any).log?.error?.({ err }, "Failed car-models");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/truck-models", async (_req, res) => {
  try {
    const rows = await db
      .select({ brand_slug: truckModelsTable.brand_slug, name: truckModelsTable.name })
      .from(truckModelsTable)
      .orderBy(asc(truckModelsTable.brand_slug), asc(truckModelsTable.name));
    res.json(rows);
  } catch (err) {
    (_req as any).log?.error?.({ err }, "Failed truck-models");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/motor-models", async (_req, res) => {
  try {
    const rows = await db
      .select({ brand_slug: motorModelsTable.brand_slug, name: motorModelsTable.name })
      .from(motorModelsTable)
      .orderBy(asc(motorModelsTable.brand_slug), asc(motorModelsTable.name));
    res.json(rows);
  } catch (err) {
    (_req as any).log?.error?.({ err }, "Failed motor-models");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable);
    const counts = await db
      .select({
        category_id: listingsTable.category_id,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(listingsTable)
      .groupBy(listingsTable.category_id);

    const countMap = new Map(counts.map((c) => [c.category_id, c.count]));

    const result = categories.map((cat) => {
      const slug = typeof cat.slug === "string" ? cat.slug.trim() : "";
      const curated = resolveParentCategoryThumb(slug, cat.name);
      return {
        ...cat,
        image_url: curated ?? cat.image_url,
        listing_count: countMap.get(cat.id) ?? 0,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
