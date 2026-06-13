import { listingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { sellerFirstName, maskEmailInListingDescription, maskSellerPhone } from "../lib/contact-mask";
import { isTopActive } from "../lib/listing-top";
import { primaryListingImageUrl, sanitizeListingImageUrlField } from "../lib/listing-images";
import { sanitizeListingVideoUrl } from "../lib/listing-video";

function withSellerContactForViewer<
  T extends { seller_phone: string; seller_name: string; description: string },
>(listing: T, viewer: User | null): T {
  const description = viewer
    ? listing.description
    : maskEmailInListingDescription(listing.description);

  return {
    ...listing,
    seller_name: viewer ? listing.seller_name : sellerFirstName(listing.seller_name),
    seller_phone: viewer ? listing.seller_phone : "",
    description,
  };
}

export function applyViewerContact<
  T extends { seller_phone: string; seller_name: string; description: string },
>(listing: T, viewer: User | null): T {
  return withSellerContactForViewer(listing, viewer);
}

export function buildCategoryRootSlugMap(
  cats: { id: number; slug: string | null; parent_id: number | null }[],
): Map<number, string | null> {
  const byId = new Map(cats.map((c) => [c.id, c]));
  const memo = new Map<number, string | null>();

  function rootSlugFor(id: number): string | null {
    if (memo.has(id)) return memo.get(id)!;
    const cat = byId.get(id);
    if (!cat) return null;
    let slug: string | null = null;
    if (!cat.parent_id) {
      slug = cat.slug?.trim() ?? null;
    } else {
      const parent = byId.get(cat.parent_id);
      if (parent && !parent.parent_id) {
        slug = parent.slug?.trim() ?? cat.slug?.trim() ?? null;
      } else if (parent?.parent_id) {
        const grand = byId.get(parent.parent_id);
        slug = grand?.slug?.trim() ?? parent.slug?.trim() ?? cat.slug?.trim() ?? null;
      } else {
        slug = parent?.slug?.trim() ?? cat.slug?.trim() ?? null;
      }
    }
    memo.set(id, slug);
    return slug;
  }

  return new Map(cats.map((c) => [c.id, rootSlugFor(c.id)]));
}

export function formatListing(
  l: typeof listingsTable.$inferSelect,
  categoryName: string | null,
  categoryRootSlug: string | null = null,
) {
  const now = new Date();
  const expires = l.expires_at ? new Date(l.expires_at) : null;
  const daysLeft = expires
    ? Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const image_url = sanitizeListingImageUrlField(l.image_url);
  const video_url = sanitizeListingVideoUrl(l.video_url);

  return {
    ...l,
    image_url,
    video_url,
    primary_image_url: primaryListingImageUrl(image_url),
    price: Number(l.price),
    category_name: categoryName,
    category_root_slug: categoryRootSlug,
    seller_phone_masked: maskSellerPhone(l.seller_phone),
    created_at: l.created_at
      ? l.created_at.toISOString()
      : l.listed_at
        ? l.listed_at.toISOString()
        : new Date().toISOString(),
    expires_at: l.expires_at ? l.expires_at.toISOString() : null,
    days_left: daysLeft,
    is_expired: expires ? expires < now : false,
    is_top: isTopActive(l),
    top_until: l.top_until ? l.top_until.toISOString() : null,
    top_count: l.top_count ?? 0,
    listed_at: l.listed_at
      ? l.listed_at.toISOString()
      : l.created_at
        ? l.created_at.toISOString()
        : new Date().toISOString(),
    status: l.status ?? "active",
    moderation_status: l.moderation_status ?? "approved",
    shop_id: l.shop_id ?? null,
    vehicle_year: l.vehicle_year ?? null,
    vehicle_mileage_km: l.vehicle_mileage_km ?? null,
    vehicle_fuel: l.vehicle_fuel ?? null,
    vehicle_body_type: l.vehicle_body_type ?? null,
    vehicle_model: l.vehicle_model ?? null,
    truck_type_slug: l.truck_type_slug ?? null,
    truck_axle_config: l.truck_axle_config ?? null,
    truck_gvw_band: l.truck_gvw_band ?? null,
    truck_euro_standard: l.truck_euro_standard ?? null,
    property_txn: l.property_txn ?? null,
    property_subtype: l.property_subtype ?? null,
    property_sqm: l.property_sqm ?? null,
    property_floor: l.property_floor ?? null,
    motor_type_slug: l.motor_type_slug ?? null,
    motor_cc_band: l.motor_cc_band ?? null,
    motor_power_kw: l.motor_power_kw ?? null,
    motor_transmission: l.motor_transmission ?? null,
  };
}
