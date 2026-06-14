import type { listingsTable } from "@workspace/db";
import {
  normalizeListingDescription,
  normalizeListingTitle,
  normalizePersonName,
} from "./listing-text-normalize.js";
import { descriptionForAdminOnBehalf } from "./admin-listing-on-behalf.js";
import { sanitizeListingImageUrlField } from "./listing-images.js";
import { sanitizeListingVideoUrl } from "./listing-video.js";

type ListingInsert = typeof listingsTable.$inferInsert;

const NUMERIC_NULLABLE = [
  "vehicle_year",
  "vehicle_mileage_km",
  "property_sqm",
  "motor_power_kw",
] as const;

const STRING_NULLABLE = [
  "vehicle_fuel",
  "vehicle_body_type",
  "vehicle_model",
  "truck_type_slug",
  "truck_axle_config",
  "truck_gvw_band",
  "truck_euro_standard",
  "property_txn",
  "property_subtype",
  "property_floor",
  "motor_type_slug",
  "motor_cc_band",
  "motor_transmission",
] as const;

/** Map admin PATCH body → Drizzle listing updates (all creatable fields + operator extras). */
export function buildAdminListingPatch(body: Record<string, unknown>): Partial<ListingInsert> {
  const updates: Partial<ListingInsert> = {};

  if (body.title !== undefined) {
    updates.title = normalizeListingTitle(String(body.title));
  }
  if (body.description !== undefined) {
    updates.description = descriptionForAdminOnBehalf(
      normalizeListingDescription(String(body.description)),
    );
  }
  if (body.price !== undefined) {
    updates.price = String(body.price);
  }
  if (body.location !== undefined) {
    updates.location = String(body.location);
  }
  if (body.condition !== undefined) {
    updates.condition = String(body.condition);
  }
  if (body.category_id !== undefined) {
    const cid = Number(body.category_id);
    if (Number.isFinite(cid) && cid > 0) updates.category_id = cid;
  }
  if (body.is_featured !== undefined) {
    updates.is_featured = Boolean(body.is_featured);
  }
  if (body.image_url !== undefined) {
    updates.image_url = sanitizeListingImageUrlField(
      body.image_url == null ? null : String(body.image_url),
    );
  }
  if (body.video_url !== undefined) {
    updates.video_url = sanitizeListingVideoUrl(
      body.video_url == null || body.video_url === "" ? null : String(body.video_url),
    );
  }
  if (body.seller_name !== undefined) {
    updates.seller_name = normalizePersonName(String(body.seller_name));
  }
  if (body.seller_phone !== undefined) {
    updates.seller_phone = String(body.seller_phone).trim();
  }
  if (body.views !== undefined) {
    const v = Number(body.views);
    if (Number.isFinite(v) && v >= 0) updates.views = Math.floor(v);
  }
  if (body.status !== undefined) {
    const s = String(body.status).trim();
    if (s) updates.status = s;
  }
  if (body.moderation_status !== undefined) {
    const m = String(body.moderation_status).trim();
    if (m) updates.moderation_status = m;
  }

  for (const key of NUMERIC_NULLABLE) {
    if (body[key] !== undefined) {
      const n = body[key] == null || body[key] === "" ? null : Number(body[key]);
      (updates as Record<string, unknown>)[key] =
        n != null && Number.isFinite(n) ? Math.floor(n) : null;
    }
  }

  for (const key of STRING_NULLABLE) {
    if (body[key] !== undefined) {
      const raw = body[key];
      (updates as Record<string, unknown>)[key] =
        raw == null || raw === "" ? null : String(raw).trim();
    }
  }

  return updates;
}
