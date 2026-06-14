/** Mask seller phone for display (matches API contact-mask logic). */
export function maskSellerPhone(raw: string | null | undefined): string {
  const safe = raw?.trim() ?? "";
  if (!safe) return "+*** **** ***";
  const digits = safe.replace(/\D/g, "");
  if (digits.length < 8) return "+*** **** ***";

  let d = digits;
  if (d.startsWith("00")) d = d.slice(2);

  if (d.startsWith("383") && d.length >= 11) {
    return `+383 ${d.slice(3, 5)} XXX XX`;
  }
  if (d.startsWith("0") && d.length >= 9) {
    d = `383${d.slice(1)}`;
    return `+383 ${d.slice(3, 5)} XXX XX`;
  }
  if (d.startsWith("355") && d.length >= 11) {
    return `+355 ${d.slice(3, 4)}*** ***`;
  }
  if (d.startsWith("389") && d.length >= 11) {
    return `+389 ${d.slice(3, 4)}*** ***`;
  }
  if (d.startsWith("382") && d.length >= 9) {
    return `+382 ${d.slice(3, 4)}*** ***`;
  }

  const head = d.slice(0, 3);
  return `+${head} ${d.slice(3, 4)}*** ***`;
}
