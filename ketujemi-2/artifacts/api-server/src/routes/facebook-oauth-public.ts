import { Router } from "express";
import { appOriginFromRequest } from "../lib/meta-oauth-config";
import {
  buildFacebookAuthorizeUrl,
  exchangeFacebookCode,
  fetchFacebookProfile,
  isFacebookOAuthEnabled,
} from "../lib/facebook-oauth";
import {
  findOrCreateUserFromFacebook,
  recordFacebookLinkedInstagramFromToken,
} from "../lib/oauth-user";
import { createOAuthState, sanitizeOAuthReturnTo, verifyOAuthState } from "../lib/oauth-state";
import { isNewlyRegisteredUser, setUserSessionCookie } from "../lib/user-session";
import { assertAccountActive } from "../lib/user-ban";
import { parseFacebookOAuthCallbackError } from "../lib/facebook-oauth-errors.js";
import { redirectOAuthLogin, redirectOAuthSuccess } from "../lib/oauth-redirect";

const router = Router();

router.get("/auth/facebook/start", (req, res) => {
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
    const fbErr = parseFacebookOAuthCallbackError(req.query as Record<string, unknown>);
    req.log?.warn(
      {
        facebook_error: req.query.error,
        reason: fbErr.logReason,
        description: fbErr.logDescription,
      },
      "facebook oauth callback rejected by Meta",
    );
    redirectOAuthLogin(res, origin, fbErr.code);
    return;
  }

  const state = verifyOAuthState(stateRaw);
  if (!state || state.provider !== "facebook") {
    redirectOAuthLogin(res, origin, "oauth_state");
    return;
  }

  if (!code) {
    redirectOAuthLogin(res, origin, "oauth_code");
    return;
  }

  try {
    const accessToken = await exchangeFacebookCode(code, origin, "public");
    const profile = await fetchFacebookProfile(accessToken);
    const user = await findOrCreateUserFromFacebook(profile);
    await recordFacebookLinkedInstagramFromToken(user.id, accessToken);
    const { scheduleShopSocialEnrichForUser } = await import("../lib/shop-social-enrich.js");
    scheduleShopSocialEnrichForUser(user.id);
    await assertAccountActive(user, user.phone_e164_digits ?? undefined);
    setUserSessionCookie(res, user.id);
    redirectOAuthSuccess(
      res,
      origin,
      state.returnTo,
      isNewlyRegisteredUser(user) ? { welcome: "1" } : undefined,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    req.log?.error({ err, message }, "facebook oauth callback");
    const code =
      /development mode|not available|app not active|not released/i.test(message)
        ? "facebook_app_not_live"
        : "facebook_failed";
    redirectOAuthLogin(res, origin, code);
  }
});

export default router;
