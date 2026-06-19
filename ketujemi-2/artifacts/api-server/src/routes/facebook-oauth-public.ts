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
import {
  isNewlyRegisteredUser,
  sessionCookieDebugInfo,
  setUserSessionCookie,
} from "../lib/user-session";
import { assertAccountActive } from "../lib/user-ban";
import { parseFacebookOAuthCallbackError } from "../lib/facebook-oauth-errors.js";
import { redirectOAuthLogin, redirectOAuthSuccessHtml } from "../lib/oauth-redirect";
import { parseFacebookSignedRequest } from "../lib/facebook-signed-request.js";
import {
  getFacebookDataDeletionStatus,
  handleFacebookDataDeletionCallback,
} from "../lib/facebook-data-deletion.js";

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

    console.log("[facebook oauth callback] findOrCreateUserFromFacebook", {
      userId: user.id,
      facebookUserId: profile.id,
      email: user.email ?? profile.email ?? null,
      displayName: user.display_name ?? profile.name ?? null,
      isNewUser: isNewlyRegisteredUser(user),
      origin,
      returnTo: state.returnTo,
    });

    await assertAccountActive(user, user.phone_e164_digits ?? undefined);

    setUserSessionCookie(res, user.id);

    const welcome = isNewlyRegisteredUser(user) ? { welcome: "1" } : undefined;
    const redirectPath = sanitizeOAuthReturnTo(state.returnTo);
    const redirectParams = new URLSearchParams({ verified: "1", ...welcome });
    const redirectSep = redirectPath.includes("?") ? "&" : "?";
    const redirectUrl = `${origin.replace(/\/$/, "")}${redirectPath}${redirectSep}${redirectParams.toString()}`;

    console.log("[facebook oauth callback] session cookie set before redirect", {
      userId: user.id,
      cookie: sessionCookieDebugInfo(),
      setCookieHeader: res.getHeader("Set-Cookie"),
      redirectUrl,
    });

    // Optional post-login enrichment — must not block session cookie + redirect.
    void recordFacebookLinkedInstagramFromToken(user.id, accessToken);
    void import("../lib/shop-social-enrich.js").then((m) =>
      m.scheduleShopSocialEnrichForUser(user.id),
    );

    redirectOAuthSuccessHtml(res, origin, state.returnTo, welcome);
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

/** Meta Data Deletion Request callback — configure in App Dashboard → Settings → Basic. */
router.post("/auth/facebook/data-deletion", async (req, res) => {
  const signedRequest =
    typeof req.body?.signed_request === "string"
      ? req.body.signed_request.trim()
      : "";

  if (!signedRequest) {
    res.status(400).json({ error: "MISSING_SIGNED_REQUEST" });
    return;
  }

  const parsed = parseFacebookSignedRequest(signedRequest);
  if (!parsed.ok) {
    req.log?.warn({ error: parsed.error }, "facebook data deletion invalid signed_request");
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const origin = appOriginFromRequest(req);
    const result = await handleFacebookDataDeletionCallback(parsed.payload.user_id, origin);
    res.status(200).json({
      url: result.statusUrl,
      confirmation_code: result.confirmationCode,
    });
  } catch (err) {
    req.log?.error({ err }, "facebook data deletion failed");
    res.status(500).json({ error: "DELETION_FAILED" });
  }
});

router.get("/auth/facebook/data-deletion/status", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code.trim() : "";
  if (!code) {
    res.status(400).json({ error: "MISSING_CODE" });
    return;
  }

  const status = await getFacebookDataDeletionStatus(code);
  if (!status) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }

  res.status(200).json(status);
});

export default router;
