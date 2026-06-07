import { Router } from "express";
import { appOriginFromRequest } from "../lib/tiktok-oauth-config";
import {
  buildTikTokAuthorizeUrl,
  exchangeTikTokCode,
  fetchTikTokProfile,
  isTikTokOAuthEnabled,
} from "../lib/tiktok-oauth";
import { findOrCreateUserFromTikTok } from "../lib/oauth-user";
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

router.get("/auth/tiktok/start", (req, res) => {
  if (!isTikTokOAuthEnabled()) {
    res.status(503).json({ error: "TIKTOK_OAUTH_DISABLED" });
    return;
  }

  try {
    const origin = appOriginFromRequest(req);
    const state = createOAuthState({ provider: "tiktok", returnTo: "/" });
    res.redirect(302, buildTikTokAuthorizeUrl(state, origin));
  } catch (err) {
    req.log?.error({ err }, "tiktok oauth start");
    res.status(500).json({ error: "OAuth start failed" });
  }
});

router.get("/auth/tiktok/callback", async (req, res) => {
  const origin = appOriginFromRequest(req);
  const stateRaw = typeof req.query.state === "string" ? req.query.state : "";
  const code = typeof req.query.code === "string" ? req.query.code : "";

  if (req.query.error) {
    redirectLogin(res, origin, "tiktok_denied");
    return;
  }

  const state = verifyOAuthState(stateRaw);
  if (!state || state.provider !== "tiktok") {
    redirectLogin(res, origin, "oauth_state");
    return;
  }

  if (!code) {
    redirectLogin(res, origin, "oauth_code");
    return;
  }

  try {
    const accessToken = await exchangeTikTokCode(code, origin);
    const profile = await fetchTikTokProfile(accessToken);
    const user = await findOrCreateUserFromTikTok(profile);
    const { scheduleShopSocialEnrichForUser } = await import("../lib/shop-social-enrich.js");
    scheduleShopSocialEnrichForUser(user.id);
    await assertAccountActive(user, user.phone_e164_digits ?? undefined);
    setUserSessionCookie(res, user.id);
    redirectHome(res, origin);
  } catch (err) {
    req.log?.error({ err }, "tiktok oauth callback");
    redirectLogin(res, origin, "tiktok_failed");
  }
});

export default router;
