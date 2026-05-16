export type KamioneVehicleTypeKey =
  | "furgone"
  | "kamione"
  | "mauna"
  | "rimorkio"
  | "autobus"
  | "makineri";

/** Curated model lists per vehicle-type card on the Kamionë hub search panel. */
export const TRUCK_MODELS_BY_TYPE: Record<KamioneVehicleTypeKey, readonly string[]> = {
  furgone: [
    "Mercedes Sprinter",
    "Mercedes Vito",
    "Mercedes Citan",
    "Volkswagen Crafter",
    "Volkswagen Transporter",
    "Volkswagen Caddy",
    "Ford Transit",
    "Ford Transit Connect",
    "Ford Transit Custom",
    "Fiat Ducato",
    "Fiat Doblo",
    "Fiat Fiorino",
    "Iveco Daily",
    "Renault Master",
    "Renault Trafic",
    "Opel Movano",
    "Opel Vivaro",
    "Peugeot Boxer",
    "Citroen Jumper",
    "Citroen Berlingo",
  ],
  kamione: [
    "Mercedes Actros",
    "Mercedes Atego",
    "Mercedes Axor",
    "MAN TGX",
    "MAN TGS",
    "MAN TGM",
    "MAN TGL",
    "Volvo FH",
    "Volvo FM",
    "Volvo FMX",
    "Volvo FL",
    "Scania R-Series",
    "Scania S-Series",
    "Scania G-Series",
    "DAF XF",
    "DAF XG",
    "DAF CF",
    "DAF LF",
    "Iveco Stralis",
    "Iveco Trakker",
    "Iveco EuroCargo",
    "Renault Premium",
    "Renault Magnum",
    "Renault Kerax",
  ],
  mauna: [
    "Volvo FH 500",
    "Volvo FH 460",
    "Scania R 500",
    "Scania R 450",
    "Scania S 500",
    "Mercedes Actros 1845",
    "Mercedes Actros 1848",
    "MAN TGX 18.500",
    "MAN TGX 18.460",
    "DAF XF 480",
    "DAF XF 530",
    "Iveco Stralis 460",
    "Iveco Stralis 500",
    "Renault T 480",
    "Renault T 520",
  ],
  rimorkio: [
    "Schmitz Cargobull",
    "Krone",
    "Kögel",
    "Schwarzmüller",
    "Wielton",
    "Fliegl",
    "Tirsan",
    "Kassbohrer",
    "Renders",
    "Fruehauf",
    "Talson",
    "Panav",
  ],
  autobus: [
    "Mercedes Sprinter Bus",
    "Mercedes Tourismo",
    "Volvo 9700",
    "Volvo 9900",
    "Setra S 515",
    "Setra S 517",
    "MAN Lion's Coach",
    "MAN Lion's City",
    "Neoplan Cityliner",
    "Neoplan Tourliner",
    "Iveco Crossway",
    "Irisbus",
    "Ford Transit Bus",
    "Volkswagen Crafter Bus",
  ],
  makineri: [
    "Caterpillar 320",
    "Caterpillar 330",
    "Caterpillar 340",
    "Komatsu PC 200",
    "Komatsu PC 300",
    "Volvo EC 220",
    "Volvo EC 300",
    "Liebherr R 920",
    "Liebherr R 936",
    "Hitachi ZX 200",
    "Hitachi ZX 300",
    "JCB 3CX",
    "JCB JS 220",
    "Doosan DX 225",
    "Hyundai R 210",
  ],
};

/** Prefix used to match curated model labels when a hub brand is selected. */
const KAMIONE_BRAND_MODEL_PREFIX: Partial<Record<string, string>> = {
  "kamione-mercedes-benz": "Mercedes",
  "kamione-man": "MAN",
  "kamione-volvo": "Volvo",
  "kamione-scania": "Scania",
  "kamione-daf": "DAF",
  "kamione-iveco": "Iveco",
  "kamione-renault": "Renault",
  "kamione-volkswagen": "Volkswagen",
  "kamione-ford": "Ford",
  "kamione-fiat": "Fiat",
};

function isKamioneVehicleTypeKey(key: string | null): key is KamioneVehicleTypeKey {
  return key != null && key in TRUCK_MODELS_BY_TYPE;
}

function modelsForBrand(
  brandSlug: string,
  modelRows: { brand_slug: string; name: string }[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of modelRows) {
    if (row.brand_slug !== brandSlug || seen.has(row.name)) continue;
    seen.add(row.name);
    out.push(row.name);
  }
  return out.sort((a, b) => a.localeCompare(b, "sq"));
}

function filterCuratedByBrand(curated: readonly string[], brandSlug: string): string[] {
  const prefix = KAMIONE_BRAND_MODEL_PREFIX[brandSlug];
  if (prefix) {
    const filtered = curated.filter((m) => m.startsWith(prefix));
    if (filtered.length > 0) return filtered;
  }
  return [...curated];
}

/** Union of every curated type list plus API seed rows (deduped). */
export function getAllKamioneModelLabels(modelRows: { brand_slug: string; name: string }[]): string[] {
  const all = new Set<string>();
  for (const list of Object.values(TRUCK_MODELS_BY_TYPE)) {
    for (const name of list) all.add(name);
  }
  for (const row of modelRows) all.add(row.name);
  return [...all].sort((a, b) => a.localeCompare(b, "sq"));
}

export function getKamioneModelsForPicker(opts: {
  typeKey: string | null;
  brandSlug: string | null;
  modelRows: { brand_slug: string; name: string }[];
}): string[] {
  const { typeKey, brandSlug, modelRows } = opts;

  if (isKamioneVehicleTypeKey(typeKey)) {
    const curated = TRUCK_MODELS_BY_TYPE[typeKey];
    if (!brandSlug) return [...curated];
    return filterCuratedByBrand(curated, brandSlug);
  }

  if (brandSlug) {
    const brandList = modelsForBrand(brandSlug, modelRows);
    return brandList.length > 0 ? brandList : getAllKamioneModelLabels(modelRows);
  }

  return getAllKamioneModelLabels(modelRows);
}

/** Display order for brand dropdown / leaf detection under Kamionë & Furgonë hub */
export const KAMION_SEARCH_BRAND_ORDER = [
  "DAF",
  "Iveco",
  "MAN",
  "Mercedes-Benz",
  "Renault",
  "Scania",
  "Volvo",
  "Mitsubishi Fuso",
  "Isuzu",
  "Volkswagen",
  "Ford",
  "Fiat",
] as const;

/** Leaf brand category IDs (hub → marka), excluding `kamione-type-*` rows. */
export function getKamioneBrandLeafCategoryIds(
  categories: { id: number; parent_id: number | null | undefined; slug: string | null | undefined }[],
  kamioneHubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === kamioneHubId &&
        typeof c.slug === "string" &&
        c.slug.startsWith("kamione-") &&
        !c.slug.startsWith("kamione-type-"),
    )
    .map((c) => c.id);
}
