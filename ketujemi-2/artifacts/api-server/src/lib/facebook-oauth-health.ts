import {
  facebookAppId,
  facebookAppSecret,
  facebookPublicOAuthCallbackUrl,
  isFacebookOAuthEnabled,
  metaGraphVersion,
  oauthCallbackUrl,
} from "./meta-oauth-config.js";
import { getCanonicalOrigin } from "./canonical-host.js";
import { logger } from "./logger.js";

export type FacebookOAuthDiagnostics = {
  enabled: boolean;
  app_id: string | null;
  app_id_masked: string | null;
  graph_version: string;
  redirect_uris: {
    /** Used by the login button (`/api/auth/facebook/start`). */
    public_login: string;
    /** Legacy alternate route (`/api/auth/oauth/facebook/start`). */
    legacy_api: string;
    local_dev: string;
  };
  credentials_valid: boolean | null;
  app_name: string | null;
  /** Human-readable blockers when login shows "not released" / development mode. */
  meta_portal_checklist: string[];
  graph_error: string | null;
};

function maskAppId(id: string): string {
  if (id.length <= 8) return "****";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

export function facebookOAuthRedirectUris(origin = getCanonicalOrigin()): FacebookOAuthDiagnostics["redirect_uris"] {
  return {
    public_login: facebookPublicOAuthCallbackUrl(origin),
    legacy_api: oauthCallbackUrl(origin, "facebook"),
    local_dev: facebookPublicOAuthCallbackUrl("http://localhost:5173"),
  };
}

export async function getFacebookOAuthDiagnostics(
  origin = getCanonicalOrigin(),
): Promise<FacebookOAuthDiagnostics> {
  const enabled = isFacebookOAuthEnabled();
  const appId = facebookAppId();
  const secret = facebookAppSecret();
  const redirect_uris = facebookOAuthRedirectUris(origin);

  const checklist = [
    "Meta Developers → your app → App settings → Basic: set Privacy Policy URL (https://ketujemi.com/privacy) and Terms URL (https://ketujemi.com/terms).",
    "Products → Facebook Login → Settings: enable Client OAuth Login and Web OAuth Login.",
    `Add this exact Valid OAuth Redirect URI: ${redirect_uris.public_login}`,
    `Optional (legacy route): ${redirect_uris.legacy_api}`,
    `Local dev: ${redirect_uris.local_dev}`,
    "App Review (or Use cases): switch the app from Development to Live — «Do you want to make this app available to the general public?» → Yes.",
    "App Review → Permissions: request Advanced Access for `email` if you need the user's email on login (public_profile is usually standard access).",
    "Until Live: add testers under Roles → Testers (they must accept the invite).",
  ];

  if (!enabled || !appId || !secret) {
    return {
      enabled,
      app_id: appId,
      app_id_masked: appId ? maskAppId(appId) : null,
      graph_version: metaGraphVersion(),
      redirect_uris,
      credentials_valid: null,
      app_name: null,
      meta_portal_checklist: checklist,
      graph_error: enabled ? "Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET" : "Facebook OAuth disabled",
    };
  }

  let credentials_valid: boolean | null = null;
  let app_name: string | null = null;
  let graph_error: string | null = null;

  try {
    const version = metaGraphVersion();
    const tokenRes = await fetch(
      `https://graph.facebook.com/${version}/oauth/access_token?${new URLSearchParams({
        client_id: appId,
        client_secret: secret,
        grant_type: "client_credentials",
      })}`,
    );
    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: { message?: string };
    };
    if (!tokenRes.ok || !tokenData.access_token) {
      credentials_valid = false;
      graph_error = tokenData.error?.message ?? "Client credentials token request failed";
    } else {
      credentials_valid = true;
      const appRes = await fetch(
        `https://graph.facebook.com/${version}/${appId}?${new URLSearchParams({
          fields: "name,category",
          access_token: tokenData.access_token,
        })}`,
      );
      const appData = (await appRes.json()) as {
        name?: string;
        error?: { message?: string };
      };
      if (appRes.ok && appData.name) {
        app_name = appData.name;
      } else if (appData.error?.message) {
        graph_error = appData.error.message;
      }
    }
  } catch (err) {
    credentials_valid = false;
    graph_error = err instanceof Error ? err.message : "Facebook Graph API unreachable";
  }

  return {
    enabled,
    app_id: appId,
    app_id_masked: maskAppId(appId),
    graph_version: metaGraphVersion(),
    redirect_uris,
    credentials_valid,
    app_name,
    meta_portal_checklist: checklist,
    graph_error,
  };
}

/** Log OAuth setup hints on API startup (credentials are never logged). */
export async function logFacebookOAuthStartupDiagnostics(): Promise<void> {
  if (!isFacebookOAuthEnabled()) {
    logger.info("Facebook OAuth disabled (FACEBOOK_OAUTH_ENABLED=false or missing app id/secret)");
    return;
  }
  const d = await getFacebookOAuthDiagnostics();
  logger.info(
    {
      app_id: d.app_id_masked,
      app_name: d.app_name,
      credentials_valid: d.credentials_valid,
      redirect_uri: d.redirect_uris.public_login,
      graph_error: d.graph_error,
    },
    "Facebook OAuth configured — if users see «app not released» / development mode, switch the Meta app to Live (see meta_portal_checklist in GET /admin/facebook-oauth-diagnostics)",
  );
  if (d.credentials_valid === false) {
    logger.warn(
      { graph_error: d.graph_error },
      "Facebook OAuth credentials invalid — check FACEBOOK_APP_ID / FACEBOOK_APP_SECRET on Railway",
    );
  }
}
