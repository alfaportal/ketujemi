import { Router } from "express";
import { appOriginFromRequest } from "../lib/meta-oauth-config";
import { createOAuthState, sanitizeOAuthReturnTo, verifyOAuthState } from "../lib/oauth-state";
import {
  buildFacebookAuthorizeUrl,
  exchangeFacebookCode,
  fetchFacebookProfile,
  isFacebookOAuthEnabled,
} from "../lib/facebook-oauth";
import {
  buildInstagramAuthorizeUrl,
  exchangeInstagramCode,
  fetchInstagramProfile,
  isInstagramOAuthEnabled,
} from "../lib/instagram-oauth";
import { findOrCreateUserFromFacebook, findOrCreateUserFromInstagram } from "../lib/oauth-user";
import { setUserSessionCookie } from "../lib/user-session";
import { assertAccountActive } from "../lib/user-ban";

const router = Router();

function redirectLogin(res: import("express").Response, origin: string, error: string): void {
  const url = `${origin.replace(/\/$/, "")}/login?error=${encodeURIComponent(error)}`;
  res.redirect(302, url);
}

function redirectSuccess(res: import("express").Response, origin: string, returnTo: string): void {
  const path = sanitizeOAuthReturnTo(returnTo);
  const sep = path.includes("?") ? "&" : "?";
  const url = `${origin.replace(/\/$/, "")}${path}${sep}verified=1`;
  res.redirect(302, url);
}

router.get("/auth/oauth/facebook/start", (req, res) => {
  if (!isFacebookOAuthEnabled()) {
    res.status(503).json({ error: "FACEBOOK_OAUTH_DISABLED" });
    return;
  }

  try {
    const origin = appOriginFromRequest(req);
    const returnTo = sanitizeOAuthReturnTo(
      typeof req.query.return === "string" ? req.query.return : "/",
    );
    const state = createOAuthState({ provider: "facebook", returnTo });
    res.redirect(302, buildFacebookAuthorizeUrl(state, origin));
  } catch (err) {
    req.log?.error({ err }, "facebook oauth start");
    res.status(500).json({ error: "OAuth start failed" });
  }
});

router.get("/auth/oauth/facebook/callback", async (req, res) => {
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
    const accessToken = await exchangeFacebookCode(code, origin);
    const profile = await fetchFacebookProfile(accessToken);
    const user = await findOrCreateUserFromFacebook(profile);
    await assertAccountActive(user, user.phone_e164_digits ?? undefined);
    setUserSessionCookie(res, user.id);
    redirectSuccess(res, origin, state.returnTo);
  } catch (err) {
    req.log?.error({ err }, "facebook oauth callback");
    redirectLogin(res, origin, "facebook_failed");
  }
});

router.get("/auth/oauth/instagram/start", (req, res) => {
  if (!isInstagramOAuthEnabled()) {
    res.status(503).json({ error: "INSTAGRAM_OAUTH_DISABLED" });
    return;
  }

  try {
    const origin = appOriginFromRequest(req);
    const returnTo = sanitizeOAuthReturnTo(
      typeof req.query.return === "string" ? req.query.return : "/",
    );
    const state = createOAuthState({ provider: "instagram", returnTo });
    res.redirect(302, buildInstagramAuthorizeUrl(state, origin));
  } catch (err) {
    req.log?.error({ err }, "instagram oauth start");
    res.status(500).json({ error: "OAuth start failed" });
  }
});

router.get("/auth/oauth/instagram/callback", async (req, res) => {
  const origin = appOriginFromRequest(req);
  const stateRaw = typeof req.query.state === "string" ? req.query.state : "";
  const code = typeof req.query.code === "string" ? req.query.code : "";

  if (req.query.error) {
    redirectLogin(res, origin, "instagram_denied");
    return;
  }

  const state = verifyOAuthState(stateRaw);
  if (!state || state.provider !== "instagram") {
    redirectLogin(res, origin, "oauth_state");
    return;
  }

  if (!code) {
    redirectLogin(res, origin, "oauth_code");
    return;
  }

  try {
    const { accessToken } = await exchangeInstagramCode(code, origin);
    const profile = await fetchInstagramProfile(accessToken);
    const user = await findOrCreateUserFromInstagram(profile);
    await assertAccountActive(user, user.phone_e164_digits ?? undefined);
    setUserSessionCookie(res, user.id);
    redirectSuccess(res, origin, state.returnTo);
  } catch (err) {
    req.log?.error({ err }, "instagram oauth callback");
    redirectLogin(res, origin, "instagram_failed");
  }
});

export default router;
