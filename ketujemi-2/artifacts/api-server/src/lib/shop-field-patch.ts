import type { shopApplicationsTable, shopsTable } from "@workspace/db";
import { normalizeShopWhatsappStored } from "./shop-whatsapp-url";

function trimOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

export function parseLatitude(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= -90 && n <= 90 ? n : null;
}

export function parseLongitude(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= -180 && n <= 180 ? n : null;
}

type ShopInsert = typeof shopsTable.$inferInsert;
type AppInsert = typeof shopApplicationsTable.$inferInsert;

export function buildShopFieldPatch(body: Record<string, unknown>): Partial<ShopInsert> {
  const patch: Partial<ShopInsert> = {};

  const shopName = trimOrNull(body.shop_name);
  if (shopName) patch.shop_name = shopName;
  const logoUrl = trimOrNull(body.logo_url);
  if (logoUrl) patch.logo_url = logoUrl;
  const description = trimOrNull(body.description);
  if (description) patch.description = description;
  const category = trimOrNull(body.category);
  if (category) patch.category = category;
  if ("category_id" in body) {
    const categoryId = Number(body.category_id);
    patch.category_id = Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null;
  }
  const country = trimOrNull(body.country);
  if (country) patch.country = country;
  const city = trimOrNull(body.city);
  if (city) patch.city = city;
  const region = trimOrNull(body.region);
  if (region) patch.region = region;
  const address = trimOrNull(body.address);
  if (address) patch.address = address;
  if ("latitude" in body) patch.latitude = parseLatitude(body.latitude);
  if ("longitude" in body) patch.longitude = parseLongitude(body.longitude);
  if ("facebook" in body) patch.facebook = trimOrNull(body.facebook);
  if ("instagram" in body) patch.instagram = trimOrNull(body.instagram);
  if ("tiktok" in body) patch.tiktok = trimOrNull(body.tiktok);
  if ("whatsapp" in body) patch.whatsapp = normalizeShopWhatsappStored(body.whatsapp);
  if ("website" in body) patch.website = trimOrNull(body.website);
  if ("youtube" in body) patch.youtube = trimOrNull(body.youtube);
  if ("slug" in body) {
    const slugRaw = trimOrNull(body.slug);
    if (slugRaw) patch.slug = slugRaw.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  }
  const contactName = trimOrNull(body.contact_name);
  if (contactName) patch.contact_name = contactName;
  const phone = trimOrNull(body.phone);
  if (phone) patch.phone = phone;
  const email = trimOrNull(body.email);
  if (email) patch.email = email;
  if ("admin_notes" in body) patch.admin_notes = trimOrNull(body.admin_notes);
  if ("cover_image_url" in body) patch.cover_image_url = trimOrNull(body.cover_image_url);
  if ("tagline" in body) patch.tagline = trimOrNull(body.tagline);

  return patch;
}

export function ownerShopFieldPatch(body: Record<string, unknown>): Partial<ShopInsert> {
  const safe = { ...body };
  delete safe.admin_notes;
  delete safe.status;
  return buildShopFieldPatch(safe);
}

export function buildApplicationFieldPatch(body: Record<string, unknown>): Partial<AppInsert> {
  const patch = buildShopFieldPatch(body) as Partial<AppInsert>;
  if ("status" in body) {
    const status = trimOrNull(body.status);
    if (status === "pending" || status === "approved" || status === "rejected") {
      patch.status = status;
    }
  }
  if ("admin_notes" in body) patch.admin_notes = trimOrNull(body.admin_notes);
  if ("rejected_reason" in body) patch.rejected_reason = trimOrNull(body.rejected_reason);
  return patch;
}
