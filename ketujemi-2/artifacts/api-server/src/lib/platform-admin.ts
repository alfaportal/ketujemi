import type { User } from "@workspace/db";
import { getAdminEmail } from "./admin-monitor-email.js";

/** Hard fallback when EMAIL_ADMIN is not set on the server yet. */
export const PLATFORM_OPERATOR_EMAIL = "novelto22@gmail.com";

/** Platform operator account — never SMS verification; may post on behalf of sellers. */
export function isPlatformAdminUser(u: Pick<User, "email">): boolean {
  const email = u.email?.trim().toLowerCase();
  if (!email) return false;
  const admin = getAdminEmail()?.trim().toLowerCase();
  if (admin && email === admin) return true;
  return email === PLATFORM_OPERATOR_EMAIL.toLowerCase();
}

export function maskEmailForDisplay(email: string): string {
  const e = email.trim();
  const at = e.indexOf("@");
  if (at <= 1) return e;
  const local = e.slice(0, at);
  const domain = e.slice(at);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***${domain}`;
}
