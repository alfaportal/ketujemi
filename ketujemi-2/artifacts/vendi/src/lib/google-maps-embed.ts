const STREET_HINTS =
  /\b(rr\.?|rruga|ruga|street|st\.|boulevard|bulevard|bulevardi|lagj|lagjja|nr\.?|no\.?|numri|avenue|ave\.?)\b|\d/i;

/** True when the string looks like a street address, not only a contact name. */
export function looksLikeStreetAddress(address: string): boolean {
  const text = address.trim();
  if (!text) return false;
  if (STREET_HINTS.test(text)) return true;
  return text.length > 48;
}

export function buildMapSearchQuery(parts: {
  address?: string | null;
  city?: string | null;
  country?: string | null;
}): string {
  const address = parts.address?.trim() ?? "";
  const city = parts.city?.trim() ?? "";
  const country = parts.country?.trim() ?? "";
  const region = [city, country].filter(Boolean).join(", ");

  if (!address) return region || "Kosovo";
  if (!looksLikeStreetAddress(address) && region) return region;
  return [address, city, country].filter(Boolean).join(", ");
}

export function googleMapsEmbedSrc(query: string): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const q = encodeURIComponent(query.trim() || "Kosovo");
  if (key) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${q}`;
  }
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

/** Pin map when shop has saved coordinates from Places Autocomplete. */
export function googleMapsEmbedFromCoords(latitude: number, longitude: number, zoom = 16): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const lat = latitude.toFixed(6);
  const lng = longitude.toFixed(6);
  if (key) {
    return `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(key)}&center=${lat},${lng}&zoom=${zoom}`;
  }
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

export function shopMapEmbedSrc(input: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}): string {
  const lat = input.latitude;
  const lng = input.longitude;
  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    return googleMapsEmbedFromCoords(lat, lng);
  }
  return googleMapsEmbedSrc(
    buildMapSearchQuery({
      address: input.address,
      city: input.city,
      country: input.country,
    }),
  );
}
