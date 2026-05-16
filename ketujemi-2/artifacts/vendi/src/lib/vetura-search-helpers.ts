/** Leaf brand category ids used for Vetura listings (grandchildren under Vetura). */
export function getVeturaBrandLeafCategoryIds(
  categories: { id: number; parent_id: number | null | undefined }[],
  veturaId: number,
): number[] {
  const bodyIds = new Set(categories.filter((c) => c.parent_id === veturaId).map((c) => c.id));
  return categories.filter((c) => c.parent_id != null && bodyIds.has(c.parent_id)).map((c) => c.id);
}

export const VETURA_BODY_TYPE_KEYS = [
  "sedan",
  "suv",
  "hatch",
  "kombi",
  "kabriolet",
  "kupe",
  "ev",
  "pickup",
] as const;

export type VeturaBodyTypeKey = (typeof VETURA_BODY_TYPE_KEYS)[number];

export type VeturaBodyModelEntry = {
  label: string;
  brand_slug: string;
};

const m = (label: string, brand_slug: string): VeturaBodyModelEntry => ({ label, brand_slug });

/** Exact curated models per body type — do not mix across categories. */
export const VETURA_BODY_MODELS_BY_TYPE: Record<VeturaBodyTypeKey, readonly VeturaBodyModelEntry[]> = {
  sedan: [
    m("Mercedes C-Klasa", "mercedes-benz"),
    m("Mercedes E-Klasa", "mercedes-benz"),
    m("Mercedes S-Klasa", "mercedes-benz"),
    m("BMW Seria 3", "bmw"),
    m("BMW Seria 5", "bmw"),
    m("BMW Seria 7", "bmw"),
    m("Audi A4", "audi"),
    m("Audi A6", "audi"),
    m("Audi A8", "audi"),
    m("VW Passat", "volkswagen"),
    m("VW Jetta", "volkswagen"),
    m("Toyota Camry", "toyota"),
    m("Toyota Corolla", "toyota"),
    m("Skoda Octavia", "skoda"),
    m("Skoda Superb", "skoda"),
    m("Opel Insignia", "opel"),
    m("Opel Vectra", "opel"),
    m("Renault Laguna", "renault"),
    m("Renault Megane Sedan", "renault"),
    m("Peugeot 407", "peugeot"),
    m("Peugeot 508", "peugeot"),
    m("Honda Accord", "honda"),
    m("Honda Civic Sedan", "honda"),
    m("Hyundai Sonata", "hyundai"),
    m("Hyundai Elantra", "hyundai"),
    m("Kia K5", "kia"),
    m("Kia Cerato", "kia"),
  ],
  suv: [
    m("BMW X3", "bmw"),
    m("BMW X5", "bmw"),
    m("BMW X6", "bmw"),
    m("BMW X7", "bmw"),
    m("Mercedes GLC", "mercedes-benz"),
    m("Mercedes GLE", "mercedes-benz"),
    m("Mercedes GLS", "mercedes-benz"),
    m("Audi Q3", "audi"),
    m("Audi Q5", "audi"),
    m("Audi Q7", "audi"),
    m("Audi Q8", "audi"),
    m("VW Tiguan", "volkswagen"),
    m("VW Touareg", "volkswagen"),
    m("Toyota RAV4", "toyota"),
    m("Toyota Land Cruiser", "toyota"),
    m("Toyota Land Cruiser Prado", "toyota"),
    m("Ford Kuga", "ford"),
    m("Ford Explorer", "ford"),
    m("Hyundai Tucson", "hyundai"),
    m("Hyundai Santa Fe", "hyundai"),
    m("Hyundai ix35", "hyundai"),
    m("Kia Sportage", "kia"),
    m("Kia Sorento", "kia"),
    m("Skoda Kodiaq", "skoda"),
    m("Skoda Karoq", "skoda"),
    m("Jeep Cherokee", "jeep"),
    m("Jeep Grand Cherokee", "jeep"),
    m("Jeep Wrangler", "jeep"),
    m("Nissan Qashqai", "nissan"),
    m("Nissan X-Trail", "nissan"),
    m("Mitsubishi Outlander", "mitsubishi"),
    m("Mitsubishi Pajero", "mitsubishi"),
    m("Land Rover Discovery", "land-rover"),
    m("Land Rover Defender", "land-rover"),
    m("Range Rover", "land-rover"),
    m("Range Rover Sport", "land-rover"),
  ],
  hatch: [
    m("VW Golf 4", "volkswagen"),
    m("VW Golf 5", "volkswagen"),
    m("VW Golf 6", "volkswagen"),
    m("VW Golf 7", "volkswagen"),
    m("VW Golf 8", "volkswagen"),
    m("VW Polo", "volkswagen"),
    m("Opel Astra", "opel"),
    m("Opel Corsa", "opel"),
    m("Ford Focus", "ford"),
    m("Ford Fiesta", "ford"),
    m("Skoda Fabia", "skoda"),
    m("Skoda Rapid", "skoda"),
    m("Renault Clio", "renault"),
    m("Renault Megane", "renault"),
    m("Peugeot 206", "peugeot"),
    m("Peugeot 207", "peugeot"),
    m("Peugeot 208", "peugeot"),
    m("Peugeot 308", "peugeot"),
    m("Toyota Yaris", "toyota"),
    m("Toyota Auris", "toyota"),
    m("Hyundai i20", "hyundai"),
    m("Hyundai i30", "hyundai"),
    m("Kia Ceed", "kia"),
    m("Kia Rio", "kia"),
    m("Honda Civic Hatchback", "honda"),
    m("Seat Ibiza", "seat"),
    m("Seat Leon", "seat"),
    m("Mazda 3", "mazda"),
  ],
  kombi: [
    m("VW Touran", "volkswagen"),
    m("VW Sharan", "volkswagen"),
    m("Ford Galaxy", "ford"),
    m("Ford S-Max", "ford"),
    m("Seat Alhambra", "seat"),
    m("Renault Scenic", "renault"),
    m("Renault Grand Scenic", "renault"),
    m("Opel Zafira", "opel"),
    m("Mercedes Vito", "mercedes-benz"),
    m("Mercedes V-Klasa", "mercedes-benz"),
    m("Toyota Verso", "toyota"),
    m("Toyota Alphard", "toyota"),
    m("Chrysler Voyager", "chrysler"),
    m("Kia Carnival", "kia"),
    m("Honda Odyssey", "honda"),
  ],
  kabriolet: [
    m("BMW Seria 4 Cabrio", "bmw"),
    m("BMW Z4", "bmw"),
    m("BMW M3", "bmw"),
    m("BMW M4", "bmw"),
    m("Mercedes SLK", "mercedes-benz"),
    m("Mercedes SL", "mercedes-benz"),
    m("Mercedes AMG GT", "mercedes-benz"),
    m("Audi TT", "audi"),
    m("Audi R8", "audi"),
    m("Porsche 911", "porsche"),
    m("Porsche Boxster", "porsche"),
    m("Porsche Cayman", "porsche"),
    m("Ford Mustang", "ford"),
    m("Mazda MX-5", "mazda"),
    m("Chevrolet Camaro", "chevrolet"),
    m("Ferrari (të gjitha modelet)", "ferrari"),
    m("Lamborghini (të gjitha modelet)", "lamborghini"),
    m("Jaguar F-Type", "jaguar"),
  ],
  kupe: [
    m("BMW Seria 2 Coupe", "bmw"),
    m("BMW Seria 4 Coupe", "bmw"),
    m("BMW M2", "bmw"),
    m("Mercedes CLA", "mercedes-benz"),
    m("Mercedes CLS", "mercedes-benz"),
    m("Mercedes C-Klasa Coupe", "mercedes-benz"),
    m("Audi A3 Sportback", "audi"),
    m("Audi A5 Coupe", "audi"),
    m("VW Scirocco", "volkswagen"),
    m("VW Arteon", "volkswagen"),
    m("Renault Megane Coupe", "renault"),
    m("Honda Civic Coupe", "honda"),
    m("Ford Mustang Fastback", "ford"),
    m("Hyundai Veloster", "hyundai"),
  ],
  ev: [
    m("Tesla Model 3", "tesla"),
    m("Tesla Model Y", "tesla"),
    m("Tesla Model S", "tesla"),
    m("Tesla Model X", "tesla"),
    m("BMW i3", "bmw"),
    m("BMW i4", "bmw"),
    m("BMW iX", "bmw"),
    m("Mercedes EQC", "mercedes-benz"),
    m("Mercedes EQA", "mercedes-benz"),
    m("Mercedes EQB", "mercedes-benz"),
    m("Audi e-tron", "audi"),
    m("Audi Q4 e-tron", "audi"),
    m("VW ID.3", "volkswagen"),
    m("VW ID.4", "volkswagen"),
    m("VW ID.5", "volkswagen"),
    m("Hyundai Ioniq 5", "hyundai"),
    m("Hyundai Ioniq 6", "hyundai"),
    m("Hyundai Kona Electric", "hyundai"),
    m("Kia EV6", "kia"),
    m("Kia Niro Electric", "kia"),
    m("Renault Zoe", "renault"),
    m("Renault Megane E-Tech", "renault"),
    m("Toyota Prius", "toyota"),
    m("Toyota Yaris Hybrid", "toyota"),
    m("Toyota RAV4 Hybrid", "toyota"),
    m("Ford Kuga PHEV", "ford"),
    m("Ford Mustang Mach-E", "ford"),
    m("Nissan Leaf", "nissan"),
    m("Volvo XC40 Electric", "volvo"),
    m("Volvo C40", "volvo"),
    m("Peugeot e-208", "peugeot"),
    m("Peugeot e-2008", "peugeot"),
    m("Fiat 500e", "fiat"),
  ],
  pickup: [
    m("Ford Ranger", "ford"),
    m("Ford F-150", "ford"),
    m("Toyota Hilux", "toyota"),
    m("Toyota Tundra", "toyota"),
    m("Mitsubishi L200", "mitsubishi"),
    m("Nissan Navara", "nissan"),
    m("Nissan Frontier", "nissan"),
    m("Mercedes X-Klasa", "mercedes-benz"),
    m("VW Amarok", "volkswagen"),
    m("Isuzu D-Max", "isuzu"),
    m("Fiat Fullback", "fiat"),
    m("Renault Alaskan", "renault"),
    m("SsangYong Musso", "ssangyong"),
  ],
};

