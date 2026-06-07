import type { Request } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import type { User } from "@workspace/db";

/** Current user from signed `kj_session` cookie, or null. */
export async function getSessionUser(req: Request): Promise<User | null> {
  const raw = req.signedCookies?.kj_session;
  const id = raw != null ? Number(raw) : NaN;
  if (!Number.isFinite(id) || id <= 0) return null;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.id, id), isNull(usersTable.deleted_at)))
    .limit(1);
  return user ?? null;
}
