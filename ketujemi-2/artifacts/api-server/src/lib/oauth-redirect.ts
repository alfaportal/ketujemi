import { sanitizeOAuthReturnTo } from "./oauth-state";

export function redirectOAuthLogin(
  res: import("express").Response,
  origin: string,
  error: string,
  extra?: Record<string, string>,
): void {
  const params = new URLSearchParams({ error, ...extra });
  const url = `${origin.replace(/\/$/, "")}/login?${params.toString()}`;
  res.redirect(302, url);
}

export function redirectOAuthSuccess(
  res: import("express").Response,
  origin: string,
  returnTo: string,
  extra?: Record<string, string>,
): void {
  const path = sanitizeOAuthReturnTo(returnTo);
  const params = new URLSearchParams({ verified: "1", ...extra });
  const sep = path.includes("?") ? "&" : "?";
  const url = `${origin.replace(/\/$/, "")}${path}${sep}${params.toString()}`;
  res.redirect(302, url);
}

/**
 * OAuth success redirect via an HTML bounce page instead of a bare 302.
 *
 * iOS Safari (ITP 2.x+) treats a Set-Cookie header on a cross-site 302 redirect
 * as "bounce tracking" and may cap or discard the cookie.  Serving a small HTML
 * page with window.location.replace() makes the final navigation first-party,
 * so the session cookie is stored at full lifetime.  Also fixes cookie isolation
 * inside Facebook's WKWebView in-app browser on iOS.
 */
export function redirectOAuthSuccessHtml(
  res: import("express").Response,
  origin: string,
  returnTo: string,
  extra?: Record<string, string>,
): void {
  const path = sanitizeOAuthReturnTo(returnTo);
  const params = new URLSearchParams({ verified: "1", ...extra });
  const sep = path.includes("?") ? "&" : "?";
  const url = `${origin.replace(/\/$/, "")}${path}${sep}${params.toString()}`;

  const htmlUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const jsUrl = JSON.stringify(url);

  res
    .status(200)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private")
    .setHeader("Pragma", "no-cache")
    .send(
      `<!DOCTYPE html><html><head><meta charset="utf-8">` +
        `<meta http-equiv="refresh" content="0; url=${htmlUrl}">` +
        `<script>window.location.replace(${jsUrl});</script>` +
        `</head><body></body></html>`,
    );
}
