/** City names per home market — used for `listing_country` search filter. */
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
};

export const LISTING_HOME_MARKET_CODES = ["ks", "al", "mk", "mne"] as const;

export type ListingHomeMarketCode = (typeof LISTING_HOME_MARKET_CODES)[number];

export function isListingHomeMarketCode(code: string): code is ListingHomeMarketCode {
  return (LISTING_HOME_MARKET_CODES as readonly string[]).includes(code);
}
