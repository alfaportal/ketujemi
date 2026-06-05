import { Router } from "express";
import { appOriginFromRequest } from "../lib/google-oauth-config";
import {
  buildGoogleAuthorizeUrl,
  exchangeGoogleCode,
  fetchGoogleProfile,
  isGoogleOAuthEnabled,
} from "../lib/google-oauth";
import { findOrCreateUserFromGoogle } from "../lib/oauth-user";
import { createOAuthState, verifyOAuthState } from "../lib/oauth-state";
import { isNewlyRegisteredUser, setUserSessionCookie } from "../lib/user-session";
import { assertAccountActive } from "../lib/user-ban";

const router = Router();

function redirectLogin(res: import("express").Response, origin: string, error: string): void {
  const url = `${origin.replace(/\/$/, "")}/login?error=${encodeURIComponent(error)}`;
  res.redirect(302, url);
}

function redirectHome(
  res: import("express").Response,
  origin: string,
  extra?: Record<string, string>,
): void {
  const params = new URLSearchParams({ verified: "1", ...extra });
  const url = `${origin.replace(/\/$/, "")}/?${params.toString()}`;
  res.redirect(302, url);
}

router.get("/auth/google/start", (req, res) => {
  if (!isGoogleOAuthEnabled()) {
    res.status(503).json({ error: "GOOGLE_OAUTH_DISABLED" });
    return;
  }

  try {
    const origin = appOriginFromRequest(req);
    const state = createOAuthState({ provider: "google", returnTo: "/" });
    res.redirect(302, buildGoogleAuthorizeUrl(state, origin));
  } catch (err) {
    req.log?.error({ err }, "google oauth start");
    res.status(500).json({ error: "OAuth start failed" });
  }
});

router.get("/auth/google/callback", async (req, res) => {
  const origin = appOriginFromRequest(req);
  const stateRaw = typeof req.query.state === "string" ? req.query.state : "";
  const code = typeof req.query.code === "string" ? req.query.code : "";

  if (req.query.error) {
    redirectLogin(res, origin, "google_denied");
    return;
  }

  const state = verifyOAuthState(stateRaw);
  if (!state || state.provider !== "google") {
    redirectLogin(res, origin, "oauth_state");
    return;
  }

  if (!code) {
    redirectLogin(res, origin, "oauth_code");
    return;
  }

  try {
    const accessToken = await exchangeGoogleCode(code, origin);
    const profile = await fetchGoogleProfile(accessToken);
    const user = await findOrCreateUserFromGoogle(profile);
    await assertAccountActive(user, user.phone_e164_digits ?? undefined);
    setUserSessionCookie(res, user.id);
    redirectHome(res, origin, isNewlyRegisteredUser(user) ? { welcome: "1" } : undefined);
  } catch (err) {
    req.log?.error({ err }, "google oauth callback");
    redirectLogin(res, origin, "google_failed");
  }
});

export default router;
