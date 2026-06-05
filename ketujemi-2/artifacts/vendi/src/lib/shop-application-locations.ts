import { locationsForListingMarket } from "@/lib/market-context";

export const SHOP_COUNTRY_CODES = [
  "XK",
  "AL",
  "MK",
  "MNE",
  "DE",
  "CH",
  "AT",
  "FR",
  "IT",
  "GB",
  "US",
] as const;

export type ShopCountryCode = (typeof SHOP_COUNTRY_CODES)[number];

const DIASPORA_CITIES: Record<string, string[]> = {
  DE: ["Berlin", "München", "Hamburg", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund"],
  CH: ["Zürich", "Genève", "Basel", "Bern", "Lausanne", "Luzern", "St. Gallen"],
  AT: ["Wien", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"],
  FR: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg"],
  IT: ["Roma", "Milano", "Torino", "Bologna", "Firenze", "Napoli", "Verona"],
  GB: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol"],
  US: ["New York", "Chicago", "Los Angeles", "Houston", "Phoenix", "Philadelphia", "Dallas"],
};

const MARKET_MAP: Record<string, string> = {
  XK: "ks",
  AL: "al",
  MK: "mk",
  MNE: "mne",
};

export function citiesForShopCountry(code: string): string[] {
  const market = MARKET_MAP[code];
  if (market) return locationsForListingMarket(market);
  return DIASPORA_CITIES[code] ?? [];
}
