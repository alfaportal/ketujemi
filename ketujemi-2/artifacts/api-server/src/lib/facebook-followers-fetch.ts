import { logger } from "./logger.js";

const GRAPH_API_VERSION = "v25.0";

export type FetchedFollower = {
  id: string | null;
  username: string;
  followedAt: Date | null;
};

export type FacebookFollowersFetchResult = {
  followers: FetchedFollower[];
  totalCount: number | null;
  listAvailable: boolean;
  pageName: string | null;
};

function graphUrl(pathAndQuery: string): string {
  const p = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  return `https://graph.facebook.com/${GRAPH_API_VERSION}${p}`;
}

function readPageId(): string {
  return (
    process.env.FB_PAGE_ID?.trim() ||
    process.env.PAGE_ID?.trim() ||
    process.env.FACEBOOK_PAGE_ID?.trim() ||
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

async function tryPaginatedPageFollowers(
  pageId: string,
  accessToken: string,
): Promise<FetchedFollower[]> {
  let nextUrl: string | null = graphUrl(
    `/${pageId}/followers?fields=id,name,username&limit=100&access_token=${encodeURIComponent(accessToken)}`,
  );
  const collected: FetchedFollower[] = [];

  for (let page = 0; page < 50 && nextUrl; page += 1) {
    const res = await fetch(nextUrl);
    const json = (await res.json().catch(() => ({}))) as {
      data?: Array<{ id?: string; name?: string; username?: string }>;
      paging?: { next?: string };
      error?: { message?: string };
    };

    if (!res.ok || json.error) {
      logger.info(
        { status: res.status, error: json.error, pageId },
        "facebook page followers edge unavailable (Meta API limitation)",
      );
      return [];
    }

    const rows = Array.isArray(json.data) ? json.data : [];
    for (const row of rows) {
      const username = String(row.username ?? row.name ?? row.id ?? "")
        .trim()
        .replace(/^@/, "")
        .toLowerCase();
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

/** Fetch Facebook Page fan count; individual fan list rarely exposed by Graph API. */
export async function fetchFacebookFollowersFromGraph(): Promise<FacebookFollowersFetchResult> {
  const pageId = readPageId();
  const accessToken = readPageAccessToken();

  if (!pageId || !accessToken) {
    return { followers: [], totalCount: null, listAvailable: false, pageName: null };
  }

  const profileRes = await fetch(
    graphUrl(
      `/${pageId}?fields=fan_count,followers_count,name,username&access_token=${encodeURIComponent(accessToken)}`,
    ),
  );
  const profileJson = (await profileRes.json().catch(() => ({}))) as {
    fan_count?: number;
    followers_count?: number;
    name?: string;
    username?: string;
    error?: { message?: string };
  };

  const totalCount =
    typeof profileJson.fan_count === "number"
      ? profileJson.fan_count
      : typeof profileJson.followers_count === "number"
        ? profileJson.followers_count
        : null;
  const pageName = profileJson.name ?? profileJson.username ?? null;

  if (!profileRes.ok) {
    logger.warn({ status: profileRes.status, error: profileJson.error, pageId }, "facebook fan count fetch failed");
    return { followers: [], totalCount: null, listAvailable: false, pageName };
  }

  const followers = await tryPaginatedPageFollowers(pageId, accessToken);

  return {
    followers,
    totalCount,
    listAvailable: followers.length > 0,
    pageName,
  };
}
