import type { User } from "@workspace/db";

/** Email stored in the specs line at the start of `description` (`Email: …`). */
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

/** Normalize local 04x… to 383… for ownership checks. */
export function normalizePhoneDigits(digits: string): string {
  const d = digitsOnly(digits);
  if (!d) return d;
  if (d.startsWith("04") && d.length >= 8 && d.length <= 10) {
    return `383${d.slice(1)}`;
  }
  if (d.startsWith("07") && d.length === 9) {
    return `389${d}`;
  }
  if (d.startsWith("06") && d.length === 9) {
    return `382${d.slice(1)}`;
  }
  if (d.startsWith("06") && d.length === 10) {
    return `355${d.slice(1)}`;
  }
  return d;
}

export function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const na = normalizePhoneDigits(a);
  const nb = normalizePhoneDigits(b);
  if (na.length >= 8 && nb.length >= 8 && na === nb) return true;
  if (na.length >= 8 && nb.length >= 8 && na.slice(-8) === nb.slice(-8)) return true;
  return false;
}

/** Ownership without a listing.user_id column: match verified account phone or specs email. */
export function userOwnsListing(
  user: Pick<User, "email" | "phone_e164_digits" | "contact_phone">,
  listing: { seller_phone: string; description: string },
): boolean {
  if (phonesMatch(user.phone_e164_digits, listing.seller_phone)) return true;
  if (phonesMatch(user.contact_phone, listing.seller_phone)) return true;
  const ue = user.email?.trim().toLowerCase() ?? "";
  const specEmail = parseSpecsEmailFromDescription(listing.description);
  if (ue && specEmail && ue === specEmail) return true;
  return false;
}

/** Prefer stored user_id; fall back to phone/email for legacy listings. */
export function listingBelongsToUser(
  userId: number,
  user: Pick<User, "email" | "phone_e164_digits" | "contact_phone">,
  listing: { user_id: number | null; seller_phone: string; description: string },
): boolean {
  if (listing.user_id != null) return listing.user_id === userId;
  return userOwnsListing(user, listing);
}
