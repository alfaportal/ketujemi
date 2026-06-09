import type { PartnerLinkType } from "./business-partner";
import { normalizePartnerLink } from "./business-partner";

export type PartnerRegisterBody = {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  iban: string;
  package: "standard" | "vip";
  logo_url: string | null;
  link: string;
  accepted_terms: boolean;
};

export function inferPartnerLinkType(url: string): PartnerLinkType {
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/facebook\.com/i.test(url)) return "facebook";
  return "website";
}

function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return null;
  return email;
}

function normalizeIban(input: string): string | null {
  const iban = input.replace(/\s+/g, "").toUpperCase();
  if (iban.length < 15 || iban.length > 34 || !/^[A-Z0-9]+$/.test(iban)) return null;
  return iban;
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

export function packageLabelFromTier(tier: "standard" | "vip"): string {
  return tier === "vip" ? "VIP Partner €50/muaj" : "Partner Standard €30/muaj";
}

export function validatePartnerRegistration(
  body: unknown,
):
  | { ok: true; data: PartnerRegisterBody & { link_url: string; link_type: PartnerLinkType } }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Të dhënat janë të pavlefshme." };
  }

  const raw = body as Record<string, unknown>;
  const business_name = String(raw.business_name ?? "").trim();
  const contact_name = String(raw.contact_name ?? "").trim();
  const email = normalizeEmail(String(raw.email ?? ""));
  const phone = normalizePhone(String(raw.phone ?? ""));
  const ibanRaw = String(raw.iban ?? "").trim();
  const iban = ibanRaw ? (normalizeIban(ibanRaw) ?? "") : "";
  const pkg = normalizePackage(String(raw.package ?? ""));
  const logo_url =
    typeof raw.logo_url === "string" && raw.logo_url.trim()
      ? raw.logo_url.trim().slice(0, 2048)
      : null;
  const link = String(raw.link ?? raw.link_url ?? "").trim();
  const accepted_terms = raw.accepted_terms === true;

  if (!business_name || business_name.length > 200) {
    return { ok: false, message: "Emri i biznesit është i detyrueshëm." };
  }
  if (!contact_name || contact_name.length > 120) {
    return { ok: false, message: "Emri i kontaktit është i detyrueshëm." };
  }
  if (!email) return { ok: false, message: "Email i pavlefshëm." };
  if (!phone) return { ok: false, message: "Telefon i pavlefshëm." };
  if (ibanRaw && !iban) return { ok: false, message: "IBAN i pavlefshëm." };
  if (!pkg) return { ok: false, message: "Zgjidhni një paketë." };
  if (!accepted_terms) {
    return { ok: false, message: "Duhet të pranoni kushtet e kontratës." };
  }

  if (logo_url && !/^https?:\/\//i.test(logo_url)) {
    return { ok: false, message: "URL e logos duhet të fillojë me http:// ose https://." };
  }

  const linkType = inferPartnerLinkType(link);
  const norm = normalizePartnerLink(linkType, link);
  if (!norm.ok) return { ok: false, message: norm.message };

  return {
    ok: true,
    data: {
      business_name,
      contact_name,
      email,
      phone,
      iban,
      package: pkg,
      logo_url,
      link: norm.url,
      accepted_terms,
      link_url: norm.url,
      link_type: norm.type,
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
