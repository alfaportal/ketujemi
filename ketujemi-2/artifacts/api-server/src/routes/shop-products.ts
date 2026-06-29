import { Router } from "express";
import {
  db,
  shopProductsTable,
  shopsTable,
  categoriesTable,
} from "@workspace/db";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { getSessionUser } from "../lib/session-user.js";
import { isShopPubliclyVisible } from "../lib/shop-visibility.js";
import { enforceProfileChangeToken } from "../lib/profile-change-verify.js";
import {
  isShopStorefrontEligible,
  storefrontBlockedReason,
} from "../../../../lib/shop-storefront-policy.js";
import {
  deactivateShopProductListing,
  refreshShopProductListingsAfterShopUpdate,
  syncShopProductToListing,
  validateShopProductCategoryId,
} from "../lib/shop-product-listing-sync.js";
import { resolveShopByIdOrSlug } from "../lib/shop-slug.js";
import { assertShopProductTextAllowed } from "../lib/shop-content-moderation.js";
import { joinListingImageUrls, parseListingImageUrls, sanitizeListingImageUrlField } from "../lib/listing-images.js";
import { SHOP_PRODUCT_BLOCKED_LISTING_ROOT_SLUGS, SHOP_STOREFRONT_MAX_TILES } from "../../../../lib/shop-storefront-policy.js";

const DEFAULT_PRODUCT_TITLE = "Produkt";
const DEFAULT_PRODUCT_DESCRIPTION = "Produkt nga dyqani im në KetuJemi.";

function trimOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

function parsePrice(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return "0.00";
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return n.toFixed(2);
}

let cachedDefaultCategoryId: number | null = null;

async function defaultShopProductCategoryId(): Promise<number> {
  if (cachedDefaultCategoryId != null) return cachedDefaultCategoryId;
  const roots = await db
    .select({ id: categoriesTable.id, slug: categoriesTable.slug })
    .from(categoriesTable)
    .where(isNull(categoriesTable.parent_id))
    .orderBy(asc(categoriesTable.id));
  for (const row of roots) {
    const slug = row.slug?.trim();
    if (slug && !SHOP_PRODUCT_BLOCKED_LISTING_ROOT_SLUGS.has(slug)) {
      cachedDefaultCategoryId = row.id;
      return row.id;
    }
  }
  const [any] = await db.select({ id: categoriesTable.id }).from(categoriesTable).limit(1);
  if (!any) throw new Error("Nuk u gjet asnjë kategori.");
  cachedDefaultCategoryId = any.id;
  return any.id;
}

function resolveProductImages(body: Record<string, unknown>): string | null | undefined {
  if ("image_urls" in body && Array.isArray(body.image_urls)) {
    const urls = body.image_urls.filter((u): u is string => typeof u === "string");
    return joinListingImageUrls(urls);
  }
  if ("image_url" in body) {
    const raw = trimOrNull(body.image_url);
    return raw ? sanitizeListingImageUrlField(raw) : null;
  }
  return undefined;
}

function formatProductRow(row: typeof shopProductsTable.$inferSelect) {
  const image_urls = parseListingImageUrls(row.image_url);
  return {
    id: row.id,
    shop_id: row.shop_id,
    listing_id: row.listing_id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    category_id: row.category_id,
    image_url: image_urls[0] ?? row.image_url,
    image_urls,
    collection: row.collection ?? null,
    sku: row.sku,
    sort_order: row.sort_order,
    is_active: row.is_active,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

async function loadOwnerShop(viewerId: number) {
  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, viewerId), eq(shopsTable.is_active, true)))
    .limit(1);
  return shop ?? null;
}

async function assertOwnerShop(viewerId: number) {
  const shop = await loadOwnerShop(viewerId);
  if (!shop) return { error: { status: 404, body: { error: "Not found", message: "Nuk keni dyqan aktiv." } } };
  if (!isShopStorefrontEligible(shop)) {
    const reason = storefrontBlockedReason(shop.directory_subcategory_slug);
    return {
      error: {
        status: 403,
        body: {
          error: "STOREFRONT_NOT_ELIGIBLE",
          message: reason ?? "Kjo kategori dyqani nuk mbështet webfaqe produktesh.",
        },
      },
    };
  }
  return { shop };
}

