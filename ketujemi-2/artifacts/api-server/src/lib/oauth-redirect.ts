import { sanitizeOAuthReturnTo } from "./oauth-state";

export function redirectOAuthLogin(
  res: import("express").Response,
  origin: string,
  error: string,
): void {
  const url = `${origin.replace(/\/$/, "")}/login?error=${encodeURIComponent(error)}`;
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
