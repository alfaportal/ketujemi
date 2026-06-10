const STREET_HINTS =
  /\b(rr\.?|rruga|ruga|street|st\.|boulevard|bulevard|bulevardi|lagj|lagjja|nr\.?|no\.?|numri|avenue|ave\.?)\b|\d/i;

/** ISO / internal codes → names Google Maps understands. */
export const MAP_COUNTRY_LABELS: Record<string, string> = {
  XK: "Kosovo",
  AL: "Albania",
  MK: "North Macedonia",
  MNE: "Montenegro",
  DE: "Germany",
  CH: "Switzerland",
  AT: "Austria",
  FR: "France",
  IT: "Italy",
  GB: "United Kingdom",
  US: "United States",
  Kosovë: "Kosovo",
  Shqipëri: "Albania",
};

export function normalizeCountryForMaps(country: string | null | undefined): string {
  const t = country?.trim() ?? "";
  if (!t) return "Kosovo";
  return MAP_COUNTRY_LABELS[t] ?? t;
}

export function looksLikeStreetAddress(address: string): boolean {
  const text = address.trim();
  if (!text) return false;
  if (STREET_HINTS.test(text)) return true;
  return text.length > 48;
}

export function hasShopCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): boolean {
  return (
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

/** City-level map query — used when shop has no saved lat/lng. */
export function buildCityMapQuery(parts: {
  city?: string | null;
  country?: string | null;
  region?: string | null;
}): string {
  const city = parts.city?.trim() ?? "";
  const region = parts.region?.trim() ?? "";
  const country = normalizeCountryForMaps(parts.country);
  const locality = city || region;
  return [locality, country].filter(Boolean).join(", ") || country || "Kosovo";
}

export function buildMapSearchQuery(parts: {
  address?: string | null;
  city?: string | null;
  country?: string | null;
  region?: string | null;
}): string {
  const address = parts.address?.trim() ?? "";
  const city = parts.city?.trim() ?? "";
  const region = parts.region?.trim() ?? "";
  const country = normalizeCountryForMaps(parts.country);
  const locality = [city, region].filter(Boolean).join(", ");

  if (!address) return buildCityMapQuery(parts);
  if (!looksLikeStreetAddress(address)) {
    return buildCityMapQuery(parts) || address;
  }
  return [address, locality, country].filter(Boolean).join(", ");
}

export function resolveGoogleMapsApiKey(
  serverKey?: string | null,
  viteKey?: string | null,
): string {
  return serverKey?.trim() || viteKey?.trim() || "";
}

export function googleMapsEmbedSrc(query: string, apiKey: string): string {
  const q = encodeURIComponent(query.trim() || "Kosovo");
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${q}`;
  }
  return `https://maps.google.com/maps?q=${q}&hl=sq&z=15&ie=UTF8&iwloc=&output=embed`;
}

/** City overview when exact coordinates are unavailable. */
export function googleMapsCityEmbedSrc(query: string, apiKey: string): string {
  const q = encodeURIComponent(query.trim() || "Kosovo");
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(apiKey)}&q=${q}`;
  }
  return `https://maps.google.com/maps?q=${q}&hl=sq&z=12&ie=UTF8&iwloc=&output=embed`;
}

export function googleMapsEmbedFromCoords(
  latitude: number,
  longitude: number,
  apiKey: string,
  zoom = 16,
): string {
  const lat = latitude.toFixed(6);
  const lng = longitude.toFixed(6);
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(apiKey)}&center=${lat},${lng}&zoom=${zoom}`;
  }
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=sq&output=embed`;
}

export function shopMapEmbedSrc(
  input: {
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    region?: string | null;
  },
  apiKey: string,
): string {
  if (hasShopCoordinates(input.latitude, input.longitude)) {
    return googleMapsEmbedFromCoords(input.latitude!, input.longitude!, apiKey);
  }
  return googleMapsEmbedSrc(
    buildMapSearchQuery({
      address: input.address,
      city: input.city,
      country: input.country,
      region: input.region,
    }),
    apiKey,
  );
}

export function googleMapsOpenUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim() || "Kosovo")}`;
}
