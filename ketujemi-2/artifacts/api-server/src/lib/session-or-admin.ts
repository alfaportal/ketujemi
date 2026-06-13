import type { Request } from "express";
import { verifyAdminBearer } from "./admin-auth.js";
import { getSessionUser } from "./session-user.js";
import type { User } from "@workspace/db";

export function hasAdminBearer(req: Pick<Request, "headers">): boolean {
  return verifyAdminBearer(req.headers.authorization);
}

/** Logged-in user or valid admin panel bearer (no site login required). */
export async function isSessionOrAdminAuthorized(req: Request): Promise<boolean> {
  const viewer = await getSessionUser(req);
  if (viewer) return true;
  return hasAdminBearer(req);
}

export type SessionOrAdminAuth =
  | { kind: "user"; user: User }
  | { kind: "admin" };

export async function resolveSessionOrAdminAuth(req: Request): Promise<SessionOrAdminAuth | null> {
  const viewer = await getSessionUser(req);
  if (viewer) return { kind: "user", user: viewer };
  if (hasAdminBearer(req)) return { kind: "admin" };
  return null;
}
