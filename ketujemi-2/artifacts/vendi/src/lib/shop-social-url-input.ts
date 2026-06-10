export type ShopSocialField = "facebook" | "instagram" | "tiktok" | "whatsapp" | "website";

export const SHOP_SOCIAL_PREFIX: Record<ShopSocialField, string> = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  whatsapp: "https://wa.me/",
  website: "https://",
};

/** E.164 digits for wa.me (handles stored URLs, plain numbers, and 0xx local Kosovo). */
export function shopWhatsappDigits(raw: string | null | undefined): string | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;

  const waInline = trimmed.match(/wa\.me\/([^\s?#/]+)/i);
  if (waInline) {
    const digits = waInline[1]!.replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) return digits;
  }

  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 11) {
    digits = `383${digits.slice(1)}`;
  }
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

/** Canonical https://wa.me/… link for shop WhatsApp buttons. */
export function shopWhatsappHref(raw: string | null | undefined): string | null {
  const digits = shopWhatsappDigits(raw);
  return digits ? `${SHOP_SOCIAL_PREFIX.whatsapp}${digits}` : null;
}

/** Strip stored URL down to the part the user types after the prefix. */
export function shopSocialSuffix(value: string | null | undefined, field: ShopSocialField): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (field === "whatsapp") {
    return shopWhatsappDigits(raw) ?? "";
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
    return shopWhatsappHref(s) ?? "";
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
