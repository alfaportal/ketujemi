/** Vehicle / tech tokens that stay uppercase in listing titles. */
const TITLE_ACRONYMS = new Set([
  "tdi", "gtd", "gti", "gt", "gts", "tsi", "tfsi", "fsi", "cdi", "hdi", "dci",
  "bmw", "vw", "suv", "4x4", "awd", "fwd", "rwd", "abs", "esp", "gps", "usb",
  "hdmi", "led", "oled", "ram", "ssd", "hdd", "gb", "tb", "mhz", "ghz", "kw",
  "hp", "ps", "cv", "at", "mt", "dsg", "cvt", "amg", "m3", "m5", "rs", "s3",
  "s4", "s5", "x5", "x6", "ev", "phev", "hybrid",
]);

function titleWordToken(word: string): string {
  const bare = word.replace(/[.,;:!?()[\]{}]+$/, "");
  const suffix = word.slice(bare.length);
  const lower = bare.toLowerCase();
  if (!bare) return word;
  if (TITLE_ACRONYMS.has(lower)) return lower.toUpperCase() + suffix;
  if (/^\d+([.,]\d+)?$/.test(bare)) return bare + suffix;
  if (bare === bare.toUpperCase() && bare.length <= 4 && /[A-Z]/.test(bare)) {
    return bare + suffix;
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1) + suffix;
}

export function normalizeListingTitle(title: string): string {
  const trimmed = title.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  return trimmed.split(" ").map(titleWordToken).join(" ");
}

export function normalizePersonName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  return trimmed
    .split(" ")
    .map((part) => {
      const lower = part.toLocaleLowerCase();
      if (!lower) return part;
      return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function normalizeListingDescription(description: string): string {
  return description
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
