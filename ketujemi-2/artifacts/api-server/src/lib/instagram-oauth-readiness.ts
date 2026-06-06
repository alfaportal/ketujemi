import type { Logger } from "pino";
import {
  facebookAppId,
  instagramAppId,
  instagramAppSecret,
  instagramOAuthCallbackUrlForOrigin,
  isInstagramOAuthEnabled,
  isInstagramOAuthMisconfigured,
} from "./meta-oauth-config";

export function logInstagramOAuthReadiness(log: Logger): void {
  const igId = instagramAppId();
  const igSecret = instagramAppSecret();
  const fbId = facebookAppId();
  const origin =
    process.env.PUBLIC_APP_ORIGIN?.trim().replace(/\/$/, "") || "https://ketujemi.com";

  if (!igId || !igSecret) {
    log.warn(
      {
        hasInstagramAppId: Boolean(igId),
        hasInstagramAppSecret: Boolean(igSecret),
        callbackUrl: instagramOAuthCallbackUrlForOrigin(origin),
      },
      "Instagram OAuth disabled: set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET from Meta Dashboard → Instagram → API setup with Instagram login → Business login settings",
    );
    return;
  }

  if (isInstagramOAuthMisconfigured()) {
    log.warn(
      { instagramAppId: igId, facebookAppId: fbId },
      'Instagram OAuth misconfigured: INSTAGRAM_APP_ID must not equal FACEBOOK_APP_ID — use the separate "Instagram App ID" from Business login settings',
    );
    return;
  }

  log.info(
    {
      instagramAppId: igId,
      facebookAppId: fbId ?? null,
      callbackUrl: instagramOAuthCallbackUrlForOrigin(origin),
      enabled: isInstagramOAuthEnabled(),
    },
    "Instagram OAuth ready",
  );
}
