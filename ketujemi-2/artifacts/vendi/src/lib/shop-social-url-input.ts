export type ShopSocialField = "facebook" | "instagram" | "tiktok" | "whatsapp" | "website";

export const SHOP_SOCIAL_PREFIX: Record<Exclude<ShopSocialField, "whatsapp" | "website">, string> = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/@",
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
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = shopWhatsappDigits(raw);
  return digits ? `https://wa.me/${digits}` : null;
}

/** Value shown in the form — full URL when stored, otherwise rebuilt from legacy bare input. */
export function shopSocialSuffix(value: string | null | undefined, field: ShopSocialField): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  if (field === "whatsapp") {
    return shopWhatsappHref(raw) ?? raw;
  }

  const built = shopSocialFullUrl(raw, field);
  return built || raw;
}

/** Normalize pasted link (or legacy bare handle) before API submit. */
export function shopSocialFullUrl(raw: string, field: ShopSocialField): string {
  const s = raw.trim();
  if (!s) return "";

  if (field === "whatsapp") {
    if (/^https?:\/\//i.test(s)) return s;
    return shopWhatsappHref(s) ?? "";
  }

  if (/^https?:\/\//i.test(s)) return s;

  if (field === "website") {
    if (s.includes(".")) return `https://${s.replace(/^www\./i, "")}`;
    return "";
  }

  const handle = s.replace(/^@/, "").replace(/^\/+/, "").replace(/\/+$/, "");
  if (!handle) return "";
  return `${SHOP_SOCIAL_PREFIX[field]}${handle}`;
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
