import { db, userFcmTokensTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

type FcmMessage = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

let messagingClient: { sendEachForMulticast: (msg: unknown) => Promise<unknown> } | null = null;
let initAttempted = false;

async function getMessaging() {
  if (initAttempted) return messagingClient;
  initAttempted = true;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    logger.info("FCM disabled — FIREBASE_SERVICE_ACCOUNT_JSON not set");
    return null;
  }

  try {
    const admin = await import("firebase-admin");
    if (!admin.apps.length) {
      const cred = JSON.parse(raw) as Parameters<typeof admin.credential.cert>[0];
      admin.initializeApp({ credential: admin.credential.cert(cred) });
    }
    messagingClient = admin.messaging();
    logger.info("FCM initialized");
    return messagingClient;
  } catch (err) {
    logger.warn({ err }, "FCM init failed");
    return null;
  }
}

export async function registerFcmToken(
  userId: number,
  token: string,
  platform?: string,
): Promise<void> {
  const trimmed = token.trim();
  if (!trimmed) return;

  await db
    .insert(userFcmTokensTable)
    .values({
      user_id: userId,
      token: trimmed,
      platform: platform ?? null,
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: userFcmTokensTable.token,
      set: {
        user_id: userId,
        platform: platform ?? null,
        updated_at: new Date(),
      },
    });
}

export async function sendFcmToUser(userId: number, message: FcmMessage): Promise<void> {
  const messaging = await getMessaging();
  if (!messaging) return;

  const tokens = await db
    .select({ token: userFcmTokensTable.token })
    .from(userFcmTokensTable)
    .where(eq(userFcmTokensTable.user_id, userId));

  if (!tokens.length) return;

  const stale: string[] = [];

  try {
    const res = (await messaging.sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title: message.title, body: message.body },
      data: message.data,
      webpush: {
        fcmOptions: { link: process.env.APP_ORIGIN?.trim() || "https://ketujemi.com" },
      },
    })) as { responses: { success: boolean }[] };

    res.responses.forEach((r, i) => {
      if (!r.success) stale.push(tokens[i].token);
    });
  } catch (err) {
    logger.warn({ err, userId }, "FCM multicast failed");
    return;
  }

  for (const token of stale) {
    await db.delete(userFcmTokensTable).where(eq(userFcmTokensTable.token, token));
  }
}
