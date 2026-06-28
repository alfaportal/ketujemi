import { db, listingsTable, shopApplicationsTable, shopsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { ensureShopSlug, shopPublicPath } from "./shop-slug.js";
import { backfillShopListingsForShop } from "./shop-listing-lookup.js";
import { scheduleShopSocialEnrich } from "./shop-social-enrich.js";
import { sendShopApprovedEmail } from "./send-shop-application-email.js";
import { resolveAdminShopDirectoryWithEnsure } from "./admin-shop-directory.js";

export type ShopDirectoryActivationFields = {
  directory_category_slug: string;
  directory_subcategory_slug: string;
  directory_category_id: number | null;
  directory_subcategory_id: number | null;
  category_label: string;
};

export type ApproveShopApplicationResult = {
  shop_id: number;
  slug: string | null;
  public_path: string;
  already_approved: boolean;
};

/** Create active shop row from application and link existing user listings. */
export async function approveShopApplication(
  applicationId: number,
  directoryFields?: ShopDirectoryActivationFields,
): Promise<ApproveShopApplicationResult> {
  const [app] = await db
    .select()
    .from(shopApplicationsTable)
    .where(eq(shopApplicationsTable.id, applicationId))
    .limit(1);
  if (!app) {
    throw new Error("NOT_FOUND");
  }

  if (app.status === "approved" && app.shop_id) {
    const [existing] = await db
      .select({ slug: shopsTable.slug })
      .from(shopsTable)
      .where(eq(shopsTable.id, app.shop_id))
      .limit(1);
    const slug = existing?.slug ?? null;
    return {
      shop_id: app.shop_id,
      slug,
      public_path: shopPublicPath(slug, app.shop_id),
      already_approved: true,
    };
  }

  let resolved = directoryFields;
  if (!resolved) {
    const catSlug = app.directory_category_slug?.trim();
    const subSlug = app.directory_subcategory_slug?.trim();
    if (!catSlug || !subSlug) {
      throw new Error("MISSING_DIRECTORY");
    }
    const fromDb = await resolveAdminShopDirectoryWithEnsure(catSlug, subSlug);
    resolved = fromDb;
  }

  const [shop] = await db
    .insert(shopsTable)
    .values({
      user_id: app.user_id,
      application_id: app.id,
      shop_name: app.shop_name,
      logo_url: app.logo_url,
      description: app.description,
      category: resolved.category_label || app.category,
      category_id: null,
      directory_category_slug: resolved.directory_category_slug,
      directory_subcategory_slug: resolved.directory_subcategory_slug,
      directory_category_id: resolved.directory_category_id,
      directory_subcategory_id: resolved.directory_subcategory_id,
      country: app.country,
      city: app.city,
      region: app.region,
      address: app.address,
      latitude: app.latitude,
      longitude: app.longitude,
      facebook: app.facebook,
      instagram: app.instagram,
      tiktok: app.tiktok,
      whatsapp: app.whatsapp,
      website: app.website,
      contact_name: app.contact_name,
      phone: app.phone,
      email: app.email,
      is_active: true,
      admin_notes: app.admin_notes,
    })
    .returning();

  await db
    .update(shopApplicationsTable)
    .set({
      category: resolved.category_label || app.category,
      directory_category_slug: resolved.directory_category_slug,
      directory_subcategory_slug: resolved.directory_subcategory_slug,
      directory_category_id: resolved.directory_category_id,
      directory_subcategory_id: resolved.directory_subcategory_id,
      status: "approved",
      shop_id: shop.id,
      rejected_reason: null,
    })
    .where(eq(shopApplicationsTable.id, app.id));

  await db
    .update(listingsTable)
    .set({ shop_id: shop.id })
    .where(and(eq(listingsTable.user_id, app.user_id), sql`${listingsTable.shop_id} IS NULL`));

  await backfillShopListingsForShop({
    id: shop.id,
    user_id: shop.user_id,
    phone: shop.phone,
    email: shop.email,
  }).catch(() => undefined);

  try {
    await sendShopApprovedEmail(app.email, app.shop_name, shop.id);
  } catch {
    /* non-blocking */
  }

  scheduleShopSocialEnrich(shop.id);

  const slug = (await ensureShopSlug(shop.id, shop.shop_name).catch(() => shop.slug ?? "")) || null;

  return {
    shop_id: shop.id,
    slug,
    public_path: shopPublicPath(slug, shop.id),
    already_approved: false,
  };
}
