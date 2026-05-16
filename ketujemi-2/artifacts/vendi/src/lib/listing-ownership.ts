import type { AuthUser } from "@/lib/auth-context";

/** Same logic as api-server `listing-ownership.ts` for UI guards. */
export function parseSpecsEmailFromDescription(description: string | null | undefined): string | null {
  if (!description) return null;
  const sep = "\n\n";
  const idx = description.indexOf(sep);
  if (idx <= 0) return null;
  const firstLine = description.slice(0, idx);
  if (!firstLine.includes(": ") || firstLine.includes("\n")) return null;
  for (const pair of firstLine.split(" · ")) {
    const colon = pair.indexOf(": ");
    if (colon <= 0) continue;
    const key = pair.slice(0, colon).trim();
    const val = pair.slice(colon + 2).trim();
    if (key === "Email" && val.includes("@")) return val.trim().toLowerCase();
  }
  return null;
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export function userOwnsListing(
  user: AuthUser,
  listing: { seller_phone: string; description: string },
): boolean {
  const ud = user.phone_e164_digits;
  const lp = digitsOnly(listing.seller_phone);
  if (ud && lp && ud === lp) return true;
  const ue = user.email?.trim().toLowerCase() ?? "";
  const specEmail = parseSpecsEmailFromDescription(listing.description);
  if (ue && specEmail && ue === specEmail) return true;
  return false;
}
