import { db, usersTable, adminSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { User } from "@workspace/db";
import { isUserSuspended } from "./violation-escalation";

const BANNED_PHONES_KEY = "banned_phones";

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export function isUserBanned(user: Pick<User, "banned_at" | "suspended_until">): boolean {
  return isUserSuspended(user);
}

export async function loadBannedPhoneSet(): Promise<Set<string>> {
  const [row] = await db
    .select()
    .from(adminSettingsTable)
    .where(eq(adminSettingsTable.key, BANNED_PHONES_KEY))
    .limit(1);
  if (!row?.value) return new Set();
  try {
    const arr = JSON.parse(row.value) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((p) => digitsOnly(String(p))).filter((p) => p.length >= 8));
  } catch {
    return new Set();
  }
}

export async function isPhoneBanned(phone: string): Promise<boolean> {
  const d = digitsOnly(phone);
  if (!d) return false;
  const set = await loadBannedPhoneSet();
  return set.has(d);
}

export async function saveBannedPhoneSet(phones: Set<string>): Promise<void> {
  const value = JSON.stringify([...phones]);
  await db
    .insert(adminSettingsTable)
    .values({ key: BANNED_PHONES_KEY, value })
    .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value } });
}

export async function assertAccountActive(
  user: Pick<User, "banned_at" | "suspended_until"> | null | undefined,
  phone?: string,
): Promise<void> {
  if (user && isUserBanned(user)) {
    throw new Error("ACCOUNT_BANNED");
  }
  if (phone && (await isPhoneBanned(phone))) {
    throw new Error("ACCOUNT_BANNED");
  }
}
