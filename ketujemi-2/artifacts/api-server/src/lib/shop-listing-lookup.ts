import { and, eq, inArray } from "drizzle-orm";
import { db, shopsTable } from "@workspace/db";
import { annotateListingsWithVipFlag } from "./vip-seller-lookup";
import {
  getShopSocialProfilesForShops,
  type ShopSocialProfileApi,
} from "./shop-social-enrich.js";

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
    .where(and(eq(shopsTable.user_id, userId), eq(shopsTable.is_active, true)))
    .limit(1);
  return shop?.id ?? null;
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
  const withVip = await annotateListingsWithVipFlag(listings);
  return annotateListingsWithShopInfo(withVip);
}
