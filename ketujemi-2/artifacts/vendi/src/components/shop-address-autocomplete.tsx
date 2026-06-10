import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  autocompleteOptionsForShopCountry,
  isGooglePlacesAvailable,
  loadGoogleMapsPlaces,
  parsePlaceResult,
  type ShopAddressPlace,
} from "@/lib/google-places-address";

type ShopAddressAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect?: (place: ShopAddressPlace) => void;
  country?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
};

export function ShopAddressAutocomplete({
  id,
  value,
  onChange,
  onPlaceSelect,
  country = "XK",
  placeholder,
  required,
  className,
  disabled,
}: ShopAddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
    onChangeRef.current = onChange;
  }, [onPlaceSelect, onChange]);

  useEffect(() => {
    if (!isGooglePlacesAvailable() || disabled) return;
    const input = inputRef.current;
    if (!input) return;

    let cancelled = false;

    void loadGoogleMapsPlaces()
      .then((maps) => {
        if (cancelled || !inputRef.current) return;
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
        const ac = new maps.places.Autocomplete(
          input,
          autocompleteOptionsForShopCountry(maps, country),
        );
        autocompleteRef.current = ac;
        ac.addListener("place_changed", () => {
          const parsed = parsePlaceResult(ac.getPlace());
          if (!parsed) return;
          onChangeRef.current(parsed.address);
          onPlaceSelectRef.current?.(parsed);
        });
      })
      .catch(() => {
        /* Fallback: plain text input */
      });

    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [country, disabled]);

  return (
    <Input
      ref={inputRef}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={className}
      disabled={disabled}
      autoComplete="street-address"
    />
  );
}
