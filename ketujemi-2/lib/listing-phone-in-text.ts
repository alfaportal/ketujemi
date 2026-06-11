/** True when user text contains a phone-like sequence with at least 8 digits. */
export function hasDisallowedPhoneInUserText(text: string): boolean {
  if (!text.trim()) return false;
  const segments = text.match(/(?:\+?\d[\d\s\-().]{6,}\d)/g) ?? [];
  for (const seg of segments) {
    if (seg.replace(/\D/g, "").length >= 8) return true;
  }
  return false;
}
