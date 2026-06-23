import { and, eq, inArray, isNotNull, isNull, desc, or, sql } from "drizzle-orm";
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

/** Active shop for user — only when they own exactly one (never guess among several). */
export async function getApprovedShopIdForUser(userId: number): Promise<number | null> {
  const rows = await db
    .select({ id: shopsTable.id })
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, userId), activeShopSqlCondition()))
    .orderBy(desc(shopsTable.created_at));

  if (rows.length === 1) return rows[0]!.id;
  return null;
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

async function activeShopCountForUser(userId: number): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(shopsTable)
    .where(and(eq(shopsTable.user_id, userId), activeShopSqlCondition()));
  return row?.total ?? 0;
}

/** Find active shop for poster — never guess when multiple shops share the same account. */
export async function resolveShopIdForListingPoster(input: {
  userId: number;
  userEmail?: string | null;
  sellerPhone: string;
}): Promise<number | null> {
  const shopCount = await activeShopCountForUser(input.userId);
  if (shopCount === 1) {
    const sole = await getApprovedShopIdForUser(input.userId);
    if (sole) return sole;
  }
  if (shopCount > 1) {
    return null;
  }

  const email = input.userEmail?.trim().toLowerCase();
  if (email) {
    const shopsByEmail = await db
      .select({ id: shopsTable.id, user_id: shopsTable.user_id, email: shopsTable.email })
      .from(shopsTable)
      .where(
        and(activeShopSqlCondition(), sql`lower(trim(${shopsTable.email})) = ${email}`),
      )
      .orderBy(desc(shopsTable.created_at));
    if (shopsByEmail.length === 1) {
      const ownerIds = await resolveShopOwnerUserIds(shopsByEmail[0]!);
      if (ownerIds.includes(input.userId)) return shopsByEmail[0]!.id;
    }
  }

  const suffix = phoneSuffix8(input.sellerPhone);
  if (!suffix) return null;

  const shopsByPhone = await db
    .select({ id: shopsTable.id, user_id: shopsTable.user_id, email: shopsTable.email, phone: shopsTable.phone })
    .from(shopsTable)
    .where(
      and(
        activeShopSqlCondition(),
        sql`RIGHT(regexp_replace(${shopsTable.phone}, '\\D', '', 'g'), 8) = ${suffix}`,
      ),
    )
    .orderBy(desc(shopsTable.created_at));

  const ownedMatches: number[] = [];
  for (const shop of shopsByPhone) {
    const ownerIds = await resolveShopOwnerUserIds(shop);
    if (ownerIds.includes(input.userId)) ownedMatches.push(shop.id);
  }
  if (ownedMatches.length === 1) return ownedMatches[0]!;
  return null;
}