function validateProductBody(body: Record<string, unknown>, partial = false): { errors: string[]; data: Record<string, unknown> } {
  const errors: string[] = [];
  const data: Record<string, unknown> = {};

  if (!partial || "title" in body) {
    const title = trimOrNull(body.title);
    data.title = title && title.length > 0 ? title.slice(0, 120) : DEFAULT_PRODUCT_TITLE;
  }
  if (!partial || "description" in body) {
    const description = trimOrNull(body.description);
    data.description =
      description && description.length > 0 ? description.slice(0, 4000) : DEFAULT_PRODUCT_DESCRIPTION;
  }
  if (!partial || "price" in body) {
    const price = parsePrice(body.price);
    data.price = price ?? "0.00";
  }
  if (!partial || "category_id" in body) {
    const categoryId = Number(body.category_id);
    if (Number.isFinite(categoryId) && categoryId > 0) data.category_id = categoryId;
  }
  if ("compare_at_price" in body) {
    const cap = body.compare_at_price === null || body.compare_at_price === "" ? null : parsePrice(body.compare_at_price);
    data.compare_at_price = cap;
  }
  const images = resolveProductImages(body);
  if (images !== undefined) data.image_url = images;
  if ("collection" in body) data.collection = trimOrNull(body.collection)?.slice(0, 80) ?? null;
  if ("sku" in body) data.sku = trimOrNull(body.sku);
  if ("sort_order" in body) {
    const sort = Number(body.sort_order);
    data.sort_order = Number.isFinite(sort) ? Math.max(0, Math.floor(sort)) : 0;
  }
  if ("is_active" in body) data.is_active = body.is_active !== false;

  return { errors, data };
}

const router = Router();

// ─── GET /shops/:idOrSlug/products (public) ─────────────────────────────────
router.get("/shops/:idOrSlug/products", async (req, res) => {
  const shop = await resolveShopByIdOrSlug(req.params.idOrSlug);
  if (!shop || !isShopPubliclyVisible(shop)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (!isShopStorefrontEligible(shop)) {
    res.json({ products: [], storefront_eligible: false });
    return;
  }

  const rows = await db
    .select()
    .from(shopProductsTable)
    .where(and(eq(shopProductsTable.shop_id, shop.id), eq(shopProductsTable.is_active, true)))
    .orderBy(asc(shopProductsTable.sort_order), desc(shopProductsTable.id));

  res.json({
    products: rows.map(formatProductRow),
    storefront_eligible: true,
  });
});

// ─── GET /shops/me/products ───────────────────────────────────────────────────
router.get("/shops/me/products", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const shop = await loadOwnerShop(viewer.id);
  if (!shop) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const rows = await db
    .select()
    .from(shopProductsTable)
    .where(eq(shopProductsTable.shop_id, shop.id))
    .orderBy(asc(shopProductsTable.sort_order), desc(shopProductsTable.id));

  res.json({
    products: rows.map(formatProductRow),
    storefront_eligible: isShopStorefrontEligible(shop),
    storefront_blocked_reason: storefrontBlockedReason(shop.directory_subcategory_slug),
  });
});

// ─── POST /shops/me/products ──────────────────────────────────────────────────
router.post("/shops/me/products", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const gate = await enforceProfileChangeToken(viewer, req.body as Record<string, unknown>);
  if (!gate.ok) {
    res.status(gate.status).json(gate.body);
    return;
  }

  const owned = await assertOwnerShop(viewer.id);
  if ("error" in owned && owned.error) {
    res.status(owned.error.status).json(owned.error.body);
    return;
  }
  const shop = owned.shop!;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(shopProductsTable)
    .where(and(eq(shopProductsTable.shop_id, shop.id), eq(shopProductsTable.is_active, true)));
  if ((countRow?.count ?? 0) >= SHOP_STOREFRONT_MAX_TILES) {
    res.status(400).json({
      error: "VALIDATION",
      message: `Maksimumi ${SHOP_STOREFRONT_MAX_TILES} produkte/shërbime në webfaqe.`,
    });
    return;
  }

  const { errors, data } = validateProductBody(req.body as Record<string, unknown>);
  if (errors.length) {
    res.status(400).json({ error: "VALIDATION", message: errors.join(" ") });
    return;
  }

  try {
    if (!data.category_id) {
      data.category_id = await defaultShopProductCategoryId();
    }
    await validateShopProductCategoryId(data.category_id as number);
  } catch (err) {
    res.status(400).json({
      error: "VALIDATION",
      message: err instanceof Error ? err.message : "Kategoria e pavlefshme.",
    });
    return;
  }

  try {
    assertShopProductTextAllowed(data.title as string, data.description as string);
  } catch (err) {
    const message =
      err instanceof Error && "publicMessage" in err && typeof (err as Error & { publicMessage?: string }).publicMessage === "string"
        ? (err as Error & { publicMessage: string }).publicMessage
        : "Përmbajtja nuk lejohet.";
    res.status(400).json({ error: "PROHIBITED_CONTENT", message });
    return;
  }

  const now = new Date();
  const [product] = await db
    .insert(shopProductsTable)
    .values({
      shop_id: shop.id,
      title: data.title as string,
      description: data.description as string,
      price: data.price as string,
      compare_at_price: (data.compare_at_price as string | null | undefined) ?? null,
      category_id: data.category_id as number,
      image_url: (data.image_url as string | null | undefined) ?? null,
      collection: (data.collection as string | null | undefined) ?? null,
      sku: (data.sku as string | null | undefined) ?? null,
      sort_order: (data.sort_order as number | undefined) ?? 0,
      is_active: data.is_active !== false,
      created_at: now,
      updated_at: now,
    })
    .returning();

  try {
    await syncShopProductToListing(shop, product);
  } catch (err) {
    req.log?.error?.({ err, productId: product.id }, "shop product listing sync failed on create");
  }

  const [fresh] = await db
    .select()
    .from(shopProductsTable)
    .where(eq(shopProductsTable.id, product.id))
    .limit(1);

  res.status(201).json({ ok: true, product: formatProductRow(fresh ?? product) });
});

