import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  shopSocialProfileEnrichmentsTable,
  shopsTable,
  userSocialConnectionsTable,
  type Shop,
  type ShopSocialPlatform,
} from "@workspace/db";
import { uploadRemoteImageToCloudinary } from "./cloudinary-upload-remote.js";
import {
  fetchInstagramPublicProfile,
  fetchTikTokPublicProfile,
} from "./social-profile-fetch.js";
import { handlesMatch, parseInstagramUrl, parseTikTokUrl } from "./social-url-parser.js";
import { logger } from "./logger.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ShopSocialProfileApi = {
  handle: string;
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number | null;
  profile_url: string;
  link_valid: boolean;
  oauth_verified: boolean;
  verification_method: string | null;
  fetch_status: string;
  fetched_at: string | null;
};

type Target = {
  platform: ShopSocialPlatform;
  parsed: ReturnType<typeof parseInstagramUrl>;
};

function targetsFromShop(shop: Shop): Target[] {
  const out: Target[] = [];
  const ig = parseInstagramUrl(shop.instagram);
  if (ig) out.push({ platform: "instagram", parsed: ig });
  const tt = parseTikTokUrl(shop.tiktok);
  if (tt) out.push({ platform: "tiktok", parsed: tt });
  return out;
}

async function resolveOAuthVerification(
  userId: number,
  platform: ShopSocialPlatform,
  handle: string,
): Promise<{ oauth_verified: boolean; verification_method: string | null }> {
  const rows = await db
    .select()
    .from(userSocialConnectionsTable)
    .where(eq(userSocialConnectionsTable.user_id, userId));

  if (platform === "tiktok") {
    const tiktok = rows.find((r) => r.platform === "tiktok");
    if (tiktok?.username && handlesMatch(tiktok.username, handle)) {
      return { oauth_verified: true, verification_method: "oauth_tiktok" };
    }
  }

  if (platform === "instagram") {
    const ig = rows.find((r) => r.platform === "instagram");
    if (ig?.username && handlesMatch(ig.username, handle)) {
      return { oauth_verified: true, verification_method: "oauth_instagram" };
    }
  }

  return { oauth_verified: false, verification_method: null };
}

async function cacheAvatar(
  remoteUrl: string | null,
  shopId: number,
  platform: ShopSocialPlatform,
  handle: string,
): Promise<string | null> {
  if (!remoteUrl?.trim()) return null;
  return uploadRemoteImageToCloudinary(
    remoteUrl.trim(),
    "shop-social-avatars",
    `shop-${shopId}-${platform}-${handle}`,
  );
}

export async function enrichShopSocialPlatform(
  shop: Shop,
  platform: ShopSocialPlatform,
  parsed: NonNullable<Target["parsed"]>,
): Promise<void> {
  const fetched =
    platform === "instagram"
      ? await fetchInstagramPublicProfile(parsed.handle, parsed.profileUrl)
      : await fetchTikTokPublicProfile(parsed.handle, parsed.profileUrl);

  const oauth = await resolveOAuthVerification(shop.user_id, platform, parsed.handle);
  const avatar =
    (await cacheAvatar(fetched.avatar_url, shop.id, platform, parsed.handle)) ??
    fetched.avatar_url;

  const now = new Date();
  const nextFetch = new Date(now.getTime() + DAY_MS);

  await db
    .insert(shopSocialProfileEnrichmentsTable)
    .values({
      shop_id: shop.id,
      platform,
      source_url: parsed.sourceUrl,
      handle: parsed.handle,
      display_name: fetched.display_name,
      avatar_url: avatar,
      follower_count: fetched.follower_count,
      profile_url: fetched.profile_url,
      fetch_status: fetched.fetch_status,
      link_valid: fetched.link_valid,
      oauth_verified: oauth.oauth_verified,
      verification_method: oauth.verification_method,
      fetched_at: now,
      next_fetch_at: nextFetch,
      raw_json: JSON.stringify(fetched.raw_json),
    })
    .onConflictDoUpdate({
      target: [
        shopSocialProfileEnrichmentsTable.shop_id,
        shopSocialProfileEnrichmentsTable.platform,
      ],
      set: {
        source_url: parsed.sourceUrl,
        handle: parsed.handle,
        display_name: fetched.display_name,
        avatar_url: avatar,
        follower_count: fetched.follower_count,
        profile_url: fetched.profile_url,
        fetch_status: fetched.fetch_status,
        link_valid: fetched.link_valid,
        oauth_verified: oauth.oauth_verified,
        verification_method: oauth.verification_method,
        fetched_at: now,
        next_fetch_at: nextFetch,
        raw_json: JSON.stringify(fetched.raw_json),
      },
    });
}