/** Link orphan listings to shop only when poster owns exactly this shop account. */
export async function backfillShopIdOnUserListings(
  userId: number,
  shopId: number,
): Promise<number> {
  const shopCount = await activeShopCountForUser(userId);
  if (shopCount !== 1) return 0;

  const soleShopId = await getApprovedShopIdForUser(userId);
  if (soleShopId !== shopId) return 0;

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

function listingBelongsToShop(
  listing: { user_id: number; seller_phone: string },
  shop: { id: number; user_id: number; phone: string; email?: string | null },
  ownerUserIds: number[],
  shopCountForOwner: number,
): boolean {
  if (listing.user_id === shop.user_id && shopCountForOwner === 1) return true;
  if (ownerUserIds.includes(listing.user_id) && shopCountForOwner === 1) return true;
  if (phonesMatch(listing.seller_phone, shop.phone)) return true;
  return false;
}

/** Safe backfill — only sole-shop owners; never bulk-link by phone across the marketplace. */
export async function backfillShopListingsForShop(shop: {
  id: number;
  user_id: number;
  phone: string;
  email?: string | null;
}): Promise<number> {
  const shopCount = await activeShopCountForUser(shop.user_id);
  if (shopCount !== 1) return 0;

  return backfillShopIdOnUserListings(shop.user_id, shop.id);
}

/** Public shop page — only listings explicitly tagged with this shop_id. */
export function shopPublicListingsCondition(shop: { id: number }) {
  return and(eq(listingsTable.shop_id, shop.id), activeListingSqlCondition());
}

/** After posting, link only this listing when shop is unambiguous. */
export async function linkNewListingToMatchingShop(input: {
  userId: number;
  userEmail?: string | null;
  sellerPhone: string;
  listingId: number;
}): Promise<void> {
  const shopId = await resolveShopIdForListingPoster(input);
  if (!shopId) return;

  await db
    .update(listingsTable)
    .set({ shop_id: shopId })
    .where(and(eq(listingsTable.id, input.listingId), isNull(listingsTable.shop_id)));
}

/**
 * Idempotent guard — run after listing create when shop is unambiguous.
 */
export async function ensureListingLinkedToOwnerShop(input: {
  userId: number;
  userEmail?: string | null;
  sellerPhone: string;
  listingId: number;
}): Promise<number | null> {
  const expectedShopId = await resolveShopIdForListingPoster(input);
  if (!expectedShopId) return null;

  await linkNewListingToMatchingShop(input);

  const [listing] = await db
    .select({ shop_id: listingsTable.shop_id })
    .from(listingsTable)
    .where(eq(listingsTable.id, input.listingId))
    .limit(1);

  return listing?.shop_id ?? null;
}

/** Fix wrong shop_id from old phone/user backfills; re-link only unambiguous orphans. */
export async function reconcileShopListingAssignments(): Promise<{ unlinked: number; linked: number }> {
  const shops = await db
    .select()
    .from(shopsTable)
    .where(activeShopSqlCondition());

  const shopById = new Map(shops.map((s) => [s.id, s]));
  const ownerIdsByShop = new Map<number, number[]>();
  const shopCountByUser = new Map<number, number>();

  for (const shop of shops) {
    ownerIdsByShop.set(shop.id, await resolveShopOwnerUserIds(shop));
    shopCountByUser.set(shop.user_id, (shopCountByUser.get(shop.user_id) ?? 0) + 1);
  }

  const linkedRows = await db
    .select({
      id: listingsTable.id,
      shop_id: listingsTable.shop_id,
      user_id: listingsTable.user_id,
      seller_phone: listingsTable.seller_phone,
    })
    .from(listingsTable)
    .where(isNotNull(listingsTable.shop_id));

  let unlinked = 0;
  for (const listing of linkedRows) {
    const shopId = listing.shop_id!;
    const shop = shopById.get(shopId);
    if (!shop) {
      await db.update(listingsTable).set({ shop_id: null }).where(eq(listingsTable.id, listing.id));
      unlinked++;
      continue;
    }

    const ownerIds = ownerIdsByShop.get(shopId) ?? [];
    const shopCount = shopCountByUser.get(shop.user_id) ?? 1;
    if (shopCount > 1) {
      const phone = listing.seller_phone?.trim();
      if (phone) {
        const matches = shops.filter((s) => phonesMatch(phone, s.phone));
        if (matches.length === 1 && matches[0]!.id !== shopId) {
          await db
            .update(listingsTable)
            .set({ shop_id: matches[0]!.id })
            .where(eq(listingsTable.id, listing.id));
        }
      }
      continue;
    }

    if (listingBelongsToShop(listing, shop, ownerIds, shopCount)) continue;

    await db.update(listingsTable).set({ shop_id: null }).where(eq(listingsTable.id, listing.id));
    unlinked++;
  }

  let linked = 0;
  for (const shop of shops) {
    linked += await backfillShopListingsForShop(shop);
  }

  const orphans = await db
    .select({
      id: listingsTable.id,
      seller_phone: listingsTable.seller_phone,
    })
    .from(listingsTable)
    .where(isNull(listingsTable.shop_id))
    .limit(2000);

  for (const listing of orphans) {
    const phone = listing.seller_phone?.trim();
    if (!phone) continue;

    const matches = shops.filter((s) => phonesMatch(phone, s.phone));
    if (matches.length !== 1) continue;

    await db
      .update(listingsTable)
      .set({ shop_id: matches[0]!.id })
      .where(eq(listingsTable.id, listing.id));
    linked++;
  }

  if (unlinked > 0 || linked > 0) {
    logger.info({ unlinked, linked }, "shop listing assignments reconciled");
  }
  return { unlinked, linked };
}

async function activeShopMap(shopIds: number[]) {
  const unique = [...new Set(shopIds.filter((id) => id > 0))];
  const map = new Map<number, typeof shopsTable.$inferSelect>();
  if (unique.length === 0) return map;

  const rows = await db
    .select()
    .from(shopsTable)
    .where(and(inArray(shopsTable.id, unique), activeShopSqlCondition()));

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

let lastReconcileAt = 0;
const RECONCILE_TTL_MS = 60_000;

/** Repair mixed shop listings — at most once per minute (e.g. on /dyqanet load). */
export async function reconcileShopListingAssignmentsIfStale(): Promise<void> {
  const now = Date.now();
  if (now - lastReconcileAt < RECONCILE_TTL_MS) return;
  lastReconcileAt = now;
  await reconcileShopListingAssignments().catch((err) => {
    logger.warn({ err }, "reconcileShopListingAssignments failed");
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
