import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { getSessionUser } from "../lib/session-user";
import {
  listUserNotifications,
  markNotificationsRead,
  setSocialFollowPreference,
} from "../lib/engagement-notifications";
import { registerFcmToken } from "../lib/fcm-push";

const router: IRouter = Router();

router.get("/notifications", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const data = await listUserNotifications(user.id);
  res.json(data);
});

const MarkReadBody = z.object({
  ids: z.array(z.number().int().positive()).max(50),
});

router.patch("/notifications/read", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const parsed = MarkReadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  await markNotificationsRead(user.id, parsed.data.ids);
  const data = await listUserNotifications(user.id);
  res.json(data);
});

const SocialPrefBody = z.object({
  preference: z.enum(["opted_in", "opted_out"]),
  notification_id: z.number().int().positive().optional(),
});

router.post("/notifications/social-follow-preference", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const parsed = SocialPrefBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  await setSocialFollowPreference(user.id, parsed.data.preference);
  const data = await listUserNotifications(user.id);
  res.json({
    ok: true,
    social_follow_notif_preference: parsed.data.preference,
    ...data,
  });
});

const FcmTokenBody = z.object({
  token: z.string().min(20).max(4096),
  platform: z.string().max(32).optional(),
});

router.post("/fcm/register-token", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const parsed = FcmTokenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid token" });
    return;
  }
  await registerFcmToken(user.id, parsed.data.token, parsed.data.platform);
  res.json({ ok: true });
});

export default router;
