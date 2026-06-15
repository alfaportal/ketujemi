import { and, eq, inArray, isNull, desc, or, sql } from "drizzle-orm";
import { db, listingsTable, shopsTable } from "@workspace/db";
import { annotateListingsWithVipFlag } from "./vip-seller-lookup";
import {
  getShopSocialProfilesForShops,
  type ShopSocialProfileApi,
} from "./shop-social-enrich.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { normalizePhoneDigits } from "./listing-ownership.js";
import { logger } from "./logger.js";

const EMPTY_SHOP_FIELDS: ShopListingFields = {
  shop_id: null,
  shop_name: null,
  shop_logo_url: null,
  shop_category: null,
  shop_city: null,
  shop_facebook: null,
  shop_instagram: null,
  shop_tiktok: null,
  shop_whatsapp: null,
  shop_website: null,
  shop_verified: false,
  shop_social_profiles: undefined,
};

export type ShopListingFields = {
  shop_id: number | null;
  shop_name: string | null;
  shop_logo_url: string | null;
  shop_category: string | null;
  shop_city: string | null;
  shop_facebook: string | null;
  shop_instagram: string | null;
  shop_tiktok: string | null;
  shop_whatsapp: string | null;
  shop_website: string | null;
  shop_verified: boolean;
  shop_social_profiles?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileApi>>;
};

export async function getApprovedShopIdForUser(userId: number): Promise<number | null> {
  const [shop] = await db
    .select({ id: shopsTable.id })
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, userId), activeShopSqlCondition()))
    .orderBy(desc(shopsTable.created_at))
    .limit(1);
  return shop?.id ?? null;
}

/** Link orphan listings (shop_id NULL) from a shop owner to their active shop. */
export async function backfillShopIdOnUserListings(
  userId: number,
  shopId: number,
): Promise<number> {
  const updated = await db
    .update(listingsTable)
    .set({ shop_id: shopId })
    .where(and(eq(listingsTable.user_id, userId), isNull(listingsTable.shop_id)))
    .returning({ id: listingsTable.id });
  return updated.length;
}

function phoneSuffix8(phone: string | null | undefined): string | null {
  const digits = normalizePhoneDigits(phone ?? "");
  if (digits.length < 8) return null;
  return digits.slice(-8);
}

/** Backfill by user_id and by matching seller phone (handles duplicate OAuth/email accounts). */
export async function backfillShopListingsForShop(shop: {
  id: number;
  user_id: number;
  phone: string;
}): Promise<number> {
  let linked = await backfillShopIdOnUserListings(shop.user_id, shop.id);

  const suffix = phoneSuffix8(shop.phone);
  if (suffix) {
    const byPhone = await db
      .update(listingsTable)
      .set({ shop_id: shop.id })
      .where(
        and(
          isNull(listingsTable.shop_id),
          sql`RIGHT(regexp_replace(${listingsTable.seller_phone}, '\\D', '', 'g'), 8) = ${suffix}`,
        ),
      )
      .returning({ id: listingsTable.id });
    linked += byPhone.length;
  }

  if (linked > 0) {
    logger.info({ shopId: shop.id, linked }, "shop listings backfilled");
  }
  return linked;
}

/** Public shop page — listings owned by or linked to this shop. */
export function shopPublicListingsCondition(shop: {
  id: number;
  user_id: number;
  phone: string;
}) {
  const suffix = phoneSuffix8(shop.phone);
  const orphanMatch = or(
    eq(listingsTable.user_id, shop.user_id),
    suffix
      ? sql`RIGHT(regexp_replace(${listingsTable.seller_phone}, '\\D', '', 'g'), 8) = ${suffix}`
      : sql`false`,
  );

  return and(
    or(eq(listingsTable.shop_id, shop.id), and(isNull(listingsTable.shop_id), orphanMatch)),
    activeListingSqlCondition(),
  );
}

/** After posting, link listing to any shop whose phone matches the seller contact. */
export async function linkNewListingToMatchingShop(input: {
  userId: number;
  sellerPhone: string;
  listingId: number;
}): Promise<void> {
  const [shopByUser] = await db
    .select({ id: shopsTable.id, user_id: shopsTable.user_id, phone: shopsTable.phone })
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, input.userId), activeShopSqlCondition()))
    .orderBy(desc(shopsTable.created_at))
    .limit(1);

  if (shopByUser) {
    await db
      .update(listingsTable)
      .set({ shop_id: shopByUser.id })
      .where(eq(listingsTable.id, input.listingId));
    await backfillShopListingsForShop(shopByUser);
    return;
  }

  const suffix = phoneSuffix8(input.sellerPhone);
  if (!suffix) return;

  const [shopByPhone] = await db
    .select({ id: shopsTable.id, user_id: shopsTable.user_id, phone: shopsTable.phone })
    .from(shopsTable)
    .where(
      and(
        activeShopSqlCondition(),
        sql`RIGHT(regexp_replace(${shopsTable.phone}, '\\D', '', 'g'), 8) = ${suffix}`,
      ),
    )
    .orderBy(desc(shopsTable.created_at))
    .limit(1);

  if (!shopByPhone) return;

  await db
    .update(listingsTable)
    .set({ shop_id: shopByPhone.id })
    .where(eq(listingsTable.id, input.listingId));

  await backfillShopListingsForShop(shopByPhone);
}

async function activeShopMap(shopIds: number[]) {
  const unique = [...new Set(shopIds.filter((id) => id > 0))];
  const map = new Map<number, typeof shopsTable.$inferSelect>();
  if (unique.length === 0) return map;

  const rows = await db
    .select()
    .from(shopsTable)
    .where(and(inArray(shopsTable.id, unique), eq(shopsTable.is_active, true)));

  for (const row of rows) map.set(row.id, row);
  return map;
}

export async function annotateListingsWithShopInfo<
  T extends { shop_id?: number | null },
>(listings: T[]): Promise<(T & ShopListingFields)[]> {
  if (listings.length === 0) return [];

  const shopIds = listings
    .map((l) => l.shop_id)
    .filter((id): id is number => typeof id === "number" && id > 0);
  const shopMap = await activeShopMap(shopIds);
  const socialMap = await getShopSocialProfilesForShops(shopIds);

  return listings.map((listing) => {
    const shop = listing.shop_id ? shopMap.get(listing.shop_id) : undefined;
    return {
      ...listing,
      shop_id: listing.shop_id ?? null,
      shop_name: shop?.shop_name ?? null,
      shop_logo_url: shop?.logo_url ?? null,
      shop_category: shop?.category ?? null,
      shop_city: shop?.city ?? null,
      shop_facebook: shop?.facebook ?? null,
      shop_instagram: shop?.instagram ?? null,
      shop_tiktok: shop?.tiktok ?? null,
      shop_whatsapp: shop?.whatsapp ?? null,
      shop_website: shop?.website ?? null,
      shop_verified: !!shop,
      shop_social_profiles: listing.shop_id ? socialMap.get(listing.shop_id) : undefined,
    };
  });
}

export async function finalizeListingsForApi<
  T extends { seller_phone: string; description: string; shop_id?: number | null },
>(listings: T[]) {
  if (listings.length === 0) return [];
  try {
    const withVip = await annotateListingsWithVipFlag(listings);
    return await annotateListingsWithShopInfo(withVip);
  } catch (err) {
    logger.warn({ err }, "finalizeListingsForApi failed — returning base payloads");
    return listings.map((listing) => ({
      ...listing,
      is_vip_seller: false,
      ...EMPTY_SHOP_FIELDS,
      shop_id: listing.shop_id ?? null,
    }));
  }
}
