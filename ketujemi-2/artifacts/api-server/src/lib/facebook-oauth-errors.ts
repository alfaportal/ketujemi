/** Map Meta OAuth callback query params to internal error codes + user-facing hints. */

export type FacebookOAuthCallbackError = {
  code: string;
  logReason: string;
  logDescription: string;
};

export function parseFacebookOAuthCallbackError(query: Record<string, unknown>): FacebookOAuthCallbackError {
  const error = typeof query.error === "string" ? query.error : "";
  const reason = typeof query.error_reason === "string" ? query.error_reason : "";
  const description = typeof query.error_description === "string" ? query.error_description : "";
  const combined = `${reason} ${description}`.toLowerCase();

  if (
    reason === "app_not_active" ||
    /development mode|not available to the public|not released|not live|app not setup/i.test(combined)
  ) {
    return {
      code: "facebook_app_not_live",
      logReason: reason || error,
      logDescription: description || "Meta app is in Development mode or not public",
    };
  }

  if (error === "access_denied" || reason === "user_denied") {
    return {
      code: "facebook_denied",
      logReason: reason || error,
      logDescription: description,
    };
  }

  return {
    code: "facebook_failed",
    logReason: reason || error || "unknown",
    logDescription: description,
  };
}
