/**
 * Sitemap scope — keep small and high-signal so Google indexes listings & hub pages,
 * not tens of thousands of thin category×city combinations.
 */

/** Top-level marketplace hubs only (never every leaf/brand slug). */
export const SITEMAP_PARENT_HUB_SLUGS = [
  "vetura",
  "motorr-skuter",
  "kamione-furgone",
  "auto-pjese",
  "banesa-shtepi",
  "lokale-zyre",
  "telefona",
  "kompjutere-laptope",
  "tv-elektronike",
  "mobilje-dekorime",
  "rroba-kepuce",
  "femije",
  "sport-outdoor",
  "pune-sherbime",
  "ndertim-instalime",
  "bujqesi-blegtori",
  "arsim-kurse",
  "muzike-hobby",
  "kafshet",
  "kerkoj-te-blej",
  "dhurata-falas",
] as const;

/**
 * Major cities for hub+city sitemap entries only.
 * Full city list stays on-site for UX; omit diaspora micro-cities from sitemap.
 */
export const SITEMAP_CITY_SLUGS = [
  "prishtine",
  "prizren",
  "peje",
  "mitrovice",
  "gjilan",
  "ferizaj",
  "gjakove",
  "tirane",
  "durres",
  "vlore",
  "shkoder",
  "elbasan",
  "fier",
  "skopje",
  "tetovo",
  "bitola",
  "podgorica",
  "tivat",
] as const;
