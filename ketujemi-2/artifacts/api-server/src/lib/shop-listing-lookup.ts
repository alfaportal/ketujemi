import { and, eq, inArray, isNull, desc, or, sql } from "drizzle-orm";
import { db, listingsTable, shopsTable, usersTable } from "@workspace/db";
import { annotateListingsWithVipFlag } from "./vip-seller-lookup";
import {
  getShopSocialProfilesForShops,
  type ShopSocialProfileApi,
} from "./shop-social-enrich.js";
import { activeShopSqlCondition } from "./shop-visibility.js";
import { activeListingSqlCondition } from "./listing-visibility.js";
import { normalizePhoneDigits, phonesMatch } from "./listing-ownership.js";
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

/** Resolve all user ids that own this shop (account id + matching login email). */
export async function resolveShopOwnerUserIds(shop: {
  user_id: number;
  email?: string | null;
}): Promise<number[]> {
  const ids = new Set<number>([shop.user_id]);
  const email = shop.email?.trim().toLowerCase();
  if (email) {
    const rows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(sql`lower(trim(${usersTable.email})) = ${email}`);
    for (const row of rows) ids.add(row.id);
  }
  return [...ids];
}

/** Find active shop for poster — by account, then shop email, then phone. */
export async function resolveShopIdForListingPoster(input: {
  userId: number;
  userEmail?: string | null;
  sellerPhone: string;
}): Promise<number | null> {
  const byUser = await getApprovedShopIdForUser(input.userId);
  if (byUser) return byUser;

  const email = input.userEmail?.trim().toLowerCase();
  if (email) {
    const [shopByEmail] = await db
      .select({ id: shopsTable.id })
      .from(shopsTable)
      .where(
        and(activeShopSqlCondition(), sql`lower(trim(${shopsTable.email})) = ${email}`),
      )
      .orderBy(desc(shopsTable.created_at))
      .limit(1);
    if (shopByEmail) return shopByEmail.id;
  }

  const suffix = phoneSuffix8(input.sellerPhone);
  if (!suffix) return null;

  const [shopByPhone] = await db
    .select({ id: shopsTable.id })
    .from(shopsTable)
    .where(
      and(
        activeShopSqlCondition(),
        sql`RIGHT(regexp_replace(${shopsTable.phone}, '\\D', '', 'g'), 8) = ${suffix}`,
      ),
    )
    .orderBy(desc(shopsTable.created_at))
    .limit(1);
  return shopByPhone?.id ?? null;
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

/** Backfill by user_id, email, and phone (same rules as phonesMatch). */
export async function backfillShopListingsForShop(shop: {
  id: number;
  user_id: number;
  phone: string;
  email?: string | null;
}): Promise<number> {
  const ownerUserIds = await resolveShopOwnerUserIds(shop);
  let linked = 0;

  for (const userId of ownerUserIds) {
    linked += await backfillShopIdOnUserListings(userId, shop.id);
  }

  const email = shop.email?.trim().toLowerCase();
  if (email) {
    const byEmail = await db
      .update(listingsTable)
      .set({ shop_id: shop.id })
      .from(usersTable)
      .where(
        and(
          eq(listingsTable.user_id, usersTable.id),
          isNull(listingsTable.shop_id),
          sql`lower(trim(${usersTable.email})) = ${email}`,
        ),
      )
      .returning({ id: listingsTable.id });
    linked += byEmail.length;
  }

  const orphans = await db
    .select({ id: listingsTable.id, seller_phone: listingsTable.seller_phone })
    .from(listingsTable)
    .where(isNull(listingsTable.shop_id))
    .limit(1000);

  const phoneIds = orphans
    .filter((row) => phonesMatch(row.seller_phone, shop.phone))
    .map((row) => row.id);

  if (phoneIds.length > 0) {
    const byPhone = await db
      .update(listingsTable)
      .set({ shop_id: shop.id })
      .where(inArray(listingsTable.id, phoneIds))
      .returning({ id: listingsTable.id });
    linked += byPhone.length;
  }

  if (linked > 0) {
    logger.info({ shopId: shop.id, linked, ownerUserIds }, "shop listings backfilled");
  }
  return linked;
}

/** Public shop page — listings owned by or linked to this shop. */
export function shopPublicListingsCondition(shop: {
  id: number;
  user_id: number;
  phone: string;
  ownerUserIds?: number[];
}) {
  const ownerIds =
    shop.ownerUserIds && shop.ownerUserIds.length > 0 ? shop.ownerUserIds : [shop.user_id];
  const suffix = phoneSuffix8(shop.phone);
  const orphanMatch = or(
    inArray(listingsTable.user_id, ownerIds),
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
  userEmail?: string | null;
  sellerPhone: string;
  listingId: number;
}): Promise<void> {
  const shopId = await resolveShopIdForListingPoster(input);
  if (!shopId) return;

  const [shop] = await db
    .select({
      id: shopsTable.id,
      user_id: shopsTable.user_id,
      phone: shopsTable.phone,
      email: shopsTable.email,
    })
    .from(shopsTable)
    .where(eq(shopsTable.id, shopId))
    .limit(1);

  if (!shop) return;

  await db
    .update(listingsTable)
    .set({ shop_id: shop.id })
    .where(eq(listingsTable.id, input.listingId));

  await backfillShopListingsForShop(shop);
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
