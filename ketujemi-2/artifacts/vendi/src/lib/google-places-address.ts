/** Load Google Maps JS API (Places) once — uses VITE_GOOGLE_MAPS_API_KEY. */

export type ShopAddressPlace = {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
};

const PLACES_COUNTRY: Partial<Record<string, string>> = {
  AL: "al",
  MK: "mk",
  MNE: "me",
  DE: "de",
  CH: "ch",
  AT: "at",
  FR: "fr",
  IT: "it",
  GB: "gb",
  US: "us",
};

const KOSOVO_SW = { lat: 41.85, lng: 20.01 };
const KOSOVO_NE = { lat: 43.27, lng: 21.83 };

let loadPromise: Promise<typeof google.maps> | null = null;

export function googleMapsApiKey(): string {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
}

export function isGooglePlacesAvailable(): boolean {
  return googleMapsApiKey().length > 0;
}

export function loadGoogleMapsPlaces(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SSR"));
  }
  const key = googleMapsApiKey();
  if (!key) return Promise.reject(new Error("NO_GOOGLE_MAPS_KEY"));

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-ketujemi="google-maps-places"]',
      );
      if (existing) {
        existing.addEventListener("load", () => {
          if (window.google?.maps?.places) resolve(window.google.maps);
          else reject(new Error("GOOGLE_MAPS_LOAD_FAILED"));
        });
        existing.addEventListener("error", () => reject(new Error("GOOGLE_MAPS_LOAD_FAILED")));
        return;
      }

      const script = document.createElement("script");
      script.dataset.ketujemi = "google-maps-places";
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&loading=async`;
      script.onload = () => {
        if (window.google?.maps?.places) resolve(window.google.maps);
        else reject(new Error("GOOGLE_MAPS_LOAD_FAILED"));
      };
      script.onerror = () => reject(new Error("GOOGLE_MAPS_LOAD_FAILED"));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}

export function autocompleteOptionsForShopCountry(
  maps: typeof google.maps,
  country: string,
): google.maps.places.AutocompleteOptions {
  const fields: ("formatted_address" | "geometry" | "address_components" | "name")[] = [
    "formatted_address",
    "geometry",
    "address_components",
    "name",
  ];

  if (country === "XK") {
    return {
      bounds: new maps.LatLngBounds(KOSOVO_SW, KOSOVO_NE),
      strictBounds: false,
      fields,
    };
  }

  const code = PLACES_COUNTRY[country];
  if (code) {
    return {
      componentRestrictions: { country: code },
      fields,
    };
  }

  return { fields };
}

export function parsePlaceResult(place: google.maps.places.PlaceResult): ShopAddressPlace | null {
  const loc = place.geometry?.location;
  if (!loc) return null;
  const lat = loc.lat();
  const lng = loc.lng();
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  let city: string | undefined;
  let region: string | undefined;
  for (const comp of place.address_components ?? []) {
    const types = comp.types;
    if (!city && (types.includes("locality") || types.includes("postal_town"))) {
      city = comp.long_name;
    }
    if (
      !region &&
      (types.includes("sublocality") ||
        types.includes("sublocality_level_1") ||
        types.includes("neighborhood") ||
        types.includes("administrative_area_level_2"))
    ) {
      region = comp.long_name;
    }
  }

  const address =
    place.formatted_address?.trim() ||
    [place.name, city].filter(Boolean).join(", ").trim();
  if (!address) return null;

  return { address, latitude: lat, longitude: lng, city, region };
}