// ─── PATCH /shops/me/products/:productId ──────────────────────────────────────
router.patch("/shops/me/products/:productId", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId) || productId < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const gate = await enforceProfileChangeToken(viewer, req.body as Record<string, unknown>);
  if (!gate.ok) {
    res.status(gate.status).json(gate.body);
    return;
  }

  const owned = await assertOwnerShop(viewer.id);
  if ("error" in owned && owned.error) {
    res.status(owned.error.status).json(owned.error.body);
    return;
  }
  const shop = owned.shop!;

  const [existing] = await db
    .select()
    .from(shopProductsTable)
    .where(and(eq(shopProductsTable.id, productId), eq(shopProductsTable.shop_id, shop.id)))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { errors, data } = validateProductBody(req.body as Record<string, unknown>, true);
  if (errors.length) {
    res.status(400).json({ error: "VALIDATION", message: errors.join(" ") });
    return;
  }
  if (!Object.keys(data).length) {
    res.status(400).json({ error: "VALIDATION", message: "Nuk ka fusha për përditësim." });
    return;
  }

  if (data.category_id != null) {
    try {
      await validateShopProductCategoryId(data.category_id as number);
    } catch (err) {
      res.status(400).json({
        error: "VALIDATION",
        message: err instanceof Error ? err.message : "Kategoria e pavlefshme.",
      });
      return;
    }
  }

  const nextTitle = (data.title as string | undefined) ?? existing.title;
  const nextDescription = (data.description as string | undefined) ?? existing.description;
  try {
    assertShopProductTextAllowed(nextTitle, nextDescription);
  } catch (err) {
    const message =
      err instanceof Error && "publicMessage" in err && typeof (err as Error & { publicMessage?: string }).publicMessage === "string"
        ? (err as Error & { publicMessage: string }).publicMessage
        : "Përmbajtja nuk lejohet.";
    res.status(400).json({ error: "PROHIBITED_CONTENT", message });
    return;
  }

  const patch: Partial<typeof shopProductsTable.$inferInsert> = {
    ...data,
    updated_at: new Date(),
  };

  const [updated] = await db
    .update(shopProductsTable)
    .set(patch)
    .where(eq(shopProductsTable.id, productId))
    .returning();

  if (updated.is_active) {
    try {
      await syncShopProductToListing(shop, updated);
    } catch (err) {
      req.log?.error?.({ err, productId }, "shop product listing sync failed on update");
    }
  } else {
    await deactivateShopProductListing(updated);
  }

  res.json({ ok: true, product: formatProductRow(updated) });
});

// ─── DELETE /shops/me/products/:productId ─────────────────────────────────────
router.delete("/shops/me/products/:productId", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId) || productId < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const gate = await enforceProfileChangeToken(viewer, req.body as Record<string, unknown>);
  if (!gate.ok) {
    res.status(gate.status).json(gate.body);
    return;
  }

  const owned = await assertOwnerShop(viewer.id);
  if ("error" in owned && owned.error) {
    res.status(owned.error.status).json(owned.error.body);
    return;
  }
  const shop = owned.shop!;

  const [existing] = await db
    .select()
    .from(shopProductsTable)
    .where(and(eq(shopProductsTable.id, productId), eq(shopProductsTable.shop_id, shop.id)))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await deactivateShopProductListing(existing);
  await db.delete(shopProductsTable).where(eq(shopProductsTable.id, productId));

  res.json({ ok: true });
});

// ─── POST /shops/me/products/reorder ──────────────────────────────────────────
router.post("/shops/me/products/reorder", async (req, res) => {
  const viewer = await getSessionUser(req);
  if (!viewer) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const gate = await enforceProfileChangeToken(viewer, req.body as Record<string, unknown>);
  if (!gate.ok) {
    res.status(gate.status).json(gate.body);
    return;
  }

  const owned = await assertOwnerShop(viewer.id);
  if ("error" in owned && owned.error) {
    res.status(owned.error.status).json(owned.error.body);
    return;
  }
  const shop = owned.shop!;

  const order = (req.body as { order?: unknown }).order;
  if (!Array.isArray(order)) {
    res.status(400).json({ error: "VALIDATION", message: "Renditja e produkteve mungon." });
    return;
  }

  const now = new Date();
  for (let i = 0; i < order.length; i++) {
    const id = Number(order[i]);
    if (!Number.isFinite(id) || id < 1) continue;
    await db
      .update(shopProductsTable)
      .set({ sort_order: i, updated_at: now })
      .where(and(eq(shopProductsTable.id, id), eq(shopProductsTable.shop_id, shop.id)));
  }

  res.json({ ok: true });
});

export { refreshShopProductListingsAfterShopUpdate };

export default router;
