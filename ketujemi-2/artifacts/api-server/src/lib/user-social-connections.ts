import { db, userSocialConnectionsTable } from "@workspace/db";
import type { UserSocialPlatform } from "@workspace/db";
import { logger } from "./logger.js";

export type RecordSocialConnectionInput = {
  userId: number;
  platform: UserSocialPlatform;
  externalUserId: string;
  username?: string | null;
};

/** Record only the platform the user actually verified (one row per user+platform). */
export async function recordUserSocialConnection(input: RecordSocialConnectionInput): Promise<void> {
  const externalUserId = input.externalUserId?.trim();
  if (!externalUserId) return;

  const username = input.username?.trim().replace(/^@/, "").toLowerCase() || null;

  try {
    await db
      .insert(userSocialConnectionsTable)
      .values({
        user_id: input.userId,
        platform: input.platform,
        external_user_id: externalUserId,
        username,
        verified_at: new Date(),
      })
      .onConflictDoUpdate({
        target: [userSocialConnectionsTable.user_id, userSocialConnectionsTable.platform],
        set: {
          external_user_id: externalUserId,
          username,
          verified_at: new Date(),
        },
      });
  } catch (err) {
    logger.warn({ err, userId: input.userId, platform: input.platform }, "user social connection save failed");
  }
}
