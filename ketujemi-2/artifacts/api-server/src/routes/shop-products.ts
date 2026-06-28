import { Router } from "express";
import {
  db,
  shopProductsTable,
  shopsTable,
} from "@workspace/db";
import { and, asc, desc, eq } from "drizzle-orm";
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

const router = Router();

function trimOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

function parsePrice(v: unknown): string | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return n.toFixed(2);
}

function formatProductRow(row: typeof shopProductsTable.$inferSelect) {
  return {
    id: row.id,
    shop_id: row.shop_id,
    listing_id: row.listing_id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    category_id: row.category_id,
    image_url: row.image_url,
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
    if (!title || title.length < 3) errors.push("Titulli duhet të ketë të paktën 3 karaktere.");
    else data.title = title;
  }
  if (!partial || "description" in body) {
    const description = trimOrNull(body.description);
    if (!description || description.length < 10) errors.push("Përshkrimi duhet të ketë të paktën 10 karaktere.");
    else data.description = description;
  }
  if (!partial || "price" in body) {
    const price = parsePrice(body.price);
    if (!price) errors.push("Çmimi duhet të jetë numër pozitiv.");
    else data.price = price;
  }
  if (!partial || "category_id" in body) {
    const categoryId = Number(body.category_id);
    if (!Number.isFinite(categoryId) || categoryId < 1) errors.push("Zgjidhni kategorinë e produktit.");
    else data.category_id = categoryId;
  }
  if ("compare_at_price" in body) {
    const cap = body.compare_at_price === null || body.compare_at_price === "" ? null : parsePrice(body.compare_at_price);
    data.compare_at_price = cap;
  }
  if ("image_url" in body) data.image_url = trimOrNull(body.image_url);
  if ("sku" in body) data.sku = trimOrNull(body.sku);
  if ("sort_order" in body) {
    const sort = Number(body.sort_order);
    data.sort_order = Number.isFinite(sort) ? Math.max(0, Math.floor(sort)) : 0;
  }
  if ("is_active" in body) data.is_active = body.is_active !== false;

  return { errors, data };
}

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

  const { errors, data } = validateProductBody(req.body as Record<string, unknown>);
  if (errors.length) {
    res.status(400).json({ error: "VALIDATION", message: errors.join(" ") });
    return;
  }

  try {
    await validateShopProductCategoryId(data.category_id as number);
  } catch (err) {
    res.status(400).json({
      error: "VALIDATION",
      message: err instanceof Error ? err.message : "Kategoria e pavlefshme.",
    });
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
