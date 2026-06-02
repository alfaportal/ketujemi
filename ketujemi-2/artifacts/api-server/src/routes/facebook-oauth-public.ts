import { Router } from "express";
import { appOriginFromRequest } from "../lib/meta-oauth-config";
import {
  buildFacebookAuthorizeUrl,
  exchangeFacebookCode,
  fetchFacebookProfile,
  isFacebookOAuthEnabled,
} from "../lib/facebook-oauth";
import { findOrCreateUserFromFacebook } from "../lib/oauth-user";
import { createOAuthState, verifyOAuthState } from "../lib/oauth-state";
import { setUserSessionCookie } from "../lib/user-session";
import { assertAccountActive } from "../lib/user-ban";

const router = Router();

function redirectLogin(res: import("express").Response, origin: string, error: string): void {
  const url = `${origin.replace(/\/$/, "")}/login?error=${encodeURIComponent(error)}`;
  res.redirect(302, url);
}

function redirectHome(res: import("express").Response, origin: string): void {
  const url = `${origin.replace(/\/$/, "")}/?verified=1`;
  res.redirect(302, url);
}

router.get("/auth/facebook/start", (req, res) => {
  if (!isFacebookOAuthEnabled()) {
    res.status(503).json({ error: "FACEBOOK_OAUTH_DISABLED" });
    return;
  }

  try {
    const origin = appOriginFromRequest(req);
    const state = createOAuthState({ provider: "facebook", returnTo: "/" });
    res.redirect(302, buildFacebookAuthorizeUrl(state, origin, "public"));
  } catch (err) {
    req.log?.error({ err }, "facebook oauth start");
    res.status(500).json({ error: "OAuth start failed" });
  }
});

router.get("/auth/facebook/callback", async (req, res) => {
  const origin = appOriginFromRequest(req);
  const stateRaw = typeof req.query.state === "string" ? req.query.state : "";
  const code = typeof req.query.code === "string" ? req.query.code : "";

  if (req.query.error) {
    redirectLogin(res, origin, "facebook_denied");
    return;
  }

  const state = verifyOAuthState(stateRaw);
  if (!state || state.provider !== "facebook") {
    redirectLogin(res, origin, "oauth_state");
    return;
  }

  if (!code) {
    redirectLogin(res, origin, "oauth_code");
    return;
  }

  try {
    const accessToken = await exchangeFacebookCode(code, origin, "public");
    const profile = await fetchFacebookProfile(accessToken);
    const user = await findOrCreateUserFromFacebook(profile);
    await assertAccountActive(user, user.phone_e164_digits ?? undefined);
    setUserSessionCookie(res, user.id);
    redirectHome(res, origin);
  } catch (err) {
    req.log?.error({ err }, "facebook oauth callback");
    redirectLogin(res, origin, "facebook_failed");
  }
});

export default router;
