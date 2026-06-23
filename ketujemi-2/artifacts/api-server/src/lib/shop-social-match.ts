import type { shopsTable } from "@workspace/db";
import { handlesMatch, parseInstagramUrl, parseTikTokUrl } from "./social-url-parser.js";

export type ShopSocialPlatform = "facebook" | "instagram" | "tiktok";

export type ParsedFacebookUrl = {
  platform: "facebook";
  handle: string;
  profileUrl: string;
  sourceUrl: string;
};

function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

/** Parse Facebook page/profile URL or @page slug. */
export function parseFacebookUrl(input: string | null | undefined): ParsedFacebookUrl | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      if (!host.includes("facebook.com") && !host.includes("fb.com")) return null;

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0]?.toLowerCase() === "profile.php") {
        const id = url.searchParams.get("id")?.trim();
        if (!id || !/^\d+$/.test(id)) return null;
        return {
          platform: "facebook",
          handle: `id:${id}`,
          profileUrl: `https://www.facebook.com/profile.php?id=${id}`,
          sourceUrl: raw,
        };
      }

      const slug = parts[0]?.toLowerCase();
      if (!slug || ["pages", "share", "sharer", "watch", "groups", "events"].includes(slug)) {
        return null;
      }
      const handle = normalizeHandle(slug);
      if (!handle) return null;
      return {
        platform: "facebook",
        handle,
        profileUrl: `https://www.facebook.com/${handle}/`,
        sourceUrl: raw,
      };
    }

    const handle = normalizeHandle(raw.replace(/^@/, ""));
    if (!handle || handle.length < 2) return null;
    return {
      platform: "facebook",
      handle,
      profileUrl: `https://www.facebook.com/${handle}/`,
      sourceUrl: raw,
    };
  } catch {
    const handle = normalizeHandle(raw.replace(/^@/, ""));
    if (!handle) return null;
    return {
      platform: "facebook",
      handle,
      profileUrl: `https://www.facebook.com/${handle}/`,
      sourceUrl: raw,
    };
  }
}

type SocialFingerprint = {
  platform: ShopSocialPlatform;
  handle: string;
};

function shopFingerprints(shop: Pick<
  typeof shopsTable.$inferSelect,
  "facebook" | "instagram" | "tiktok"
>): SocialFingerprint[] {
  const out: SocialFingerprint[] = [];
  const fb = parseFacebookUrl(shop.facebook);
  if (fb) out.push({ platform: "facebook", handle: fb.handle });
  const ig = parseInstagramUrl(shop.instagram);
  if (ig) out.push({ platform: "instagram", handle: ig.handle });
  const tt = parseTikTokUrl(shop.tiktok);
  if (tt) out.push({ platform: "tiktok", handle: tt.handle });
  return out;
}

function fingerprintsFromText(text: string): SocialFingerprint[] {
  const out: SocialFingerprint[] = [];
  const seen = new Set<string>();

  const urlRe = /https?:\/\/[^\s<>"']+/gi;
  for (const match of text.match(urlRe) ?? []) {
    const fb = parseFacebookUrl(match);
    if (fb) {
      const key = `facebook:${fb.handle}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ platform: "facebook", handle: fb.handle });
      }
    }
    const ig = parseInstagramUrl(match);
    if (ig) {
      const key = `instagram:${ig.handle}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ platform: "instagram", handle: ig.handle });
      }
    }
    const tt = parseTikTokUrl(match);
    if (tt) {
      const key = `tiktok:${tt.handle}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ platform: "tiktok", handle: tt.handle });
      }
    }
  }

  for (const match of text.match(/@[a-z0-9._]{2,30}/gi) ?? []) {
    const handle = normalizeHandle(match);
    if (!handle) continue;
    const key = `mention:${handle}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ platform: "instagram", handle });
  }

  return out;
}

function collectProbeText(input: {
  description?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
}): string {
  return [input.description, input.facebook, input.instagram, input.tiktok]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .join("\n");
}

function shopMatchesAnyFingerprint(
  shop: Pick<typeof shopsTable.$inferSelect, "id" | "facebook" | "instagram" | "tiktok">,
  probes: SocialFingerprint[],
): boolean {
  if (probes.length === 0) return false;
  const shopFp = shopFingerprints(shop);
  if (shopFp.length === 0) return false;
  return probes.some((probe) =>
    shopFp.some(
      (s) => s.platform === probe.platform && handlesMatch(s.handle, probe.handle),
    ),
  );
}

/** Match shop when IG/FB/TikTok in text uniquely identifies one active shop (admin path). */
export function findShopByUniqueSocialFromText<
  T extends Pick<typeof shopsTable.$inferSelect, "id" | "facebook" | "instagram" | "tiktok">,
>(shops: T[], input: {
  description?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
}): T | null {
  const text = collectProbeText(input);
  if (!text.trim()) return null;

  const probes = fingerprintsFromText(text);
  if (probes.length === 0) return null;

  const matches = shops.filter((shop) => shopMatchesAnyFingerprint(shop, probes));
  return matches.length === 1 ? matches[0]! : null;
}

/** Whether a listing belongs to a shop via social URLs in description (multi-shop admin). */
export function listingTextMatchesShopSocial(
  listingText: string | null | undefined,
  shop: Pick<typeof shopsTable.$inferSelect, "facebook" | "instagram" | "tiktok">,
): boolean {
  const text = listingText?.trim() ?? "";
  if (!text) return false;
  const probes = fingerprintsFromText(text);
  return shopMatchesAnyFingerprint(shop, probes);
}
