import {
  facebookAppId,
  facebookAppSecret,
  facebookPublicOAuthCallbackUrl,
  isFacebookOAuthEnabled,
  metaGraphVersion,
  oauthCallbackUrl,
} from "./meta-oauth-config";

export { isFacebookOAuthEnabled };

export type FacebookOAuthCallbackVariant = "api" | "public";

export type FacebookProfile = {
  id: string;
  name: string | null;
  email: string | null;
  pictureUrl: string | null;
};

function facebookRedirectUri(origin: string, variant: FacebookOAuthCallbackVariant): string {
  return variant === "public"
    ? facebookPublicOAuthCallbackUrl(origin)
    : oauthCallbackUrl(origin, "facebook");
}

export function buildFacebookAuthorizeUrl(
  state: string,
  origin: string,
  variant: FacebookOAuthCallbackVariant = "api",
): string {
  const appId = facebookAppId();
  if (!appId) throw new Error("FACEBOOK_APP_ID not configured");

  const redirectUri = facebookRedirectUri(origin, variant);
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
  variant: FacebookOAuthCallbackVariant = "api",
): Promise<string> {
  const appId = facebookAppId();
  const secret = facebookAppSecret();
  if (!appId || !secret) throw new Error("Facebook OAuth not configured");

  const redirectUri = facebookRedirectUri(origin, variant);
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

export type FacebookLinkedInstagram = {
  id: string;
  username: string;
};

/** Linked Instagram business/creator account for the authenticated Facebook user, if any. */
export async function fetchFacebookLinkedInstagram(
  accessToken: string,
): Promise<FacebookLinkedInstagram | null> {
  const fields = "instagram_business_account{id,username}";
  const params = new URLSearchParams({ fields, access_token: accessToken });
  const res = await fetch(`https://graph.facebook.com/${metaGraphVersion()}/me?${params}`);
  const data = (await res.json()) as {
    instagram_business_account?: { id?: string; username?: string };
    error?: { message?: string };
  };
  if (!res.ok) return null;
  const ig = data.instagram_business_account;
  const username = ig?.username?.trim().replace(/^@/, "").toLowerCase();
  const id = ig?.id?.trim();
  if (!username || !id) return null;
  return { id, username };
}
