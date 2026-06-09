export type ShopSocialField = "facebook" | "instagram" | "tiktok" | "whatsapp" | "website";

export const SHOP_SOCIAL_PREFIX: Record<ShopSocialField, string> = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  whatsapp: "https://wa.me/",
  website: "https://",
};

/** Strip stored URL down to the part the user types after the prefix. */
export function shopSocialSuffix(value: string | null | undefined, field: ShopSocialField): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (field === "whatsapp") {
    const wa = raw.match(/wa\.me\/(\+?\d+)/i);
    if (wa) return wa[1]!.replace(/\D/g, "");
    const digits = raw.replace(/\D/g, "");
    return digits;
  }

  if (field === "website") {
    return raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  }

  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      if (field === "facebook" && host.includes("facebook.com")) {
        const slug = url.pathname.split("/").filter(Boolean)[0] ?? "";
        return slug === "profile.php" ? "" : slug;
      }
      if (field === "instagram" && host.includes("instagram.com")) {
        const slug = url.pathname.split("/").filter(Boolean)[0] ?? "";
        if (["p", "reel", "reels", "stories", "explore"].includes(slug.toLowerCase())) return raw;
        return slug;
      }
      if (field === "tiktok" && host.includes("tiktok.com")) {
        const part = url.pathname.split("/").find((p) => p.startsWith("@"));
        return part ? part.replace(/^@/, "") : url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "") ?? "";
      }
    }
  } catch {
    /* fall through */
  }

  return raw
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/^facebook\.com\//i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^tiktok\.com\/@?/i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
}

/** Build full URL from user suffix before API submit. */
export function shopSocialFullUrl(suffix: string, field: ShopSocialField): string {
  const s = suffix.trim().replace(/^@/, "").replace(/^\/+/, "").replace(/\/+$/, "");
  if (!s) return "";

  if (field === "whatsapp") {
    const digits = s.replace(/\D/g, "");
    return digits ? `${SHOP_SOCIAL_PREFIX.whatsapp}${digits}` : "";
  }

  if (field === "website") {
    if (/^https?:\/\//i.test(suffix)) return suffix.trim();
    const host = s.replace(/^www\./i, "");
    return host ? `${SHOP_SOCIAL_PREFIX.website}${host}` : "";
  }

  return `${SHOP_SOCIAL_PREFIX[field]}${s}`;
}

export function shopSocialFieldsForSubmit(values: {
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  website: string;
}): {
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  website: string | null;
} {
  return {
    facebook: shopSocialFullUrl(values.facebook, "facebook") || null,
    instagram: shopSocialFullUrl(values.instagram, "instagram") || null,
    tiktok: shopSocialFullUrl(values.tiktok, "tiktok") || null,
    whatsapp: shopSocialFullUrl(values.whatsapp, "whatsapp") || null,
    website: shopSocialFullUrl(values.website, "website") || null,
  };
}
