import { Router, type IRouter } from "express";
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

function parsePositiveIntIds(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) return null;
  const ids: number[] = [];
  for (const item of value) {
    const n = Number(item);
    if (!Number.isInteger(n) || n <= 0) return null;
    ids.push(n);
  }
  return ids;
}

router.patch("/notifications/read", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const ids = parsePositiveIntIds(req.body?.ids);
  if (!ids) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  await markNotificationsRead(user.id, ids);
  const data = await listUserNotifications(user.id);
  res.json(data);
});

router.post("/notifications/social-follow-preference", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const preference = req.body?.preference;
  if (preference !== "opted_in" && preference !== "opted_out") {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  await setSocialFollowPreference(user.id, preference);
  const data = await listUserNotifications(user.id);
  res.json({
    ok: true,
    social_follow_notif_preference: preference,
    ...data,
  });
});

router.post("/fcm/register-token", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
  const platform =
    typeof req.body?.platform === "string" ? req.body.platform.trim().slice(0, 32) : undefined;
  if (token.length < 20 || token.length > 4096) {
    res.status(400).json({ error: "Invalid token" });
    return;
  }
  await registerFcmToken(user.id, token, platform);
  res.json({ ok: true });
});

export default router;
