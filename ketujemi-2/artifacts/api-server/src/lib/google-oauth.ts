import {
  googleClientId,
  googleClientSecret,
  googleOAuthCallbackUrl,
  isGoogleOAuthEnabled,
} from "./google-oauth-config";

export { isGoogleOAuthEnabled };

export type GoogleProfile = {
  id: string;
  name: string | null;
  email: string | null;
  pictureUrl: string | null;
};

export function buildGoogleAuthorizeUrl(state: string, origin: string): string {
  const clientId = googleClientId();
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

  const redirectUri = googleOAuthCallbackUrl(origin);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string, origin: string): Promise<string> {
  const clientId = googleClientId();
  const secret = googleClientSecret();
  if (!clientId || !secret) throw new Error("Google OAuth not configured");

  const redirectUri = googleOAuthCallbackUrl(origin);
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: secret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? "Google token exchange failed");
  }

  return data.access_token;
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = (await res.json()) as {
    id?: string;
    name?: string;
    email?: string;
    picture?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.id) {
    throw new Error(data.error?.message ?? "Google profile fetch failed");
  }

  return {
    id: data.id,
    name: data.name?.trim() || null,
    email: data.email?.trim().toLowerCase() || null,
    pictureUrl: data.picture?.trim() || null,
  };
}
