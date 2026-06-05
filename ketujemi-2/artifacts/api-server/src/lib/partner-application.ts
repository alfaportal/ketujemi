export type PartnerApplicationBody = {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  package: "standard" | "vip";
  description: string;
  logo_base64?: string | null;
  logo_filename?: string | null;
  logo_mime?: string | null;
};

function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return null;
  return email;
}

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 20) return null;
  return digits;
}

function normalizePackage(input: string): "standard" | "vip" | null {
  const p = input.trim().toLowerCase();
  if (p === "standard" || p === "partner" || p === "partner_standard") return "standard";
  if (p === "vip" || p === "vip_partner") return "vip";
  return null;
}

const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export function packageLabelFromTier(tier: "standard" | "vip"): string {
  return tier === "vip" ? "VIP Partner" : "Partner";
}

export function validatePartnerApplication(
  body: unknown,
): { ok: true; data: PartnerApplicationBody } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Të dhënat janë të pavlefshme." };
  }

  const raw = body as Record<string, unknown>;
  const business_name = String(raw.business_name ?? "").trim();
  const contact_name = String(raw.contact_name ?? "").trim();
  const email = normalizeEmail(String(raw.email ?? ""));
  const phone = normalizePhone(String(raw.phone ?? ""));
  const pkg = normalizePackage(String(raw.package ?? ""));
  const description = String(raw.description ?? "").trim();

  const logo_base64 =
    typeof raw.logo_base64 === "string" && raw.logo_base64.trim()
      ? raw.logo_base64.trim()
      : null;
  const logo_filename =
    typeof raw.logo_filename === "string" && raw.logo_filename.trim()
      ? raw.logo_filename.trim().slice(0, 200)
      : null;
  const logo_mime =
    typeof raw.logo_mime === "string" && raw.logo_mime.trim()
      ? raw.logo_mime.trim().toLowerCase().slice(0, 80)
      : null;

  if (!business_name || business_name.length > 200) {
    return { ok: false, message: "Emri i biznesit është i detyrueshëm." };
  }
  if (!contact_name || contact_name.length > 120) {
    return { ok: false, message: "Emri i kontaktit është i detyrueshëm." };
  }
  if (!email) return { ok: false, message: "Email i pavlefshëm." };
  if (!phone) return { ok: false, message: "Telefon i pavlefshëm." };
  if (!pkg) return { ok: false, message: "Zgjidhni Partner ose VIP Partner." };
  if (!description || description.length > 2000) {
    return { ok: false, message: "Përshkrimi i biznesit është i detyrueshëm (max 2000 karaktere)." };
  }

  if (logo_base64) {
    if (!logo_filename || !logo_mime) {
      return { ok: false, message: "Logo e pavlefshme." };
    }
    if (!ALLOWED_LOGO_MIME.has(logo_mime)) {
      return { ok: false, message: "Formati i logos nuk mbështetet (JPEG, PNG, WebP, GIF, SVG)." };
    }
    let buf: Buffer;
    try {
      buf = Buffer.from(logo_base64, "base64");
    } catch {
      return { ok: false, message: "Logo e pavlefshme." };
    }
    if (buf.length < 1 || buf.length > LOGO_MAX_BYTES) {
      return { ok: false, message: "Logo duhet të jetë më pak se 5 MB." };
    }
  }

  return {
    ok: true,
    data: {
      business_name,
      contact_name,
      email,
      phone,
      package: pkg,
      description,
      logo_base64,
      logo_filename,
      logo_mime,
    },
  };
}

export function clientIpFromRequest(req: {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}): string | null {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim().slice(0, 64) ?? null;
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(",")[0]?.trim().slice(0, 64) ?? null;
  }
  const ip = req.ip?.trim();
  return ip ? ip.slice(0, 64) : null;
}
