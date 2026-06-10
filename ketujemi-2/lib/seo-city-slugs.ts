/** City display name ↔ URL slug for SEO landing pages (/shpallje/:cat/:city). */

export function slugifySeoSegment(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ë/gi, "e")
    .replace(/ç/gi, "c")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Latin slug → canonical display name (KS/AL + diaspora + MK/MNE latin aliases). */
export const SEO_CITY_BY_SLUG: Record<string, string> = {
  // Kosovo
  prishtine: "Prishtinë",
  prizren: "Prizren",
  peje: "Pejë",
  mitrovice: "Mitrovicë",
  gjilan: "Gjilan",
  ferizaj: "Ferizaj",
  gjakove: "Gjakovë",
  vushtrri: "Vushtrri",
  podujeve: "Podujevë",
  suhareke: "Suharekë",
  rahovec: "Rahovec",
  malisheve: "Malishevë",
  skenderaj: "Skenderaj",
  kline: "Klinë",
  drenas: "Drenas",
  lipjan: "Lipjan",
  shtime: "Shtime",
  kacanik: "Kaçanik",
  "hani-i-elezit": "Hani i Elezit",
  shterpce: "Shtërpcë",
  // Albania
  tirane: "Tiranë",
  durres: "Durrës",
  vlore: "Vlorë",
  shkoder: "Shkodër",
  elbasan: "Elbasan",
  fier: "Fier",
  korce: "Korçë",
  berat: "Berat",
  lushnje: "Lushnjë",
  kavaje: "Kavajë",
  gjirokaster: "Gjirokastër",
  sarande: "Sarandë",
  pogradec: "Pogradec",
  lac: "Laç",
  lezhe: "Lezhë",
  kukes: "Kukës",
  peshkopi: "Peshkopi",
  // North Macedonia (latin slugs)
  skopje: "Скопје",
  tetovo: "Тетово",
  gostivar: "Гостивар",
  ohrid: "Охрид",
  bitola: "Битола",
  kumanovo: "Куманово",
  strumica: "Струмица",
  prilep: "Прилеп",
  kavadarci: "Кавадарци",
  negotino: "Неготино",
  struga: "Струга",
  kicevo: "Кичево",
  debar: "Дебар",
  kocani: "Кочани",
  // Montenegro
  podgorica: "Podgorica",
  ulcinj: "Ulcinj",
  tivat: "Tivat",
  budva: "Budva",
  kotor: "Kotor",
  "herceg-novi": "Herceg Novi",
  niksic: "Nikšić",
  berane: "Berane",
  plav: "Plav",
  gusinje: "Gusinje",
  rozaje: "Rožaje",
  // Diaspora (sample — high-traffic)
  berlin: "Berlin",
  munchen: "München",
  hamburg: "Hamburg",
  frankfurt: "Frankfurt",
  koln: "Köln",
  zurich: "Zürich",
  genf: "Genève",
  wien: "Wien",
  paris: "Paris",
  london: "London",
  "new-york": "New York",
  milano: "Milano",
  roma: "Roma",
};

export const SEO_CITY_SLUGS = Object.keys(SEO_CITY_BY_SLUG);

export function cityNameFromSlug(slug: string | undefined): string | undefined {
  if (!slug?.trim()) return undefined;
  const key = slug.trim().toLowerCase();
  return SEO_CITY_BY_SLUG[key];
}

export function citySlugFromName(name: string): string {
  const normalized = name.trim();
  const hit = Object.entries(SEO_CITY_BY_SLUG).find(([, v]) => v === normalized);
  if (hit) return hit[0];
  return slugifySeoSegment(normalized);
}
