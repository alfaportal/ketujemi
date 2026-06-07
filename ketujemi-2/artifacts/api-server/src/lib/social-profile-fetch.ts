import { metaGraphVersion } from "./meta-oauth-config.js";
import { checkProfileUrlExists } from "./social-profile-http-check.js";
import { logger } from "./logger.js";

export type FetchedSocialProfile = {
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number | null;
  profile_url: string;
  fetch_status: "ok" | "not_found" | "private" | "rate_limited" | "unsupported";
  link_valid: boolean;
  raw_json: Record<string, unknown>;
};

function readIgBusinessId(): string {
  return (
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ||
    process.env.IG_BUSINESS_ACCOUNT_ID?.trim() ||
    ""
  );
}

function readPageToken(): string {
  return process.env.FB_PAGE_ACCESS_TOKEN?.trim() || process.env.PAGE_ACCESS_TOKEN?.trim() || "";
}

function profileNotFound(profileUrl: string): FetchedSocialProfile {
  return {
    display_name: null,
    avatar_url: null,
    follower_count: null,
    profile_url: profileUrl,
    fetch_status: "not_found",
    link_valid: false,
    raw_json: { http_check: false },
  };
}

export async function fetchInstagramPublicProfile(
  handle: string,
  profileUrl: string,
): Promise<FetchedSocialProfile> {
  const httpOk = await checkProfileUrlExists(profileUrl);
  if (!httpOk) return profileNotFound(profileUrl);

  const igBusinessId = readIgBusinessId();
  const token = readPageToken();

  if (igBusinessId && token) {
    try {
      const fields = `business_discovery.username(${handle}){followers_count,username,name,profile_picture_url}`;
      const params = new URLSearchParams({ fields, access_token: token });
      const res = await fetch(
        `https://graph.facebook.com/${metaGraphVersion()}/${igBusinessId}?${params}`,
      );
      const data = (await res.json()) as {
        business_discovery?: {
          followers_count?: number;
          username?: string;
          name?: string;
          profile_picture_url?: string;
        };
        error?: { message?: string; code?: number };
      };

      if (res.ok && data.business_discovery?.username) {
        const bd = data.business_discovery;
        return {
          display_name: bd.name?.trim() || bd.username || handle,
          avatar_url: bd.profile_picture_url?.trim() || null,
          follower_count:
            typeof bd.followers_count === "number" && bd.followers_count >= 0
              ? bd.followers_count
              : null,
          profile_url: profileUrl,
          fetch_status: "ok",
          link_valid: httpOk,
          raw_json: { ...(data as Record<string, unknown>), http_check: true },
        };
      }

      if (data.error?.code === 4 || data.error?.code === 17) {
        return httpOkOnlyProfile(profileUrl, "rate_limited", data, httpOk);
      }
    } catch (err) {
      logger.warn({ err, handle }, "instagram business_discovery failed");
    }
  }

  return fetchInstagramOEmbed(profileUrl, handle, httpOk);
}

function httpOkOnlyProfile(
  profileUrl: string,
  status: FetchedSocialProfile["fetch_status"],
  raw: Record<string, unknown>,
  httpOk: boolean,
): FetchedSocialProfile {
  return {
    display_name: null,
    avatar_url: null,
    follower_count: null,
    profile_url: profileUrl,
    fetch_status: status,
    link_valid: httpOk,
    raw_json: { ...raw, http_check: httpOk },
  };
}

async function fetchInstagramOEmbed(
  profileUrl: string,
  handle: string,
  httpOk: boolean,
): Promise<FetchedSocialProfile> {
  try {
    const token = readPageToken();
    const oembedUrl = token
      ? `https://graph.facebook.com/${metaGraphVersion()}/instagram_oembed?url=${encodeURIComponent(profileUrl)}&access_token=${encodeURIComponent(token)}`
      : `https://api.instagram.com/oembed?url=${encodeURIComponent(profileUrl)}`;

    const res = await fetch(oembedUrl);
    const data = (await res.json()) as {
      author_name?: string;
      thumbnail_url?: string;
      error?: { message?: string };
    };

    if (res.ok && (data.author_name || data.thumbnail_url)) {
      return {
        display_name: data.author_name?.trim() || handle,
        avatar_url: data.thumbnail_url?.trim() || null,
        follower_count: null,
        profile_url: profileUrl,
        fetch_status: "ok",
        link_valid: httpOk,
        raw_json: { ...(data as Record<string, unknown>), http_check: httpOk },
      };
    }

    if (res.status === 404) {
      return httpOkOnlyProfile(profileUrl, "not_found", data as Record<string, unknown>, httpOk);
    }
  } catch (err) {
    logger.warn({ err, handle }, "instagram oembed failed");
  }

  return httpOkOnlyProfile(profileUrl, "unsupported", {}, httpOk);
}

export async function fetchTikTokPublicProfile(
  handle: string,
  profileUrl: string,
): Promise<FetchedSocialProfile> {
  const httpOk = await checkProfileUrlExists(profileUrl);
  if (!httpOk) return profileNotFound(profileUrl);

  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(profileUrl)}`,
      { headers: { "User-Agent": "KetuJemi/1.0" } },
    );
    const data = (await res.json()) as {
      author_name?: string;
      author_url?: string;
      thumbnail_url?: string;
      title?: string;
    };

    if (res.ok && (data.author_name || data.thumbnail_url)) {
      return {
        display_name: data.author_name?.trim() || handle,
        avatar_url: data.thumbnail_url?.trim() || null,
        follower_count: null,
        profile_url: data.author_url?.trim() || profileUrl,
        fetch_status: "ok",
        link_valid: httpOk,
        raw_json: { ...(data as Record<string, unknown>), http_check: httpOk },
      };
    }

    if (res.status === 404) {
      return httpOkOnlyProfile(profileUrl, "not_found", data as Record<string, unknown>, httpOk);
    }
  } catch (err) {
    logger.warn({ err, handle }, "tiktok oembed failed");
  }

  return httpOkOnlyProfile(profileUrl, "unsupported", {}, httpOk);
}
