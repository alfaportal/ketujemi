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

async function runPhotoCron(
  platform: "facebook" | "instagram" | "both",
): Promise<{ facebook?: Awaited<ReturnType<typeof runFacebookScheduledPostNow>>; instagram?: Awaited<ReturnType<typeof runInstagramScheduledPostNow>> }> {
  await initializeFacebookPageAccessToken();
  if (platform === "facebook") {
    return { facebook: await runFacebookScheduledPostNow() };
  }
  if (platform === "instagram") {
    return { instagram: await runInstagramScheduledPostNow() };
  }
  const facebook = await runFacebookScheduledPostNow();
  const instagram = await runInstagramScheduledPostNow();
  return { facebook, instagram };
}

function cronHandler(platform: "facebook" | "instagram" | "both") {
  return async (req: { headers: { authorization?: string }; log?: { error?: (o: unknown, msg: string) => void } }, res: { status: (n: number) => { json: (b: unknown) => void } }) => {
    if (!verifyCronSecret(req.headers.authorization)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      const result = await runPhotoCron(platform);
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      req.log?.error?.({ err }, `cron social-scheduled-posts/${platform} error`);
      res.status(500).json({ error: "cron_failed" });
    }
  };
}

/** Facebook photo post — schedule: 10:00, 14:00, 19:00, 22:00 Europe/Belgrade (in-process cron). */
router.post("/cron/social-scheduled-posts/facebook", cronHandler("facebook"));

/** Instagram photo post — schedule: 10:30, 14:30, 19:30, 22:30 Europe/Belgrade (in-process cron). */
router.post("/cron/social-scheduled-posts/instagram", cronHandler("instagram"));

/** Trigger FB + IG scheduled photo posts (manual / backup). */
router.post("/cron/social-scheduled-posts", cronHandler("both"));

export default router;
