import { Router } from "express";
import { purgeExpiredListings } from "../lib/expire-listings-job.js";
import { sendListingExpiryReminders } from "../lib/listing-expiry-reminders.js";

const router = Router();

function verifyCronSecret(authHeader: string | undefined): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

function unauthorized(res: { status: (n: number) => { json: (b: unknown) => void } }): void {
  res.status(401).json({ error: "unauthorized" });
}

/** Purge listings past expires_at — call every 15–60 min from Railway cron when inline maintenance is off. */
router.post("/cron/maintenance/purge-expired", async (req, res) => {
  if (!verifyCronSecret(req.headers.authorization)) {
    unauthorized(res);
    return;
  }
  try {
    const removed = await purgeExpiredListings();
    res.status(200).json({ ok: true, removed });
  } catch (err) {
    req.log?.error?.({ err }, "cron maintenance purge-expired error");
    res.status(500).json({ error: "cron_failed" });
  }
});

/** Send 3-day / 1-day expiry reminder emails — call every 6 h from Railway cron. */
router.post("/cron/maintenance/expiry-reminders", async (req, res) => {
  if (!verifyCronSecret(req.headers.authorization)) {
    unauthorized(res);
    return;
  }
  try {
    const result = await sendListingExpiryReminders();
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    req.log?.error?.({ err }, "cron maintenance expiry-reminders error");
    res.status(500).json({ error: "cron_failed" });
  }
});

/** Both maintenance tasks in one call. */
router.post("/cron/maintenance", async (req, res) => {
  if (!verifyCronSecret(req.headers.authorization)) {
    unauthorized(res);
    return;
  }
  try {
    const removed = await purgeExpiredListings();
    const reminders = await sendListingExpiryReminders();
    res.status(200).json({ ok: true, removed, ...reminders });
  } catch (err) {
    req.log?.error?.({ err }, "cron maintenance error");
    res.status(500).json({ error: "cron_failed" });
  }
});

export default router;