export async function syncShopSocialEnrichments(shopId: number): Promise<void> {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, shopId)).limit(1);
  if (!shop?.is_active) return;

  const targets = targetsFromShop(shop);
  const activePlatforms = new Set(targets.map((t) => t.platform));

  for (const target of targets) {
    if (!target.parsed) continue;
    try {
      await enrichShopSocialPlatform(shop, target.platform, target.parsed);
    } catch (err) {
      logger.warn({ err, shopId, platform: target.platform }, "shop social enrich failed");
    }
  }

  const existing = await db
    .select({ platform: shopSocialProfileEnrichmentsTable.platform })
    .from(shopSocialProfileEnrichmentsTable)
    .where(eq(shopSocialProfileEnrichmentsTable.shop_id, shopId));

  for (const row of existing) {
    if (!activePlatforms.has(row.platform as ShopSocialPlatform)) {
      await db
        .delete(shopSocialProfileEnrichmentsTable)
        .where(
          and(
            eq(shopSocialProfileEnrichmentsTable.shop_id, shopId),
            eq(shopSocialProfileEnrichmentsTable.platform, row.platform),
          ),
        );
    }
  }
}

export function scheduleShopSocialEnrich(shopId: number): void {
  void syncShopSocialEnrichments(shopId).catch((err) => {
    logger.warn({ err, shopId }, "async shop social enrich failed");
  });
}

/** Re-check OAuth badges after TikTok/Facebook login. */
export function scheduleShopSocialEnrichForUser(userId: number): void {
  void (async () => {
    const [shop] = await db
      .select({ id: shopsTable.id })
      .from(shopsTable)
      .where(and(eq(shopsTable.user_id, userId), eq(shopsTable.is_active, true)))
      .limit(1);
    if (shop) await syncShopSocialEnrichments(shop.id);
  })().catch((err) => {
    logger.warn({ err, userId }, "async user shop social enrich failed");
  });
}

export async function getShopSocialProfilesForApi(
  shopId: number,
): Promise<Partial<Record<ShopSocialPlatform, ShopSocialProfileApi>>> {
  const rows = await db
    .select()
    .from(shopSocialProfileEnrichmentsTable)
    .where(eq(shopSocialProfileEnrichmentsTable.shop_id, shopId));

  const out: Partial<Record<ShopSocialPlatform, ShopSocialProfileApi>> = {};
  for (const row of rows) {
    const platform = row.platform as ShopSocialPlatform;
    if (platform !== "instagram" && platform !== "tiktok") continue;
    out[platform] = {
      handle: row.handle,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      follower_count: row.follower_count,
      profile_url: row.profile_url ?? "",
      link_valid: row.link_valid,
      oauth_verified: row.oauth_verified,
      verification_method: row.verification_method,
      fetch_status: row.fetch_status,
      fetched_at: row.fetched_at?.toISOString() ?? null,
    };
  }
  return out;
}

