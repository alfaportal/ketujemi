import type { GetListingsParams } from "@workspace/api-client-react";
import {
  ALL_LOCATIONS,
  HOME_MARKET_CODES,
  LOCATIONS,
  type HomeMarketCode,
} from "@/lib/market-context";

export type HubLocationFilterValue = {
  countryCode: HomeMarketCode | "";
  city: string;
  areaZone: string;
};

export function citiesForHubCountry(countryCode: HomeMarketCode | ""): string[] {
  if (!countryCode) {
    return [...ALL_LOCATIONS].sort((a, b) => a.localeCompare(b, "sq"));
  }
  return [...(LOCATIONS[countryCode] ?? [])].sort((a, b) => a.localeCompare(b, "sq"));
}

/** Maps hub filter UI to listings API query (country → all cities in that market). */
export function hubLocationToListingParams(
  input: HubLocationFilterValue,
): Pick<GetListingsParams, "location" | "location_search" | "listing_country"> {
  const out: Pick<GetListingsParams, "location" | "location_search" | "listing_country"> =
    {};
  const city = input.city.trim();
  const zone = input.areaZone.trim();

  if (input.countryCode && !city) {
    out.listing_country = input.countryCode;
  }
  if (city) {
    out.location_search = city;
  }
  if (zone) {
    out.location_search = city ? `${city} ${zone}` : zone;
  }
  return out;
}

export { HOME_MARKET_CODES };
