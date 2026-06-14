import { adminSettingsTable, db, socialFollowersTable } from "@workspace/db";
import type { SocialFollowerPlatform } from "@workspace/db";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import {
  fetchInstagramFollowersFromGraph,
  parseInstagramFollowersExport,
  type FetchedFollower,
} from "./instagram-followers-fetch.js";
import { fetchFacebookFollowersFromGraph } from "./facebook-followers-fetch.js";
import { logger } from "./logger.js";

const PLATFORMS: SocialFollowerPlatform[] = ["instagram", "facebook", "tiktok"];

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function apiCountSettingKey(platform: SocialFollowerPlatform): string {
  return `social_followers_api_count_${platform}`;
}

function apiSyncedAtSettingKey(platform: SocialFollowerPlatform): string {
  return `social_followers_api_synced_at_${platform}`;
}

export type SocialFollowersManualPlatform = "tiktok" | "facebook_personal";

const MANUAL_COUNT_SETTING_KEYS: Record<SocialFollowersManualPlatform, string> = {
  tiktok: "social_followers_manual_count_tiktok",
  facebook_personal: "social_followers_manual_count_facebook_personal",
};

const MANUAL_UPDATED_AT_SETTING_KEYS: Record<SocialFollowersManualPlatform, string> = {
  tiktok: "social_followers_manual_updated_at_tiktok",
  facebook_personal: "social_followers_manual_updated_at_facebook_personal",
};

export type SocialFollowersManualStats = Record<
  SocialFollowersManualPlatform,
  { count: number | null; updated_at: string | null }
>;

async function upsertAdminSetting(key: string, value: string): Promise<void> {
  await db
    .insert(adminSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({
      target: adminSettingsTable.key,
      set: { value },
    });
}

async function readAdminSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select({ value: adminSettingsTable.value })
    .from(adminSettingsTable)
    .where(eq(adminSettingsTable.key, key))
    .limit(1);
  return row?.value?.trim() || null;
}

/** Compare API/import list with DB; add new followers, mark missing as unfollowed. */
export async function syncFollowersForPlatform(
  platform: SocialFollowerPlatform,
  incoming: FetchedFollower[],
): Promise<{
  added: number;
  reactivated: number;
  unfollowed: number;
  skipped: boolean;
  reason?: string;
}> {
  if (incoming.length === 0) {
    return { added: 0, reactivated: 0, unfollowed: 0, skipped: true, reason: "empty_list" };
  }

  const now = new Date();
  const incomingByUsername = new Map<string, FetchedFollower>();
  for (const f of incoming) {
    const u = f.username.trim().replace(/^@/, "").toLowerCase();
    if (u) incomingByUsername.set(u, { ...f, username: u });
  }

  const existing = await db
    .select()
    .from(socialFollowersTable)
    .where(eq(socialFollowersTable.platform, platform));

  const existingByUsername = new Map(existing.map((r) => [r.follower_username.toLowerCase(), r]));

  let added = 0;
  let reactivated = 0;

  for (const [username, row] of incomingByUsername) {
    const prev = existingByUsername.get(username);
    if (!prev) {
      await db.insert(socialFollowersTable).values({
        platform,
        follower_username: username,
        follower_id: row.id,
        followed_at: row.followedAt ?? now,
        is_active: true,
        unfollowed_at: null,
      });
      added += 1;
      continue;
    }

    if (!prev.is_active) {
      await db
        .update(socialFollowersTable)
        .set({
          is_active: true,
          unfollowed_at: null,
          follower_id: row.id ?? prev.follower_id,
          followed_at: row.followedAt ?? prev.followed_at ?? now,
        })
        .where(eq(socialFollowersTable.id, prev.id));
      reactivated += 1;
    } else if (row.id && !prev.follower_id) {
      await db
        .update(socialFollowersTable)
        .set({ follower_id: row.id })
        .where(eq(socialFollowersTable.id, prev.id));
    }
  }

  let unfollowed = 0;
  for (const row of existing) {
    if (!row.is_active) continue;
    if (!incomingByUsername.has(row.follower_username.toLowerCase())) {
      await db
        .update(socialFollowersTable)
        .set({ is_active: false, unfollowed_at: now })
        .where(eq(socialFollowersTable.id, row.id));
      unfollowed += 1;
    }
  }

  return { added, reactivated, unfollowed, skipped: false };
}

type PlatformSyncResult = {
  ok: boolean;
  platform: SocialFollowerPlatform;
  listSynced: boolean;
  totalCount: number | null;
  added: number;
  reactivated: number;
  unfollowed: number;
  message: string;
};

