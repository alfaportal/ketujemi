/** SMS-supported calling codes — keep in sync with vendi `phone-prefixes.ts`. */
type PhonePrefixRule = {
  dial: string;
  minNational: number;
  maxNational: number;
};

const SMS_PHONE_PREFIX_RULES: PhonePrefixRule[] = [
  { dial: "383", minNational: 8, maxNational: 9 },
  { dial: "355", minNational: 8, maxNational: 9 },
  { dial: "389", minNational: 8, maxNational: 9 },
  { dial: "382", minNational: 8, maxNational: 9 },
  { dial: "49", minNational: 9, maxNational: 11 },
  { dial: "43", minNational: 9, maxNational: 11 },
  { dial: "41", minNational: 9, maxNational: 9 },
  { dial: "39", minNational: 9, maxNational: 10 },
  { dial: "33", minNational: 9, maxNational: 9 },
  { dial: "44", minNational: 10, maxNational: 10 },
  { dial: "1", minNational: 10, maxNational: 10 },
];

const BY_DIAL_LONGEST = [...SMS_PHONE_PREFIX_RULES].sort(
  (a, b) => b.dial.length - a.dial.length,
);

/** Normalize to E.164 digits (no +) or null if invalid / unsupported prefix. */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let d = input.replace(/\D/g, "");
  if (!d) return null;

  for (const rule of BY_DIAL_LONGEST) {
    if (d.startsWith(rule.dial)) {
      const national = d.slice(rule.dial.length);
      if (national.length >= rule.minNational && national.length <= rule.maxNational) {
        return d;
      }
      return null;
    }
  }
  return null;
}
