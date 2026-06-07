import { randomBytes } from "node:crypto";
import {
  db,
  facebookDataDeletionRequestsTable,
  userSocialConnectionsTable,
  usersTable,
  type FacebookDataDeletionStatus,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { softDeleteUserAccount } from "./soft-delete-account.js";

export function generateFacebookDeletionConfirmationCode(): string {
  return randomBytes(12).toString("hex");
}

function buildStatusUrl(origin: string, confirmationCode: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/auth/facebook/data-deletion/status?code=${encodeURIComponent(confirmationCode)}`;
}

export async function handleFacebookDataDeletionCallback(
  facebookUserId: string,
  origin: string,
): Promise<{ confirmationCode: string; statusUrl: string }> {
  const confirmationCode = generateFacebookDeletionConfirmationCode();
  const statusUrl = buildStatusUrl(origin, confirmationCode);

  let status: FacebookDataDeletionStatus = "completed";
  let userId: number | null = null;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.facebook_user_id, facebookUserId))
      .limit(1);

    if (!user) {
      status = "no_user";
    } else {
      userId = user.id;
      if (user.deleted_at) {
        status = "completed";
      } else {
        await db
          .delete(userSocialConnectionsTable)
          .where(
            and(
              eq(userSocialConnectionsTable.user_id, user.id),
              eq(userSocialConnectionsTable.platform, "facebook"),
            ),
          );

        await softDeleteUserAccount(user, {
          reason: "other",
          custom_text: "Meta Facebook data deletion callback",
          additional_feedback: `confirmation_code=${confirmationCode}`,
        });
        status = "completed";
      }
    }
  } catch {
    status = "failed";
    throw new Error("FACEBOOK_DATA_DELETION_FAILED");
  }

  await db.insert(facebookDataDeletionRequestsTable).values({
    confirmation_code: confirmationCode,
    facebook_user_id: facebookUserId,
    user_id: userId,
    status,
    completed_at: new Date(),
  });

  return { confirmationCode, statusUrl };
}

export async function getFacebookDataDeletionStatus(confirmationCode: string): Promise<{
  confirmation_code: string;
  status: FacebookDataDeletionStatus;
  message: string;
} | null> {
  const [row] = await db
    .select()
    .from(facebookDataDeletionRequestsTable)
    .where(eq(facebookDataDeletionRequestsTable.confirmation_code, confirmationCode))
    .limit(1);

  if (!row) {
    return null;
  }

  const status = row.status as FacebookDataDeletionStatus;
  const message =
    status === "failed"
      ? "Data deletion could not be completed. Contact support@ketujemi.com if you need help."
      : status === "no_user"
        ? "No KetuJemi account was linked to this Facebook identity, or the data was already removed."
        : "Your KetuJemi account and associated data linked to Facebook have been deleted.";

  return {
    confirmation_code: row.confirmation_code,
    status: status === "failed" ? "failed" : "completed",
    message,
  };
}
