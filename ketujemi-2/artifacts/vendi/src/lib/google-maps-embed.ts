import {
  buildCityMapQuery,
  buildMapSearchQuery,
  googleMapsEmbedFromCoords as embedFromCoordsCore,
  googleMapsEmbedSrc as embedSrcCore,
  googleMapsOpenUrl,
  hasShopCoordinates,
  looksLikeStreetAddress,
  shopMapEmbedSrc as shopMapEmbedSrcCore,
} from "../../../../lib/google-maps-embed-url.ts";

export {
  buildCityMapQuery,
  buildMapSearchQuery,
  hasShopCoordinates,
  looksLikeStreetAddress,
  googleMapsOpenUrl,
};

function clientApiKey(): string {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
}

export function googleMapsEmbedSrc(query: string): string {
  return embedSrcCore(query, clientApiKey());
}

export function googleMapsEmbedFromCoords(latitude: number, longitude: number, zoom = 16): string {
  return embedFromCoordsCore(latitude, longitude, clientApiKey(), zoom);
}

/** Client-side embed URL (Vite build-time key). */
export function shopMapEmbedSrc(
  input: Parameters<typeof shopMapEmbedSrcCore>[0],
): string {
  return shopMapEmbedSrcCore(input, clientApiKey());
}

/** Prefer server runtime key via /api/maps/embed — fixes missing VITE_ key in production builds. */
export async function fetchShopMapEmbedSrc(
  input: Parameters<typeof shopMapEmbedSrcCore>[0],
): Promise<string> {
  const params = new URLSearchParams();
  if (hasShopCoordinates(input.latitude, input.longitude)) {
    params.set("lat", String(input.latitude));
    params.set("lng", String(input.longitude));
  }
  if (input.city?.trim()) params.set("city", input.city.trim());
  if (input.region?.trim()) params.set("region", input.region.trim());
  if (input.country?.trim()) params.set("country", input.country.trim());
  if (input.address?.trim()) params.set("address", input.address.trim());
  try {
    const res = await fetch(`/api/maps/embed?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as { url?: string };
      if (data.url?.trim()) return data.url;
    }
  } catch {
    /* client fallback */
  }
  return shopMapEmbedSrc(input);
}