async function runPlatformFollowersSync(
  platform: SocialFollowerPlatform,
  fetched: {
    followers: FetchedFollower[];
    totalCount: number | null;
    listAvailable: boolean;
  },
  emptyListMessage: string,
): Promise<PlatformSyncResult> {
  if (fetched.totalCount != null) {
    await upsertAdminSetting(apiCountSettingKey(platform), String(fetched.totalCount));
    await upsertAdminSetting(apiSyncedAtSettingKey(platform), new Date().toISOString());
  }

  if (!fetched.listAvailable || fetched.followers.length === 0) {
    logger.warn(
      {
        platform,
        totalCount: fetched.totalCount,
        dbActive: await countActiveFollowers(platform),
      },
      emptyListMessage,
    );
    return {
      ok: true,
      platform,
      listSynced: false,
      totalCount: fetched.totalCount,
      added: 0,
      reactivated: 0,
      unfollowed: 0,
      message: emptyListMessage,
    };
  }

  const result = await syncFollowersForPlatform(platform, fetched.followers);
  logger.info({ platform, ...result, totalCount: fetched.totalCount }, "social followers sync complete");

  return {
    ok: true,
    platform,
    listSynced: true,
    totalCount: fetched.totalCount,
    added: result.added,
    reactivated: result.reactivated,
    unfollowed: result.unfollowed,
    message: `${platform} followers synced from Graph API`,
  };
}

export async function runInstagramFollowersSync(): Promise<PlatformSyncResult> {
  const fetched = await fetchInstagramFollowersFromGraph();
  return runPlatformFollowersSync(
    "instagram",
    fetched,
    "Instagram API returned follower count only (no individual list). Import followers JSON in admin.",
  );
}

export async function runFacebookFollowersSync(): Promise<PlatformSyncResult> {
  const fetched = await fetchFacebookFollowersFromGraph();
  return runPlatformFollowersSync(
    "facebook",
    fetched,
    "Facebook API returned fan count only (no individual fan list). Import or wait for Graph API access.",
  );
}

export async function runTikTokFollowersSync(): Promise<PlatformSyncResult> {
  return {
    ok: true,
    platform: "tiktok",
    listSynced: false,
    totalCount: null,
    added: 0,
    reactivated: 0,
    unfollowed: 0,
    message: "TikTok follower sync not configured — add TikTok API credentials when available.",
  };
}

export async function runSocialFollowersDailySync(): Promise<{
  instagram: PlatformSyncResult;
  facebook: PlatformSyncResult;
  tiktok: PlatformSyncResult;
}> {
  const [instagram, facebook, tiktok] = await Promise.all([
    runInstagramFollowersSync(),
    runFacebookFollowersSync(),
    runTikTokFollowersSync(),
  ]);
  return { instagram, facebook, tiktok };
}

export async function importInstagramFollowersFromExport(raw: unknown): Promise<{
  parsed: number;
  added: number;
  reactivated: number;
  unfollowed: number;
}> {
  const followers = parseInstagramFollowersExport(raw);
  const result = await syncFollowersForPlatform("instagram", followers);
  if (result.skipped) {
    return { parsed: 0, added: 0, reactivated: 0, unfollowed: 0 };
  }
  return {
    parsed: followers.length,
    added: result.added,
    reactivated: result.reactivated,
    unfollowed: result.unfollowed,
  };
}

async function countActiveFollowers(platform: SocialFollowerPlatform): Promise<number> {
  const [row] = await db
    .select({ c: count() })
    .from(socialFollowersTable)
    .where(and(eq(socialFollowersTable.platform, platform), eq(socialFollowersTable.is_active, true)));
  return Number(row?.c ?? 0);
}

export async function getSocialFollowersStats(): Promise<
  Record<
    SocialFollowerPlatform,
    {
      active: number;
      unfollowed: number;
      unfollowed_this_month: number;
      api_count: number | null;
      api_synced_at: string | null;
    }
  >
> {
  const stats = {} as Record<
    SocialFollowerPlatform,
    {
      active: number;
      unfollowed: number;
      unfollowed_this_month: number;
      api_count: number | null;
      api_synced_at: string | null;
    }
  >;

  const monthStart = startOfCurrentMonth();

  for (const platform of PLATFORMS) {
    const [activeRow] = await db
      .select({ c: count() })
      .from(socialFollowersTable)
      .where(and(eq(socialFollowersTable.platform, platform), eq(socialFollowersTable.is_active, true)));
    const [unfollowedRow] = await db
      .select({ c: count() })
      .from(socialFollowersTable)
      .where(
        and(eq(socialFollowersTable.platform, platform), eq(socialFollowersTable.is_active, false)),
      );
    const [unfollowedMonthRow] = await db
      .select({ c: count() })
      .from(socialFollowersTable)
      .where(
        and(
          eq(socialFollowersTable.platform, platform),
          eq(socialFollowersTable.is_active, false),
          gte(socialFollowersTable.unfollowed_at, monthStart),
        ),
      );

    const apiRaw = await readAdminSetting(apiCountSettingKey(platform));
    const apiSynced = await readAdminSetting(apiSyncedAtSettingKey(platform));

    stats[platform] = {
      active: Number(activeRow?.c ?? 0),
      unfollowed: Number(unfollowedRow?.c ?? 0),
      unfollowed_this_month: Number(unfollowedMonthRow?.c ?? 0),
      api_count: apiRaw != null && apiRaw !== "" ? Number(apiRaw) : null,
      api_synced_at: apiSynced,
    };
  }

  return stats;
}

