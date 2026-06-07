import type { NextFunction, Request, Response } from "express";

/** Canonical production hostname (no www) — for SEO and redirects. */
export const CANONICAL_HOST = "ketujemi.com";

export function getCanonicalOrigin(): string {
  const env = process.env.PUBLIC_APP_ORIGIN?.trim().replace(/\/$/, "");
  if (env) return env;
  return `https://${CANONICAL_HOST}`;
}

function hostnameFromRequest(req: Request): string {
  const host = (req.get("x-forwarded-host") ?? req.get("host") ?? "").toLowerCase();
  return host.split(":")[0] ?? "";
}

/**
 * Production: www → non-www (301), http → https on canonical host.
 * Skip /api/healthz so Railway health checks are not redirected.
 */
export function canonicalHostRedirect(req: Request, res: Response, next: NextFunction): void {
  if (
    req.path === "/api/healthz" ||
    req.path.startsWith("/api/health") ||
    req.path === "/api/cron/social-scheduled-posts"
  ) {
    next();
    return;
  }

  const hostname = hostnameFromRequest(req);
  const proto = (req.get("x-forwarded-proto") ?? req.protocol ?? "http").split(",")[0]!.trim();
  const target = `${getCanonicalOrigin()}${req.originalUrl}`;

  if (hostname === `www.${CANONICAL_HOST}`) {
    res.redirect(301, target);
    return;
  }

  if (hostname === CANONICAL_HOST && proto === "http") {
    res.redirect(301, target);
    return;
  }

  next();
}

/** App URLs in emails, Stripe, OAuth — always canonical in production when on ketujemi.com. */
export function resolveAppOrigin(req: { get: (name: string) => string | undefined }): string {
  const env = process.env.PUBLIC_APP_ORIGIN?.trim().replace(/\/$/, "");
  if (env) return env;

  const hostname = (req.get("x-forwarded-host") ?? req.get("host") ?? "")
    .toLowerCase()
    .split(":")[0];

  if (hostname === CANONICAL_HOST || hostname === `www.${CANONICAL_HOST}`) {
    return getCanonicalOrigin();
  }

  const proto = req.get("x-forwarded-proto") ?? "http";
  return hostname ? `${proto}://${hostname}` : "http://localhost:5173";
}
