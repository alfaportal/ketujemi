import {
  db,
  categoriesTable,
  listingsTable,
  shopProductsTable,
  shopsTable,
  type Shop,
  type ShopProduct,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { SHOP_PRODUCT_BLOCKED_LISTING_ROOT_SLUGS } from "../../../../lib/shop-storefront-policy.js";
import { resolveListingCategoryToLeaf } from "./listing-category-resolve.js";
import {
  expiresAtForCategoryRootSlug,
  resolveCategorySlugMeta,
} from "./listing-special-categories.js";
import { sanitizeListingImageUrlField } from "./listing-images.js";

type ShopContact = Pick<
  Shop,
  "id" | "user_id" | "shop_name" | "city" | "region" | "address" | "phone" | "contact_name"
>;

function normalizeTitle(title: string): string {
  return title.trim().slice(0, 120);
}

function normalizeDescription(description: string): string {
  const t = description.trim();
  return t.length >= 10 ? t : `${t} — Produkt nga dyqani i verifikuar në KetuJemi.`.slice(0, 2000);
}

function shopListingLocation(shop: ShopContact): string {
  const parts = [shop.city, shop.region].filter(Boolean);
  return parts.join(", ") || shop.address?.trim() || "Kosovë";
}

async function assertProductListingCategory(categoryId: number): Promise<number> {
  const meta = await resolveCategorySlugMeta(categoryId);
  const rootSlug = meta?.rootSlug ?? null;
  if (rootSlug && SHOP_PRODUCT_BLOCKED_LISTING_ROOT_SLUGS.has(rootSlug)) {
    throw new Error("Kategoria e zgjedhur nuk lejohet për produkte dyqani (p.sh. punë/restorant).");
  }
  return categoryId;
}

export async function syncShopProductToListing(
  shop: ShopContact,
  product: ShopProduct,
): Promise<number> {
  const categoryId = await assertProductListingCategory(product.category_id);
  const leafCategoryId = await resolveListingCategoryToLeaf(
    categoryId,
    product.title,
    product.description,
  );
  const leafMeta = await resolveCategorySlugMeta(leafCategoryId);
  const rootSlug = leafMeta?.rootSlug ?? null;
  const now = new Date();
  const title = normalizeTitle(product.title);
  const description = normalizeDescription(product.description);
  const location = shopListingLocation(shop);
  const sellerName = shop.shop_name.trim() || shop.contact_name.trim();
  const price = String(product.price);
  const imageUrl = sanitizeListingImageUrlField(product.image_url) ?? null;

  const listingValues = {
    user_id: shop.user_id,
    shop_id: shop.id,
    shop_product_id: product.id,
    title,
    description,
    price,
    category_id: leafCategoryId,
    location,
    seller_name: sellerName,
    seller_phone: shop.phone.trim(),
    condition: "E re",
    image_url: imageUrl,
    status: product.is_active ? "active" : "inactive",
    moderation_status: "approved" as const,
    moderation_reason: null,
    listed_at: now,
    expires_at: expiresAtForCategoryRootSlug(rootSlug),
  };

  if (product.listing_id) {
    const [existing] = await db
      .select({ id: listingsTable.id })
      .from(listingsTable)
      .where(eq(listingsTable.id, product.listing_id))
      .limit(1);
    if (existing) {
      await db
        .update(listingsTable)
        .set({
          ...listingValues,
          listed_at: now,
        })
        .where(eq(listingsTable.id, product.listing_id));
      return product.listing_id;
    }
  }

  const [row] = await db.insert(listingsTable).values(listingValues).returning({ id: listingsTable.id });
  await db
    .update(shopProductsTable)
    .set({ listing_id: row.id, updated_at: now })
    .where(eq(shopProductsTable.id, product.id));
  return row.id;
}

export async function deactivateShopProductListing(product: Pick<ShopProduct, "listing_id">): Promise<void> {
  if (!product.listing_id) return;
  await db
    .update(listingsTable)
    .set({ status: "inactive", listed_at: new Date() })
    .where(eq(listingsTable.id, product.listing_id));
}

/** Remove synced Blej & Shite listing when a shop product is deleted. */
export async function removeShopProductListing(product: Pick<ShopProduct, "listing_id">): Promise<void> {
  await deactivateShopProductListing(product);
}

export async function syncAllShopProductsForShop(shopId: number): Promise<void> {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, shopId)).limit(1);
  if (!shop) return;

  const products = await db
    .select()
    .from(shopProductsTable)
    .where(eq(shopProductsTable.shop_id, shopId))
    .orderBy(shopProductsTable.sort_order, shopProductsTable.id);

  for (const product of products) {
    if (!product.is_active) {
      await deactivateShopProductListing(product);
      continue;
    }
    await syncShopProductToListing(shop, product);
  }
}

/** After shop profile edit — refresh seller contact on all synced listings. */
export async function refreshShopProductListingsAfterShopUpdate(shopId: number): Promise<void> {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, shopId)).limit(1);
  if (!shop) return;

  const products = await db
    .select()
    .from(shopProductsTable)
    .where(eq(shopProductsTable.shop_id, shopId));

  const location = shopListingLocation(shop);
  const sellerName = shop.shop_name.trim() || shop.contact_name.trim();
  const now = new Date();

  for (const product of products) {
    if (!product.is_active) continue;
    if (product.listing_id) {
      await db
        .update(listingsTable)
        .set({
          seller_name: sellerName,
          seller_phone: shop.phone.trim(),
          location,
          shop_id: shop.id,
          listed_at: now,
        })
        .where(eq(listingsTable.id, product.listing_id));
    } else {
      await syncShopProductToListing(shop, product);
    }
  }
}

export async function validateShopProductCategoryId(categoryId: number): Promise<void> {
  const [cat] = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);
  if (!cat) throw new Error("Kategoria e produktit nuk u gjet.");
  await assertProductListingCategory(categoryId);
}
