/** SMS-supported calling codes (E.164 digits without leading +). */
export type PhonePrefixOption = {
  dial: string;
  flag: string;
  label: string;
  minNational: number;
  maxNational: number;
};

/** SMS OTP only for Balkan markets (cost control). Diaspora: use email registration. */
export const SMS_PHONE_PREFIXES: PhonePrefixOption[] = [
  { dial: "383", flag: "🇽🇰", label: "Kosovë", minNational: 8, maxNational: 9 },
  { dial: "355", flag: "🇦🇱", label: "Shqipëri", minNational: 8, maxNational: 9 },
  { dial: "389", flag: "🇲🇰", label: "Maqedoni e Veriut", minNational: 8, maxNational: 9 },
  { dial: "382", flag: "🇲🇪", label: "Mal i Zi", minNational: 8, maxNational: 9 },
];

const BY_DIAL = new Map(SMS_PHONE_PREFIXES.map((p) => [p.dial, p]));

/** Longest-prefix match for parsing stored digits. */
const BY_DIAL_LONGEST = [...SMS_PHONE_PREFIXES].sort(
  (a, b) => b.dial.length - a.dial.length,
);

export function sanitizeNationalDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  while (d.startsWith("0")) d = d.slice(1);
  return d;
}

export function buildPhoneDigits(dial: string, national: string): string {
  const opt = BY_DIAL.get(dial);
  if (!opt) return "";
  const nat = sanitizeNationalDigits(national);
  if (nat.length < opt.minNational || nat.length > opt.maxNational) return "";
  return `${dial}${nat}`;
}

export function parsePhoneDigits(full: string): { dial: string; national: string } | null {
  const d = full.replace(/\D/g, "");
  if (!d) return null;
  for (const opt of BY_DIAL_LONGEST) {
    if (d.startsWith(opt.dial)) {
      const national = d.slice(opt.dial.length);
      if (national.length >= opt.minNational && national.length <= opt.maxNational) {
        return { dial: opt.dial, national };
      }
    }
  }
  return null;
}

export function isValidPhoneDigits(full: string): boolean {
  return parsePhoneDigits(full) !== null;
}

export function dialFromMarketPrefix(marketPrefix: string): string {
  return marketPrefix.replace(/\D/g, "") || "383";
}
