import {
  defaultSubcategoryForCategory,
  guessDirectoryCategoryFromListingSlug,
} from "../../../../lib/shop-directory-taxonomy.ts";

const NAME_TO_DIRECTORY: Record<string, string> = {
  vetura: "makina-transport",
  motorr: "makina-transport",
  kamion: "makina-transport",
  "auto pjes": "makina-transport",
  banesa: "patundshmeri",
  shtepi: "patundshmeri",
  lokale: "patundshmeri",
  telefon: "elektronike-teknologji",
  kompjuter: "elektronike-teknologji",
  elektronik: "elektronike-teknologji",
  mobilje: "shtepi-mobilje",
  rroba: "moda-veshje",
  këpuc: "moda-veshje",
  kepuce: "moda-veshje",
  ndërtim: "ndertim-instalime",
  ndertim: "ndertim-instalime",
  instalim: "ndertim-instalime",
  muratur: "ndertim-instalime",
  punë: "biznes-sherbime",
  pune: "biznes-sherbime",
  shërbim: "biznes-sherbime",
  sherbim: "biznes-sherbime",
  biznes: "biznes-sherbime",
  juridik: "biznes-sherbime",
  kontabilitet: "biznes-sherbime",
  fëmij: "femije-nena",
  femij: "femije-nena",
  sport: "sport-rekreacion",
  bujq: "bujqesi-blegtori",
  blegt: "bujqesi-blegtori",
  kafsh: "kafshe-shtepiake",
  arsim: "arsim-kurse",
  kurs: "arsim-kurse",
  muzik: "sport-rekreacion",
};

export function resolveDirectoryCategorySlug(input: {
  directory_category_slug?: string | null;
  category_id?: number | null;
  category?: string | null;
  listing_parent_slug?: string | null;
}): string | null {
  const explicit = input.directory_category_slug?.trim();
  if (explicit) return explicit;

  const fromListing = guessDirectoryCategoryFromListingSlug(input.listing_parent_slug ?? null);
  if (fromListing) return fromListing;

  const cat = (input.category ?? "").toLowerCase();
  for (const [needle, slug] of Object.entries(NAME_TO_DIRECTORY)) {
    if (cat.includes(needle)) return slug;
  }
  return "biznes-sherbime";
}

export function resolveDirectorySubcategorySlug(
  categorySlug: string | null,
  subSlug?: string | null,
): string | null {
  const explicit = subSlug?.trim();
  if (explicit) return explicit;
  if (!categorySlug) return null;
  return defaultSubcategoryForCategory(categorySlug);
}
