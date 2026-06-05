import type { VercelRequest, VercelResponse } from "@vercel/node";
import { purgeExpiredListings } from "./lib/expire-listings-job";
import { sendListingExpiryReminders } from "./lib/listing-expiry-reminders";
/** Hourly cron: purge expired listings + send expiry reminder emails. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers.authorization ?? "";
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
  }

  try {
    const purged = await purgeExpiredListings();
    const reminders = await sendListingExpiryReminders();
    res.status(200).json({ ok: true, purged, reminders });
  } catch (err) {
    console.error("[cron/jobs]", err);
    res.status(500).json({ error: "cron_failed" });
  }
}