export async function getSocialFollowersManualStats(): Promise<SocialFollowersManualStats> {
  const out = {} as SocialFollowersManualStats;
  for (const platform of Object.keys(MANUAL_COUNT_SETTING_KEYS) as SocialFollowersManualPlatform[]) {
    const countRaw = await readAdminSetting(MANUAL_COUNT_SETTING_KEYS[platform]);
    const updatedAt = await readAdminSetting(MANUAL_UPDATED_AT_SETTING_KEYS[platform]);
    const parsed =
      countRaw != null && countRaw !== "" && Number.isFinite(Number(countRaw))
        ? Math.max(0, Math.floor(Number(countRaw)))
        : null;
    out[platform] = { count: parsed, updated_at: updatedAt };
  }
  return out;
}

export async function setSocialFollowersManualCount(
  platform: SocialFollowersManualPlatform,
  count: number,
): Promise<SocialFollowersManualStats[SocialFollowersManualPlatform]> {
  const safeCount = Math.max(0, Math.floor(count));
  const now = new Date().toISOString();
  await upsertAdminSetting(MANUAL_COUNT_SETTING_KEYS[platform], String(safeCount));
  await upsertAdminSetting(MANUAL_UPDATED_AT_SETTING_KEYS[platform], now);
  return { count: safeCount, updated_at: now };
}

export type SocialFollowersListFilter = {
  platform?: SocialFollowerPlatform | "all";
  status?: "active" | "unfollowed" | "all";
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export async function listSocialFollowers(opts: SocialFollowersListFilter = {}): Promise<{
  total: number;
  page: number;
  limit: number;
  rows: Array<{
    id: number;
    platform: string;
    follower_username: string;
    follower_id: string | null;
    followed_at: string;
    unfollowed_at: string | null;
    is_active: boolean;
  }>;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (opts.platform && opts.platform !== "all") {
    conditions.push(eq(socialFollowersTable.platform, opts.platform));
  }
  if (opts.status === "active") {
    conditions.push(eq(socialFollowersTable.is_active, true));
  } else if (opts.status === "unfollowed") {
    conditions.push(eq(socialFollowersTable.is_active, false));
  }

  const fromDate = opts.from ? new Date(opts.from) : null;
  const toDate = opts.to ? new Date(opts.to) : null;
  if (fromDate && !Number.isNaN(fromDate.getTime())) {
    if (opts.status === "unfollowed") {
      conditions.push(gte(socialFollowersTable.unfollowed_at, fromDate));
    } else {
      conditions.push(gte(socialFollowersTable.followed_at, fromDate));
    }
  }
  if (toDate && !Number.isNaN(toDate.getTime())) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    if (opts.status === "unfollowed") {
      conditions.push(lte(socialFollowersTable.unfollowed_at, end));
    } else {
      conditions.push(lte(socialFollowersTable.followed_at, end));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ c: count() })
    .from(socialFollowersTable)
    .where(whereClause);

  const order =
    opts.status === "unfollowed"
      ? desc(socialFollowersTable.unfollowed_at)
      : desc(socialFollowersTable.followed_at);

  const rows = await db
    .select()
    .from(socialFollowersTable)
    .where(whereClause)
    .orderBy(order)
    .limit(limit)
    .offset(offset);

  return {
    total: Number(totalRow?.c ?? 0),
    page,
    limit,
    rows: rows.map((r) => ({
      id: r.id,
      platform: r.platform,
      follower_username: r.follower_username,
      follower_id: r.follower_id,
      followed_at: r.followed_at.toISOString(),
      unfollowed_at: r.unfollowed_at?.toISOString() ?? null,
      is_active: r.is_active,
    })),
  };
}

const EXPORT_MAX_ROWS = 50_000;

export async function exportSocialFollowersCsv(
  opts: Omit<SocialFollowersListFilter, "page" | "limit"> & { platform: SocialFollowerPlatform },
): Promise<string> {
  const data = await listSocialFollowers({
    ...opts,
    platform: opts.platform,
    page: 1,
    limit: EXPORT_MAX_ROWS,
  });

  const lines = [
    "follower_username,follower_id,followed_at,unfollowed_at,status",
    ...data.rows.map((r) =>
      [
        csvEscape(r.follower_username),
        csvEscape(r.follower_id ?? ""),
        csvEscape(r.followed_at),
        csvEscape(r.unfollowed_at ?? ""),
        csvEscape(r.is_active ? "active" : "unfollowed"),
      ].join(","),
    ),
  ];

  return lines.join("\n");
}
