import {
  isTikTokOAuthEnabled,
  tiktokClientKey,
  tiktokClientSecret,
  tiktokOAuthCallbackUrl,
} from "./tiktok-oauth-config";

export { isTikTokOAuthEnabled };

export type TikTokProfile = {
  id: string;
  name: string | null;
  pictureUrl: string | null;
};

const TIKTOK_SCOPE = "user.info.basic";

export function buildTikTokAuthorizeUrl(state: string, origin: string): string {
  const clientKey = tiktokClientKey();
  if (!clientKey) throw new Error("TIKTOK_CLIENT_KEY not configured");

  const redirectUri = tiktokOAuthCallbackUrl(origin);
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: TIKTOK_SCOPE,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

export async function exchangeTikTokCode(code: string, origin: string): Promise<string> {
  const clientKey = tiktokClientKey();
  const secret = tiktokClientSecret();
  if (!clientKey || !secret) throw new Error("TikTok OAuth not configured");

  const redirectUri = tiktokOAuthCallbackUrl(origin);
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: secret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as {
    access_token?: string;
    data?: { access_token?: string };
    error?: string;
    error_description?: string;
    message?: string;
  };

  const accessToken = data.access_token ?? data.data?.access_token;
  if (!res.ok || !accessToken) {
    throw new Error(
      data.error_description ?? data.message ?? data.error ?? "TikTok token exchange failed",
    );
  }

  return accessToken;
}

export async function fetchTikTokProfile(accessToken: string): Promise<TikTokProfile> {
  const fields = "open_id,union_id,avatar_url,display_name";
  const url = `https://open.tiktokapis.com/v2/user/info/?fields=${encodeURIComponent(fields)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = (await res.json()) as {
    data?: {
      user?: {
        open_id?: string;
        union_id?: string;
        display_name?: string;
        avatar_url?: string;
      };
    };
    error?: { code?: string; message?: string };
  };

  const user = data.data?.user;
  const id = user?.open_id?.trim() || user?.union_id?.trim();
  if (!res.ok || !id) {
    throw new Error(data.error?.message ?? "TikTok profile fetch failed");
  }

  return {
    id,
    name: user?.display_name?.trim() || null,
    pictureUrl: user?.avatar_url?.trim() || null,
  };
}
