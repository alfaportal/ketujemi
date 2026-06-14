import { Router } from "express";
import { verifyAdminBearer } from "../lib/admin-auth.js";
import {
  countAnnouncementRecipients,
  listAnnouncementCampaigns,
  listAnnouncementEligibleUsers,
  parseAnnouncementRecipientUserIds,
  startAnnouncementCampaign,
} from "../lib/announcement-campaign.js";

const router = Router();

function requireAdmin(req: { headers: { authorization?: string } }, res: any, next: () => void) {
  if (verifyAdminBearer(req.headers.authorization)) return next();
  res.status(403).json({ error: "Forbidden" });
}

router.get("/admin/announcements/recipient-count", requireAdmin, async (_req, res) => {
  try {
    const count = await countAnnouncementRecipients();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/announcements/recipients", requireAdmin, async (_req, res) => {
  try {
    const users = await listAnnouncementEligibleUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/announcements/campaigns", requireAdmin, async (_req, res) => {
  try {
    const rows = await listAnnouncementCampaigns(30);
    res.json({
      campaigns: rows.map((c) => ({
        id: c.id,
        subject: c.subject,
        recipient_count: c.recipient_count,
        recipient_mode: c.recipient_mode,
        status: c.status,
        sent_by_admin_id: c.sent_by_admin_id,
        created_at: c.created_at.toISOString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/announcements/send", requireAdmin, async (req, res) => {
  try {
    const subject = typeof req.body?.subject === "string" ? req.body.subject : "";
    const body = typeof req.body?.body === "string" ? req.body.body : "";

    if (!subject.trim() || !body.trim()) {
      res.status(400).json({ error: "subject and body are required" });
      return;
    }

    const recipientUserIds = parseAnnouncementRecipientUserIds(req.body?.recipient_user_ids);
    const result = await startAnnouncementCampaign(subject, body, recipientUserIds);
    res.json({
      ok: true,
      campaign_id: result.campaignId,
      recipient_count: result.recipientCount,
      recipient_mode: result.recipientMode,
      status: result.status,
      message: `Duke dërguar te ${result.recipientCount} përdorues me email të verifikuar.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed";
    if (msg.includes("Subject must") || msg.includes("Body must")) {
      res.status(400).json({ error: msg });
      return;
    }
    if (msg.includes("No eligible recipients")) {
      res.status(400).json({ error: msg });
      return;
    }
    if (msg.includes("not configured")) {
      res.status(503).json({ error: msg });
      return;
    }
    req.log?.error({ err }, "admin announcement send failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
