import { logger } from "./logger.js";

const GRAPH_API_VERSION = "v25.0";

export type FetchedFollower = {
  id: string | null;
  username: string;
  followedAt: Date | null;
};

export type InstagramFollowersFetchResult = {
  followers: FetchedFollower[];
  totalCount: number | null;
  /** true when Graph API returned a paginated follower list */
  listAvailable: boolean;
  username: string | null;
};

function graphUrl(pathAndQuery: string): string {
  const p = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  return `https://graph.facebook.com/${GRAPH_API_VERSION}${p}`;
}

function readIgUserId(): string {
  return (
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ||
    process.env.IG_BUSINESS_ACCOUNT_ID?.trim() ||
    ""
  );
}

function readPageAccessToken(): string {
  return (
    process.env.FB_PAGE_ACCESS_TOKEN?.trim() ||
    process.env.PAGE_ACCESS_TOKEN?.trim() ||
    ""
  );
}

/** Parse Instagram «Download your information» followers JSON export. */
export function parseInstagramFollowersExport(raw: unknown): FetchedFollower[] {
  const out: FetchedFollower[] = [];
  const seen = new Set<string>();

  const push = (username: string, id: string | null, followedAt: Date | null) => {
    const u = username.trim().replace(/^@/, "").toLowerCase();
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push({ id, username: u, followedAt });
  };

  const walk = (node: unknown): void => {
    if (node == null) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;

    if (Array.isArray(obj.string_list_data)) {
      for (const row of obj.string_list_data) {
        if (!row || typeof row !== "object") continue;
        const r = row as Record<string, unknown>;
        const value = typeof r.value === "string" ? r.value.trim() : "";
        const ts = typeof r.timestamp === "number" ? new Date(r.timestamp * 1000) : null;
        if (value) push(value, null, ts);
      }
    }

    if (obj.string_map_data && typeof obj.string_map_data === "object") {
      const map = obj.string_map_data as Record<string, { value?: string; timestamp?: number }>;
      const name = map.Name?.value ?? map.Username?.value ?? map.value;
      const ts =
        typeof map.Name?.timestamp === "number"
          ? new Date(map.Name.timestamp * 1000)
          : typeof map.Username?.timestamp === "number"
            ? new Date(map.Username.timestamp * 1000)
            : null;
      if (typeof name === "string" && name.trim()) push(name, null, ts);
    }

    for (const key of Object.keys(obj)) {
      if (key === "string_list_data" || key === "string_map_data") continue;
      walk(obj[key]);
    }
  };

  if (Array.isArray(raw)) {
    for (const block of raw) {
      if (block && typeof block === "object") {
        const title = String((block as Record<string, unknown>).title ?? "").toLowerCase();
        if (
          title.includes("follower") ||
          title.includes("ndjek") ||
          title.includes("followers")
        ) {
          walk(block);
        }
      }
    }
    if (out.length === 0) walk(raw);
  } else {
    walk(raw);
    if (raw && typeof raw === "object") {
      const root = raw as Record<string, unknown>;
      for (const key of [
        "relationships_followers",
        "followers",
        "followers_and_following",
      ]) {
        if (root[key]) walk(root[key]);
      }
    }
  }

  return out;
}

async function tryPaginatedFollowersEdge(
  igUserId: string,
  accessToken: string,
): Promise<FetchedFollower[]> {
  const collected: FetchedFollower[] = [];
  let nextUrl: string | null = graphUrl(
    `/${igUserId}/followers?fields=id,username&limit=100&access_token=${encodeURIComponent(accessToken)}`,
  );

  for (let page = 0; page < 50 && nextUrl; page += 1) {
    const res = await fetch(nextUrl);
    const json = (await res.json().catch(() => ({}))) as {
      data?: Array<{ id?: string; username?: string }>;
      paging?: { next?: string };
      error?: { message?: string; code?: number };
    };

    if (!res.ok || json.error) {
      logger.info(
        { status: res.status, error: json.error, page },
        "instagram followers edge unavailable (Meta does not expose follower lists on most apps)",
      );
      return [];
    }

    const rows = Array.isArray(json.data) ? json.data : [];
    for (const row of rows) {
      const username = String(row.username ?? "").trim().replace(/^@/, "").toLowerCase();
      if (!username) continue;
      collected.push({
        id: row.id != null ? String(row.id) : null,
        username,
        followedAt: null,
      });
    }

    nextUrl = json.paging?.next ?? null;
    if (rows.length === 0) break;
  }

  return collected;
}

/**
 * Fetch Instagram followers via Graph API.
 * Meta usually returns only followers_count — individual lists require an import JSON.
 */
export async function fetchInstagramFollowersFromGraph(): Promise<InstagramFollowersFetchResult> {
  const igUserId = readIgUserId();
  const accessToken = readPageAccessToken();

  if (!igUserId || !accessToken) {
    return { followers: [], totalCount: null, listAvailable: false, username: null };
  }

  const profileRes = await fetch(
    graphUrl(
      `/${igUserId}?fields=followers_count,username&access_token=${encodeURIComponent(accessToken)}`,
    ),
  );
  const profileJson = (await profileRes.json().catch(() => ({}))) as {
    followers_count?: number;
    username?: string;
    error?: { message?: string };
  };

  const totalCount =
    typeof profileJson.followers_count === "number" ? profileJson.followers_count : null;
  const username = typeof profileJson.username === "string" ? profileJson.username : null;

  if (!profileRes.ok) {
    logger.warn(
      { status: profileRes.status, error: profileJson.error, igUserId },
      "instagram followers profile fetch failed",
    );
    return { followers: [], totalCount: null, listAvailable: false, username };
  }

  const followers = await tryPaginatedFollowersEdge(igUserId, accessToken);

  return {
    followers,
    totalCount,
    listAvailable: followers.length > 0,
    username,
  };
}
