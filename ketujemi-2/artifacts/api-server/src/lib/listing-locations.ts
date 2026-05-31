/** City names per listing market — used for `listing_country` search filter. */
export const LISTING_LOCATIONS_BY_COUNTRY: Record<string, string[]> = {
  ks: [
    "Prishtinë", "Prizren", "Pejë", "Mitrovicë", "Gjilan", "Ferizaj", "Gjakovë", "Vushtrri", "Podujevë",
    "Suharekë", "Rahovec", "Malishevë", "Skenderaj", "Klinë", "Drenas", "Lipjan", "Shtime", "Kaçanik",
    "Hani i Elezit", "Shtërpcë",
  ],
  al: [
    "Tiranë", "Durrës", "Vlorë", "Shkodër", "Elbasan", "Fier", "Korçë", "Berat", "Lushnjë", "Kavajë",
    "Gjirokastër", "Sarandë", "Pogradec", "Laç", "Lezhë", "Kukës", "Peshkopi",
  ],
  mk: [
    "Скопје", "Тетово", "Гостивар", "Охрид", "Битола", "Куманово", "Струмица", "Прилеп",
    "Кавадарци", "Неготино", "Струга", "Кичево", "Дебар", "Кочани",
  ],
  mne: [
    "Podgorica", "Ulcinj", "Tivat", "Budva", "Kotor", "Herceg Novi", "Nikšić", "Berane",
    "Plav", "Gusinje", "Rožaje",
  ],
  de: ["Berlin", "München", "Hamburg", "Frankfurt", "Köln", "Stuttgart", "Düsseldorf", "Dortmund"],
  ch: ["Zürich", "Genève", "Basel", "Bern", "Lausanne", "Luzern"],
  at: ["Wien", "Graz", "Linz", "Salzburg", "Innsbruck"],
  fr: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Strasbourg"],
  it: ["Milano", "Roma", "Torino", "Bologna", "Firenze", "Verona"],
  gb: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool"],
  us: ["New York", "Chicago", "Los Angeles", "Houston", "Boston", "Miami"],
};

export const LISTING_HOME_MARKET_CODES = ["ks", "al", "mk"] as const;
export const LISTING_DIASPORA_MARKET_CODES = ["de", "ch", "at", "fr", "it", "gb", "us", "mne"] as const;
export const LISTING_MARKET_CODES = [
  ...LISTING_HOME_MARKET_CODES,
  ...LISTING_DIASPORA_MARKET_CODES,
] as const;

export type ListingHomeMarketCode = (typeof LISTING_HOME_MARKET_CODES)[number];
export type ListingMarketCode = (typeof LISTING_MARKET_CODES)[number];

export function isListingHomeMarketCode(code: string): code is ListingHomeMarketCode {
  return (LISTING_HOME_MARKET_CODES as readonly string[]).includes(code);
}

export function isListingMarketCode(code: string): code is ListingMarketCode {
  return (LISTING_MARKET_CODES as readonly string[]).includes(code);
}
