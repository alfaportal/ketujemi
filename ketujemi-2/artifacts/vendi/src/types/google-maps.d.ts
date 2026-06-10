/** Minimal types for Google Maps Places Autocomplete (loaded at runtime). */
declare namespace google.maps.places {
  interface AutocompleteOptions {
    bounds?: google.maps.LatLngBounds;
    strictBounds?: boolean;
    componentRestrictions?: { country: string | string[] };
    fields?: string[];
  }

  interface Autocomplete {
    addListener(event: string, handler: () => void): void;
    getPlace(): PlaceResult;
  }

  interface PlaceResult {
    formatted_address?: string;
    name?: string;
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }
}

declare namespace google.maps {
  class LatLngBounds {
    constructor(sw: { lat: number; lng: number }, ne: { lat: number; lng: number });
  }

  namespace places {
    class Autocomplete {
      constructor(input: HTMLInputElement, opts?: places.AutocompleteOptions);
      addListener(event: string, handler: () => void): void;
      getPlace(): places.PlaceResult;
    }
  }

  namespace event {
    function clearInstanceListeners(instance: object): void;
  }
}

interface Window {
  google?: {
    maps: typeof google.maps;
  };
}