let _allLabelsCache: string[] | null = null;

/** All curated Vetura models (deduplicated), sorted. */
export function getVeturaAllModelLabels(): string[] {
  if (_allLabelsCache) return _allLabelsCache;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const key of VETURA_BODY_TYPE_KEYS) {
    for (const entry of VETURA_BODY_MODELS_BY_TYPE[key]) {
      if (!seen.has(entry.label)) {
        seen.add(entry.label);
        out.push(entry.label);
      }
    }
  }
  _allLabelsCache = out.sort((a, b) => a.localeCompare(b, "sq"));
  return _allLabelsCache;
}

function labelsFromEntries(
  entries: readonly VeturaBodyModelEntry[],
  brandSlug: string | null,
): string[] {
  const filtered = brandSlug
    ? entries.filter((e) => e.brand_slug === brandSlug)
    : entries;
  return filtered.map((e) => e.label).sort((a, b) => a.localeCompare(b, "sq"));
}

/**
 * Models for the picker dropdown.
 * - No body type: all curated models (optionally filtered by brand).
 * - With body type: only that category's models (optionally filtered by brand).
 */
export function getVeturaModelsForPicker(opts: {
  bodyKey: VeturaBodyTypeKey | null;
  brandSlug: string | null;
}): string[] {
  const { bodyKey, brandSlug } = opts;

  if (bodyKey) {
    return labelsFromEntries(VETURA_BODY_MODELS_BY_TYPE[bodyKey], brandSlug);
  }

  if (brandSlug) {
    const combined: VeturaBodyModelEntry[] = [];
    for (const key of VETURA_BODY_TYPE_KEYS) {
      combined.push(
        ...VETURA_BODY_MODELS_BY_TYPE[key].filter((e) => e.brand_slug === brandSlug),
      );
    }
    const seen = new Set<string>();
    return combined
      .map((e) => e.label)
      .filter((label) => {
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      })
      .sort((a, b) => a.localeCompare(b, "sq"));
  }

  return getVeturaAllModelLabels();
}

export function isVeturaModelAllowedForBody(
  modelName: string,
  bodyKey: VeturaBodyTypeKey | null,
  brandSlug: string | null,
): boolean {
  const trimmed = modelName.trim();
  if (!trimmed) return true;
  const allowed = getVeturaModelsForPicker({ bodyKey, brandSlug });
  return allowed.includes(trimmed);
}
