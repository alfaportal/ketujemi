import { detectProhibitedListingContent } from "../../../../lib/listing-prohibited-content.js";

const MODERATION_SUFFIX =
  " Kjo përmbajtje nuk lejohet në KetuJemi — heqeni para se të ruani.";

export function assertShopTextContentAllowed(fields: {
  shop_name?: string;
  description?: string;
  tagline?: string | null;
  business_hours?: string | null;
}): void {
  const chunks: Array<{ title: string; body: string }> = [];
  if (fields.shop_name?.trim()) {
    chunks.push({ title: fields.shop_name, body: fields.shop_name });
  }
  if (fields.description?.trim()) {
    chunks.push({ title: fields.description.slice(0, 120), body: fields.description });
  }
  if (fields.tagline?.trim()) {
    chunks.push({ title: fields.tagline, body: fields.tagline });
  }
  if (fields.business_hours?.trim()) {
    chunks.push({ title: "Orari", body: fields.business_hours });
  }

  for (const chunk of chunks) {
    const hit = detectProhibitedListingContent(chunk.title, chunk.body);
    if (!hit) continue;
    const err = new Error("PROHIBITED_CONTENT") as Error & { publicMessage: string };
    err.publicMessage = `${hit.reason}${MODERATION_SUFFIX}`;
    throw err;
  }
}

export function assertShopProductTextAllowed(title: string, description: string): void {
  const hit = detectProhibitedListingContent(title, description);
  if (!hit) return;
  const err = new Error("PROHIBITED_CONTENT") as Error & { publicMessage: string };
  err.publicMessage = `${hit.reason}${MODERATION_SUFFIX}`;
  throw err;
}
