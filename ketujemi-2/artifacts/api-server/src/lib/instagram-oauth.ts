import {
  instagramAppId,
  instagramAppSecret,
  isInstagramOAuthEnabled,
  oauthCallbackUrl,
} from "./meta-oauth-config";

export { isInstagramOAuthEnabled };

/** Instagram API with Instagram Login — https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login */
const INSTAGRAM_SCOPES = "instagram_business_basic";

export type InstagramProfile = {
  id: string;
  username: string | null;
};

export function buildInstagramAuthorizeUrl(state: string, origin: string): string {
  const appId = instagramAppId();
  if (!appId) throw new Error("INSTAGRAM_APP_ID not configured");

  const redirectUri = oauthCallbackUrl(origin, "instagram");
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope: INSTAGRAM_SCOPES,
  });

  return `https://www.instagram.com/oauth/authorize?${params}`;
}

type InstagramShortLivedToken = {
  access_token?: string;
  user_id?: string | number;
  error_message?: string;
};

export async function exchangeInstagramCode(
  code: string,
  origin: string,
): Promise<{ accessToken: string; userId: string }> {
  const appId = instagramAppId();
  const secret = instagramAppSecret();
  if (!appId || !secret) throw new Error("Instagram OAuth not configured");

  const redirectUri = oauthCallbackUrl(origin, "instagram");
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: secret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as InstagramShortLivedToken;
  if (!res.ok || !data.access_token || data.user_id == null) {
    throw new Error(data.error_message ?? "Instagram token exchange failed");
  }

  return {
    accessToken: data.access_token,
    userId: String(data.user_id),
  };
}

export async function fetchInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  const params = new URLSearchParams({
    fields: "user_id,username",
    access_token: accessToken,
  });
  const res = await fetch(`https://graph.instagram.com/me?${params}`);
  const data = (await res.json()) as {
    user_id?: string;
    username?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.user_id) {
    throw new Error(data.error?.message ?? "Instagram profile fetch failed");
  }

  return {
    id: data.user_id,
    username: data.username?.trim() || null,
  };
}
