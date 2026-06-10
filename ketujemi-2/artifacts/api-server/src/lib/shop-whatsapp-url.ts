function whatsappDigits(raw: string): string | null {
  const trimmed = raw.trim();
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

/** Normalize shop WhatsApp to canonical https://wa.me/… for storage. */
export function normalizeShopWhatsappStored(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const digits = whatsappDigits(trimmed);
  return digits ? `https://wa.me/${digits}` : trimmed;
}