export async function getShopSocialProfilesForShops(
  shopIds: number[],
): Promise<Map<number, Partial<Record<ShopSocialPlatform, ShopSocialProfileApi>>>> {
  const unique = [...new Set(shopIds.filter((id) => id > 0))];
  const map = new Map<number, Partial<Record<ShopSocialPlatform, ShopSocialProfileApi>>>();
  if (unique.length === 0) return map;

  const rows = await db
    .select()
    .from(shopSocialProfileEnrichmentsTable)
    .where(inArray(shopSocialProfileEnrichmentsTable.shop_id, unique));

  for (const row of rows) {
    const platform = row.platform as ShopSocialPlatform;
    if (platform !== "instagram" && platform !== "tiktok") continue;
    const existing = map.get(row.shop_id) ?? {};
    existing[platform] = {
      handle: row.handle,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      follower_count: row.follower_count,
      profile_url: row.profile_url ?? "",
      link_valid: row.link_valid,
      oauth_verified: row.oauth_verified,
      verification_method: row.verification_method,
      fetch_status: row.fetch_status,
      fetched_at: row.fetched_at?.toISOString() ?? null,
    };
    map.set(row.shop_id, existing);
  }
  return map;
}

const CRON_BATCH_SIZE = 40;
const CRON_BATCH_PAUSE_MS = 800;

function shopHasSocialUrl(shop: Shop): boolean {
  return Boolean(parseInstagramUrl(shop.instagram) || parseTikTokUrl(shop.tiktok));
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Process every active shop with IG/TikTok — no row limit, batched for rate limits. */
export async function runShopSocialEnrichDailySync(): Promise<{
  processed: number;
  errors: number;
  total: number;
}> {
  const allActive = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.is_active, true));

  const targets = allActive.filter(shopHasSocialUrl);
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < targets.length; i += CRON_BATCH_SIZE) {
    const batch = targets.slice(i, i + CRON_BATCH_SIZE);
    for (const shop of batch) {
      try {
        await syncShopSocialEnrichments(shop.id);
        processed += 1;
      } catch (err) {
        errors += 1;
        logger.warn({ err, shopId: shop.id }, "daily shop social enrich failed");
      }
    }
    if (i + CRON_BATCH_SIZE < targets.length) {
      await pause(CRON_BATCH_PAUSE_MS);
    }
  }

  return { processed, errors, total: targets.length };
}

export async function listShopSocialEnrichmentsForAdmin(opts?: {
  page?: number;
  limit?: number;
}): Promise<{
  rows: Array<{
    id: number;
    shop_id: number;
    shop_name: string;
    platform: string;
    handle: string;
    display_name: string | null;
    follower_count: number | null;
    link_valid: boolean;
    oauth_verified: boolean;
    fetch_status: string;
    fetched_at: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
}> {
  const page = Math.max(1, opts?.page ?? 1);
  const limit = Math.min(200, Math.max(1, opts?.limit ?? 50));
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: shopSocialProfileEnrichmentsTable.id,
      shop_id: shopSocialProfileEnrichmentsTable.shop_id,
      shop_name: shopsTable.shop_name,
      platform: shopSocialProfileEnrichmentsTable.platform,
      handle: shopSocialProfileEnrichmentsTable.handle,
      display_name: shopSocialProfileEnrichmentsTable.display_name,
      follower_count: shopSocialProfileEnrichmentsTable.follower_count,
      link_valid: shopSocialProfileEnrichmentsTable.link_valid,
      oauth_verified: shopSocialProfileEnrichmentsTable.oauth_verified,
      fetch_status: shopSocialProfileEnrichmentsTable.fetch_status,
      fetched_at: shopSocialProfileEnrichmentsTable.fetched_at,
    })
    .from(shopSocialProfileEnrichmentsTable)
    .innerJoin(shopsTable, eq(shopSocialProfileEnrichmentsTable.shop_id, shopsTable.id))
    .orderBy(desc(shopSocialProfileEnrichmentsTable.fetched_at))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(shopSocialProfileEnrichmentsTable);

  return {
    rows: rows.map((r) => ({
      ...r,
      fetched_at: r.fetched_at?.toISOString() ?? null,
    })),
    total: countRow?.count ?? 0,
    page,
    limit,
  };
}
