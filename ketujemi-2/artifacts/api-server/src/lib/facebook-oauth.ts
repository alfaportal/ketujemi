import {
  facebookAppId,
  facebookAppSecret,
  isFacebookOAuthEnabled,
  metaGraphVersion,
  oauthCallbackUrl,
} from "./meta-oauth-config";

export { isFacebookOAuthEnabled };

export type FacebookProfile = {
  id: string;
  name: string | null;
  email: string | null;
  pictureUrl: string | null;
};

export function buildFacebookAuthorizeUrl(state: string, origin: string): string {
  const appId = facebookAppId();
  if (!appId) throw new Error("FACEBOOK_APP_ID not configured");

  const redirectUri = oauthCallbackUrl(origin, "facebook");
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope: "email,public_profile",
  });

  return `https://www.facebook.com/${metaGraphVersion()}/dialog/oauth?${params}`;
}

export async function exchangeFacebookCode(
  code: string,
  origin: string,
): Promise<string> {
  const appId = facebookAppId();
  const secret = facebookAppSecret();
  if (!appId || !secret) throw new Error("Facebook OAuth not configured");

  const redirectUri = oauthCallbackUrl(origin, "facebook");
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: secret,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(
    `https://graph.facebook.com/${metaGraphVersion()}/oauth/access_token?${params}`,
  );
  const data = (await res.json()) as { access_token?: string; error?: { message?: string } };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message ?? "Facebook token exchange failed");
  }
  return data.access_token;
}

export async function fetchFacebookProfile(accessToken: string): Promise<FacebookProfile> {
  const fields = "id,name,email,picture.type(large)";
  const params = new URLSearchParams({ fields, access_token: accessToken });
  const res = await fetch(`https://graph.facebook.com/${metaGraphVersion()}/me?${params}`);
  const data = (await res.json()) as {
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
    error?: { message?: string };
  };

  if (!res.ok || !data.id) {
    throw new Error(data.error?.message ?? "Facebook profile fetch failed");
  }

  return {
    id: data.id,
    name: data.name?.trim() || null,
    email: data.email?.trim().toLowerCase() || null,
    pictureUrl: data.picture?.data?.url?.trim() || null,
  };
}
