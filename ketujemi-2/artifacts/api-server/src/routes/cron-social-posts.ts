import { Router } from "express";
import { runFacebookScheduledPostNow } from "../lib/facebook-scheduled-post-cron.js";
import { runInstagramScheduledPostNow } from "../lib/instagram-scheduled-post-cron.js";
import { initializeFacebookPageAccessToken } from "../services/socialMedia.js";

const router = Router();

function verifyCronSecret(authHeader: string | undefined): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

/** Trigger FB + IG scheduled posts on the running server (uses Railway env vars). */
router.post("/cron/social-scheduled-posts", async (req, res) => {
  if (!verifyCronSecret(req.headers.authorization)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  try {
    await initializeFacebookPageAccessToken();
    const facebook = await runFacebookScheduledPostNow();
    const instagram = await runInstagramScheduledPostNow();
    res.json({ ok: true, facebook, instagram });
  } catch (err) {
    req.log?.error?.({ err }, "cron social-scheduled-posts error");
    res.status(500).json({ error: "cron_failed" });
  }
});

export default router;
