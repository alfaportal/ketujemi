import type { Market } from "@/lib/market-context";
import type { UiLang } from "@/lib/ui-languages";

const MARKET_NAMES_EN: Record<Market["code"], string> = {
  ks: "Kosovo",
  al: "Albania",
  mk: "North Macedonia",
  mne: "Montenegro",
  de: "Germany",
  at: "Austria",
  ch: "Switzerland",
  it: "Italy",
  fr: "France",
  gb: "United Kingdom",
  us: "USA",
};

const MARKET_NAMES_DE: Record<Market["code"], string> = {
  ks: "Kosovo",
  al: "Albanien",
  mk: "Nordmazedonien",
  mne: "Montenegro",
  de: "Deutschland",
  at: "Österreich",
  ch: "Schweiz",
  it: "Italien",
  fr: "Frankreich",
  gb: "Vereinigtes Königreich",
  us: "USA",
};

const MARKET_NAMES_IT: Record<Market["code"], string> = {
  ks: "Kosovo",
  al: "Albania",
  mk: "Macedonia del Nord",
  mne: "Montenegro",
  de: "Germania",
  at: "Austria",
  ch: "Svizzera",
  it: "Italia",
  fr: "Francia",
  gb: "Regno Unito",
  us: "USA",
};

/** Country / market label in header picker (UI language, not listing country). */
const MARKET_NAMES_FR: Record<Market["code"], string> = {
  ks: "Kosovo",
  al: "Albanie",
  mk: "Macédoine du Nord",
  mne: "Monténégro",
  de: "Allemagne",
  at: "Autriche",
  ch: "Suisse",
  it: "Italie",
  fr: "France",
  gb: "Royaume-Uni",
  us: "États-Unis",
};

export function marketDisplayName(market: Market, uiLang: UiLang): string {
  if (uiLang === "en") return MARKET_NAMES_EN[market.code] ?? market.name;
  if (uiLang === "fr") return MARKET_NAMES_FR[market.code] ?? market.name;
  if (uiLang === "de") return MARKET_NAMES_DE[market.code] ?? market.name;
  if (uiLang === "it") return MARKET_NAMES_IT[market.code] ?? market.name;
  return market.name;
}
