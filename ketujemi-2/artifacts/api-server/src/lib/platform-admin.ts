import type { User } from "@workspace/db";
import { getAdminEmail } from "./admin-monitor-email.js";

/** Platform operator account (EMAIL_ADMIN / CONTACT_INBOX) — never SMS verification. */
export function isPlatformAdminUser(u: Pick<User, "email">): boolean {
  const admin = getAdminEmail()?.trim().toLowerCase();
  const email = u.email?.trim().toLowerCase();
  return Boolean(admin && email && email === admin);
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
