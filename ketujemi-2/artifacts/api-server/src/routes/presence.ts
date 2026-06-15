import { Router } from "express";
import { randomUUID } from "node:crypto";
import { touchSitePresence } from "../lib/site-presence.js";
import { resolveSessionCookieDomain } from "../lib/user-session.js";

const router = Router();

const PRESENCE_COOKIE = "kj_presence";
const PRESENCE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 1 day

function presenceCookieOptions() {
  const opts = {
    signed: true as const,
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  const domain = resolveSessionCookieDomain();
  return domain ? { ...opts, domain } : opts;
}

/** Heartbeat for any visitor (guest or logged-in) — counts toward “online now”. */
router.post("/presence", (req, res) => {
  let visitorId = req.signedCookies?.[PRESENCE_COOKIE];
  if (typeof visitorId !== "string" || !visitorId.trim()) {
    visitorId = randomUUID();
    res.cookie(PRESENCE_COOKIE, visitorId, {
      ...presenceCookieOptions(),
      maxAge: PRESENCE_MAX_AGE_MS,
    });
  }

  touchSitePresence(visitorId);
  res.json({ ok: true });
});

export default router;
