import type { User } from "@workspace/db";
import { isBusinessAccount, isVipBusinessActive } from "./business-rules";

export type BusinessStatus = "pending" | "active" | "blocked";
export type PartnerLinkType = "website" | "instagram" | "facebook";

export const PARTNER_PACKAGE_PRICE_EUR = { partner: 30, vip: 50 } as const;

export function getBusinessStatus(user: Pick<User, "account_type" | "business_status">): BusinessStatus | null {
  if (!isBusinessAccount(user)) return null;
  const s = user.business_status?.trim();
  if (s === "pending" || s === "active" || s === "blocked") return s;
  return "active";
}

export function isBusinessPartnerActive(
  user: Pick<User, "account_type" | "business_status" | "banned_at" | "suspended_until"> | null | undefined,
): boolean {
  if (!user || !isBusinessAccount(user)) return false;
  if (user.banned_at) return false;
  if (user.suspended_until && new Date(user.suspended_until) > new Date()) return false;
  return getBusinessStatus(user) === "active";
}

export function isBusinessPartnerPending(user: Pick<User, "account_type" | "business_status">): boolean {
  return isBusinessAccount(user) && getBusinessStatus(user) === "pending";
}

export function parsePartnerBannerUrls(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && /^https?:\/\//i.test(u))
      .slice(0, 5);
  } catch {
    return [];
  }
}

export function serializePartnerBannerUrls(urls: string[]): string | null {
  const clean = urls
    .map((u) => u.trim())
    .filter((u) => u.length > 0 && /^https?:\/\//i.test(u))
    .slice(0, 5);
  return clean.length > 0 ? JSON.stringify(clean) : null;
}

function normalizeInstagramUrl(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      if (!/instagram\.com$/i.test(u.hostname.replace(/^www\./, ""))) return null;
      return u.toString();
    } catch {
      return null;
    }
  }
  const handle = v.replace(/^@/, "").replace(/[^\w.]/g, "");
  if (handle.length < 1) return null;
  return `https://www.instagram.com/${handle}/`;
}

function normalizeFacebookUrl(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      if (!/facebook\.com$/i.test(u.hostname.replace(/^www\./, ""))) return null;
      return u.toString();
    } catch {
      return null;
    }
  }
  const slug = v.replace(/^@/, "").replace(/[^\w.]/g, "");
  if (slug.length < 1) return null;
  return `https://www.facebook.com/${slug}`;
}

function normalizeWebsiteUrl(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function normalizePartnerLink(
  type: PartnerLinkType,
  raw: string,
): { ok: true; url: string; type: PartnerLinkType } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Linku është i detyrueshëm." };
  }
  let url: string | null = null;
  if (type === "website") url = normalizeWebsiteUrl(trimmed);
  else if (type === "instagram") url = normalizeInstagramUrl(trimmed);
  else url = normalizeFacebookUrl(trimmed);

  if (!url) {
    return { ok: false, message: "URL e pavlefshme për llojin e zgjedhur." };
  }
  if (url.length > 2048) {
    return { ok: false, message: "Linku është shumë i gjatë." };
  }
  return { ok: true, url, type };
}

export function resolvePartnerClickUrl(
  user: Pick<User, "partner_link_url" | "partner_link_type">,
): string | null {
  const url = user.partner_link_url?.trim();
  const type = user.partner_link_type?.trim() as PartnerLinkType | undefined;
  if (!url || !type || !["website", "instagram", "facebook"].includes(type)) return null;
  const norm = normalizePartnerLink(type, url);
  return norm.ok ? norm.url : null;
}

/** VIP partner strip / carousel eligibility (paid VIP package, active, not expired). */
export function isVipPartnerActive(user: User): boolean {
  return isBusinessPartnerActive(user) && isVipBusinessActive(user);
}
