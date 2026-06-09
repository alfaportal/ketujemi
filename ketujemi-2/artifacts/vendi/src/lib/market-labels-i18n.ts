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
  return market.name;
}
