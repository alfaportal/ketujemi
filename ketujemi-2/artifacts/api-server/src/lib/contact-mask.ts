/** First token of display name (e.g. "Arben Krasniqi" → "Arben"). */
export function sellerFirstName(raw: string): string {
  const name = raw.trim();
  if (!name) return "";
  return name.split(/\s+/)[0] ?? name;
}

/** Mask seller phone for anonymous API responses (never store in DB). */
export function maskSellerPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return "+*** **** ***";

  let d = digits;
  if (d.startsWith("00")) d = d.slice(2);

  if (d.startsWith("383") && d.length >= 11) {
    return `+383 ${d.slice(3, 4)}*** ***`;
  }
  if (d.startsWith("0") && d.length >= 9) {
    d = `383${d.slice(1)}`;
    return `+383 ${d.slice(3, 4)}*** ***`;
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

function maskEmailValue(email: string): string {
  const e = email.trim();
  const at = e.indexOf("@");
  if (at <= 0) return "***@***";
  const local = e.slice(0, at);
  const dom = e.slice(at + 1);
  const dot = dom.lastIndexOf(".");
  if (dot > 0) {
    const domainName = dom.slice(0, dot);
    const tld = dom.slice(dot + 1);
    const l0 = local.length > 0 ? local[0] : "*";
    const d0 = domainName.length > 0 ? domainName[0] : "*";
    const t0 = tld.length > 0 ? tld[0] : "*";
    return `${l0}***@${d0}***.${t0}***`;
  }
  const l0 = local.length > 0 ? local[0] : "*";
  const d0 = dom.length > 0 ? dom[0] : "*";
  return `${l0}***@${d0}***`;
}

/** Mask `Email: …` in the specs prefix line (first segment before `\n\n`). */
export function maskEmailInListingDescription(description: string): string {
  const sep = "\n\n";
  const idx = description.indexOf(sep);
  const firstLine = idx > 0 ? description.slice(0, idx) : description;
  const rest = idx > 0 ? description.slice(idx) : "";

  if (!firstLine.includes(": ") || firstLine.includes("\n")) {
    return description;
  }

  const rewritten = firstLine.split(" · ").map((pair) => {
    const colon = pair.indexOf(": ");
    if (colon <= 0) return pair;
    const key = pair.slice(0, colon).trim();
    let val = pair.slice(colon + 2).trim();
    if (key === "Email" && val.includes("@")) {
      val = maskEmailValue(val);
    }
    return `${key}: ${val}`;
  }).join(" · ");

  return idx > 0 ? rewritten + rest : rewritten;
}
