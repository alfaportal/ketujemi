import type { AuthUser } from "@/lib/auth-context";

/** Must match server PLATFORM_OPERATOR_EMAIL in platform-admin.ts */
export const PLATFORM_OPERATOR_EMAIL = "novelto22@gmail.com";

export function isPlatformOperatorEmail(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === PLATFORM_OPERATOR_EMAIL.toLowerCase();
}

/** Logged-in platform operator (admin on-behalf posting). */
export function isPlatformOperatorUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return !!user.is_platform_admin || isPlatformOperatorEmail(user.email);
}
